#!/usr/bin/env node

const DEFAULT_API_URL = "http://127.0.0.1:5000";

function usage() {
  console.log("Usage: walletos-ledger <sync|apdu> [hex-apdu] [--api-url http://127.0.0.1:5000]");
}

function getArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return body;
}

async function syncLedger(apiUrl) {
  await requestJson(`${apiUrl}/events`);
  return {
    type: "ledger_sync",
    transport: "speculos-rest",
    connected: true,
    apiUrl
  };
}

async function sendApdu(apiUrl, hexApdu) {
  if (!/^[0-9a-fA-F]+$/.test(hexApdu || "")) {
    throw new Error("APDU must be a hex string.");
  }
  return requestJson(`${apiUrl}/apdu`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: hexApdu })
  });
}

async function main() {
  const command = process.argv[2];
  const apiUrl = getArgValue("--api-url", process.env.WALLETOS_LEDGER_API_URL || DEFAULT_API_URL);

  if (command === "sync") {
    console.log(JSON.stringify(await syncLedger(apiUrl), null, 2));
    return;
  }

  if (command === "apdu") {
    console.log(JSON.stringify(await sendApdu(apiUrl, process.argv[3]), null, 2));
    return;
  }

  usage();
  process.exit(command ? 1 : 0);
}

main().catch((error) => {
  console.error(JSON.stringify({
    type: "ledger_error",
    message: error.message
  }, null, 2));
  process.exit(1);
});
