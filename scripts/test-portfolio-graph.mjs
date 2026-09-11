const baseUrl = process.env.WALLETOS_LOCAL_URL || "http://127.0.0.1:48745";
const WALLETOS_WALLETS = [{ "address": "0xF7dCC5C6ADe20E886c2B168a2d71D01d1f62c0CC", "chainId": "0x2105", "source": "MetaMask" }];
const { spawnSync } = await import("node:child_process");


function readWallets() {
  const raw = process.env.WALLETOS_WALLETS || process.env.WALLETOS_WALLET || "";
  if (!raw && WALLETOS_WALLETS.length === 0) {
    throw new Error(
      "Set WALLETOS_WALLETS to a JSON array, for example: "
      + "WALLETOS_WALLETS='[{\"address\":\"0x...\",\"chainId\":\"0x1\",\"source\":\"MetaMask\"}]'"
    );
  }

  const wallets = raw ? JSON.parse(raw) : WALLETOS_WALLETS;
  if (!Array.isArray(wallets) || wallets.length === 0) {
    throw new Error("WALLETOS_WALLETS must be a non-empty JSON array.");
  }

  for (const wallet of wallets) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(wallet?.address || ""))) {
      throw new Error(`Invalid wallet address: ${wallet?.address || "missing"}`);
    }
    if (!String(wallet.chainId || "").trim()) {
      throw new Error(`Missing chainId for wallet ${wallet.address}.`);
    }
  }

  return wallets.map((wallet) => ({
    address: wallet.address,
    chainId: wallet.chainId,
    source: wallet.source || "browser wallet"
  }));
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(180_000),
    headers: { "content-type": "application/json", ...(options.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

try {
  const wallets = readWallets();
  const health = await request("/health");
  if (health.ok !== true || health.status !== "ready") {
    throw new Error(`WalletOS local server is not ready: ${JSON.stringify(health)}`);
  }

  const factsProcess = spawnSync("node", ["packages/portfolio-intelligence/bin/walletos-portfolio.mjs"], {
    env: {
      ...process.env,
      WALLETOS_WALLETS: JSON.stringify(wallets),
      WALLETOS_GRAPH_NETWORKS: "base"
    },
    encoding: "utf8"
  });
  if (factsProcess.status !== 0) {
    const factsOutput = parseJson(factsProcess.stdout.trim());
    const failure = factsOutput?.failures?.[0]?.error || factsOutput?.error || factsProcess.stderr.trim();
    throw new Error(`Portfolio intelligence failed: ${failure || "unknown package error"}`);
  }
  const portfolioFacts = JSON.parse(factsProcess.stdout.trim());

  const task = {
    protocolVersion: 1,
    taskId: `portfolio_graph_${Date.now()}`,
    type: "portfolio_analysis",
    agent: process.env.WALLETOS_AGENT || "copilot",
    intent: "Analyze my portfolio across all connected wallets. Use The Graph before making any conclusion or execution plan.",
    context: {
      wallets,
      portfolio_facts: portfolioFacts,
      page: null,
      interaction: null
    },
    skills: ["the-graph-onchain"],
    model: process.env.WALLETOS_MODEL || "default"
  };

  const response = await request("/codex", {
    method: "POST",
    body: JSON.stringify(task)
  });

  if (response.ok !== true || response.taskId !== task.taskId || response.status !== "completed") {
    throw new Error(`Invalid WalletOS response: ${JSON.stringify(response)}`);
  }

  const result = response.result || parseJson(response.text || response.message);
  const evidence = result?.evidence || {};
  const hasBalanceFacts = portfolioFacts.balances.some((balance) =>
    Boolean(balance?.native?.balanceWei)
    || (Array.isArray(balance?.erc20) && balance.erc20.length > 0)
  );
  const hasGraphFacts = Boolean(
    evidence.subgraphs_inspected?.length
    || evidence.positions?.length
    || evidence.activity?.length
  );
  if (result?.type !== "portfolio_analysis" || (!hasBalanceFacts && !hasGraphFacts)) {
    throw new Error(
      "Portfolio analysis did not include verified Alchemy or The Graph evidence. "
      + `Agent result: ${JSON.stringify(result || response)}`
    );
  }

  console.log("WalletOS The Graph portfolio test passed.");
  console.log(`Wallets supplied: ${wallets.length}`);
  console.log(`Codex response: ${response.message || response.text || JSON.stringify(response)}`);
} catch (error) {
  console.error(`WalletOS The Graph portfolio test failed: ${error.message}`);
  if (/local server|bridge|48745/i.test(error.message)) {
    console.error("Start walletos_app first with: bun run tauri:dev");
  }
  process.exitCode = 1;
}

function parseJson(value) {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return null;
  }
}
