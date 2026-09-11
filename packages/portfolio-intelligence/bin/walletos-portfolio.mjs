#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const NETWORKS = {
  "0x1": "eth-mainnet",
  "0xa": "opt-mainnet",
  "0x89": "polygon-mainnet",
  "0x2105": "base-mainnet",
  "0xa4b1": "arb-mainnet"
};
const GRAPH_NETWORKS = {
  "0x1": "mainnet",
  "0xa": "optimism",
  "0x89": "matic",
  "0x2105": "base",
  "0xa4b1": "arbitrum-one"
};
const GRAPH_API_URL = "https://token-api.thegraph.com";

function loadProjectEnv() {
  for (const parent of [process.cwd(), ...ancestors(process.cwd())]) {
    const envPath = path.join(parent, ".env");
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
    return;
  }
}

function ancestors(directory) {
  const result = [];
  let current = path.resolve(directory);
  while (path.dirname(current) !== current) {
    current = path.dirname(current);
    result.push(current);
  }
  return result;
}

function parseWallets(value) {
  const raw = value || "";
  const parsed = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("WALLETOS_WALLETS must be a non-empty JSON array.");
  }

  return parsed.map((wallet) => {
    const address = String(wallet?.address || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error(`Invalid wallet address: ${address || "missing"}`);
    }
    return {
      address,
      chainId: String(wallet.chainId || "").trim(),
      source: wallet.source || "browser wallet"
    };
  });
}

async function alchemyRequest({ apiKey, network, method, params }) {
  const response = await fetch(`https://${network}.g.alchemy.com/v2/${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    signal: AbortSignal.timeout(45_000)
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Alchemy ${network} returned HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  if (body.error) throw new Error(`Alchemy ${method}: ${body.error.message || JSON.stringify(body.error)}`);
  return body.result;
}

async function fetchBalances({ apiKey, network, address }) {
  const nativeBalance = await alchemyRequest({
    apiKey,
    network,
    method: "eth_getBalance",
    params: [address, "latest"]
  });
  const tokenBalances = await alchemyRequest({
    apiKey,
    network,
    method: "alchemy_getTokenBalances",
    params: [address, "erc20"]
  });

  return {
    native: { symbol: "ETH", network, wallet: address, balanceWei: nativeBalance },
    erc20: (tokenBalances?.tokenBalances || [])
      .filter((item) => item.tokenBalance && !/^0x0+$/.test(item.tokenBalance))
      .map((item) => ({
        network,
        wallet: address,
        tokenAddress: item.contractAddress,
        balanceRaw: item.tokenBalance
      }))
  };
}

async function fetchGraphTransfers({ apiKey, network, address }) {
  const params = new URLSearchParams({ network, address, limit: "100", page: "1" });
  const response = await fetch(`${GRAPH_API_URL}/v1/evm/transfers?${params}`, {
    headers: { authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(45_000)
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`The Graph ${network} returned HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  return Array.isArray(body?.data) ? body.data.map((transfer) => ({
    network,
    wallet: address,
    contract: transfer.contract || "",
    symbol: transfer.symbol || "",
    amount: transfer.amount || transfer.value || "",
    direction: transfer.direction || "",
    timestamp: transfer.timestamp || transfer.blockTimestamp || ""
  })) : [];
}

async function inspectPortfolio() {
  loadProjectEnv();
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is required for portfolio intelligence.");
  }

  const wallets = parseWallets(process.env.WALLETOS_WALLETS || process.env.WALLETOS_WALLET);
  const graphApiKey = process.env.THE_GRAPH_API_KEY || process.env.THEGRAPH_API_KEY;
  const networks = wallets.map((wallet) => NETWORKS[wallet.chainId]).filter(Boolean);
  const balances = [];
  const activity = [];
  const failures = [];
  const graphFailures = [];

  for (const wallet of wallets) {
    const network = NETWORKS[wallet.chainId];
    if (!network) {
      failures.push({ wallet: wallet.address, network: wallet.chainId, error: "Unsupported network" });
      continue;
    }
    try {
      const result = await fetchBalances({ apiKey, network, address: wallet.address });
      balances.push(result);
    } catch (error) {
      failures.push({ wallet: wallet.address, network, error: error.message });
    }
    const graphNetwork = GRAPH_NETWORKS[wallet.chainId];
    if (graphApiKey && graphNetwork) {
      try {
        activity.push(...await fetchGraphTransfers({ apiKey: graphApiKey, network: graphNetwork, address: wallet.address }));
      } catch (error) {
        graphFailures.push({ wallet: wallet.address, network: graphNetwork, error: error.message });
      }
    } else {
      graphFailures.push({ wallet: wallet.address, network: graphNetwork || wallet.chainId, error: "THE_GRAPH_API_KEY is not configured" });
    }
  }

  const facts = {
    type: "portfolio_facts",
    version: "0.1.0",
    source: "alchemy+the-graph-data-api",
    status: failures.length === wallets.length ? "failed" : (failures.length ? "partial" : "complete"),
    wallets,
    networks,
    balances,
    transfers: activity,
    protocol_positions: [],
    activity,
    data_sources: [
      ...networks.map((network) => `https://${network}.g.alchemy.com/v2`),
      ...(graphApiKey ? [GRAPH_API_URL] : [])
    ],
    missing_data: [
      "Token metadata and USD prices are not fetched in this demo package.",
      "Protocol-specific DeFi positions are not included in this demo snapshot."
    ],
    failures: [...failures, ...graphFailures]
  };

  return facts;
}

try {
  const facts = await inspectPortfolio();
  process.stdout.write(`${JSON.stringify(facts)}\n`);
  process.exitCode = facts.status === "failed" ? 1 : 0;
} catch (error) {
  process.stderr.write(`${JSON.stringify({ type: "portfolio_facts_error", error: error.message })}\n`);
  process.exitCode = 1;
}
