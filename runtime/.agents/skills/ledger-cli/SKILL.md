---
name: ledger-cli
description: Use the WalletOS Ledger CLI to sync a local Ledger-compatible device session and send APDUs through Speculos REST during development.
version: 0.1.0
---

# Ledger CLI

Use this skill when the user asks WalletOS to sync Ledger, test Ledger signing flows, inspect a Ledger app response, or send APDUs to a Ledger-compatible development device.

The WalletOS Ledger CLI is:

```bash
node packages/ledger/bin/walletos-ledger.mjs <sync|apdu>
```

## Sync Ledger

Use `sync` to check the local Speculos REST API and return a JSON status object:

```bash
node packages/ledger/bin/walletos-ledger.mjs sync
```

The command uses `WALLETOS_LEDGER_API_URL` or defaults to `http://127.0.0.1:5000`.

## Send APDU

Use `apdu` only when the user or workflow supplies a known APDU:

```bash
node packages/ledger/bin/walletos-ledger.mjs apdu e0c0000004
```

The CLI posts to `/apdu` on the configured Speculos REST API.

## Safety

Treat Ledger sync as device/session discovery. Never claim a transaction was signed unless the CLI returns a successful response and WalletOS policy allows the action.
