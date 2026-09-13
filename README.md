# WalletOS

WalletOS is an intelligent operating layer for crypto wallets.

It sits between Web3 dApps, browser wallets, local AI agents, and specialized WalletOS Skills so users can understand wallet actions before they approve them. WalletOS is not a wallet, custody provider, exchange, or trading bot. The agent analyzes and prepares; the wallet signs; the user stays in control.

Product definitions live in [`docs/project-definition/`](docs/project-definition/).

## Problem

Crypto wallets show raw blockchain operations but rarely explain intent, risk, or context. Users are asked to approve signatures, token permissions, claims, bridges, swaps, and contract calls without enough information about what the action actually does.

WalletOS solves this by detecting meaningful Web3 interactions, collecting page and wallet context, routing the task to a local agent, and using skills/plugins to return a clear verdict or prepared action.

## Goal

WalletOS aims to make wallet workflows safer and more autonomous without removing user approval:

- analyze transactions and signatures before signing
- investigate dApps, contracts, claims, and rewards
- inspect portfolios across wallets and chains
- prepare multi-step wallet actions
- keep signing inside the user's wallet or explicitly connected agent-wallet infrastructure

## Architecture

```text
dApp / Browser
  -> WalletOS Browser Extension
  -> WalletOS Companion
  -> Codex agent runtime
  -> WalletOS Skills
  -> MCPs / CLIs / APIs
  -> WalletOS Extension
  -> Wallet / User Approval
```

The browser extension is the contextual surface: it observes dApps, captures wallet requests, shows agent progress, and routes the user back to their wallet.

The Tauri companion is the local runtime: it receives extension requests, launches `codex exec`, loads installed skills, and returns structured results without exposing private keys.

## Technologies

- Tauri, Rust
- React, TypeScript, Vite
- Chrome Extension Manifest V3, Side Panel API, Native Messaging
- Codex CLI
- WalletOS Skills loaded from `runtime/.agents/skills`
- Node.js/Bun scripts for local tooling
- The Graph Subgraph MCP and Data API
- Privy Agent Wallet CLI
- Ledger / Speculos CLI integration

## Sponsors and Integrations

- **The Graph**: onchain intelligence for dApp investigation, subgraph discovery, wallet activity, and portfolio context.
- **Privy**: agent wallet capability through Privy Agent Wallet CLI for login, wallet listing, funding, signing, and transaction execution under WalletOS policy.
- **Ledger**: Ledger-compatible development flow through the WalletOS Ledger CLI and Speculos/APDU testing.

## Plugins and Packages

WalletOS is extended through skills and packages:

```text
runtime/.agents/skills/
  <skill>/
    SKILL.md
    walletos.plugin.json

packages/
  <package>/
    bin/
    SKILL.md
    walletos.plugin.json
    mcp.json
```

`SKILL.md` tells the agent when and how to use a capability. `walletos.plugin.json` declares metadata, requirements, and capabilities. Packages can expose CLIs, MCP configuration, deterministic data collectors, or agent instructions.

Current core skills include:

- `claimos-security`
- `site-investigation`
- `the-graph-onchain`
- `portfolio-intelligence`
- `wallet-operator`
- `privy-agents`
- `ledger-cli`

To add a new skill, create a folder with `SKILL.md` and `walletos.plugin.json`, then include the skill name in the task routing logic when that capability should participate.

## Installation

Prerequisites:

- Node.js
- Bun
- Rust
- Chrome or Chromium browser
- Codex CLI

```bash
git clone https://github.com/velascode64/walletos.git
cd walletos
bun install
bun run tauri:dev
```

Load the extension from `extension/` in Chrome Developer Mode, then start the WalletOS companion with `bun run tauri:dev`.

Optional integrations:

```bash
export THEGRAPH_API_KEY=...
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet login
node packages/ledger/bin/walletos-ledger.mjs sync
```

## Contributing

Contributions are welcome. Good first areas:

- new WalletOS Skills
- better transaction and signature analysis
- more wallet/provider support
- safer action preparation
- sponsor integrations
- documentation and examples

Keep changes small, testable, and aligned with the product definitions in [`docs/project-definition/`](docs/project-definition/).

## License

MIT. See [`LICENSE.md`](LICENSE.md).
