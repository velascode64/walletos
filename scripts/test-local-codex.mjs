const baseUrl = process.env.WALLETOS_LOCAL_URL || "http://127.0.0.1:48745";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(120_000),
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

try {
  const health = await request("/health");
  if (health.ok !== true || health.status !== "ready") {
    throw new Error(`WalletOS local server is not ready: ${JSON.stringify(health)}`);
  }

  const response = await request("/codex", {
    method: "POST",
    body: JSON.stringify({
      goal: "Who are you? Reply briefly and identify yourself as Codex.",
      model: process.env.CODEX_MODEL || "gpt-5.5"
    })
  });

  if (response.ok !== true || typeof response.text !== "string" || response.text.trim() === "") {
    throw new Error(`Codex returned an invalid response: ${JSON.stringify(response)}`);
  }

  console.log("WalletOS local HTTP test passed.");
  console.log(`Codex response: ${response.text.trim()}`);
} catch (error) {
  console.error(`WalletOS local HTTP test failed: ${error.message}`);
  console.error("Start walletos_app first with: bun run tauri:dev");
  process.exitCode = 1;
}