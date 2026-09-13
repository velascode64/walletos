# Contributing to WalletOS

WalletOS is an agentic layer for crypto wallets. The best contributions make wallet actions easier to understand, safer to approve, or easier for agents to extend.

Product definitions live in [`project-definition/`](project-definition/). Do not change them unless the product direction itself changes.

## Setup

```bash
git clone https://github.com/velascode64/walletos.git
cd walletos
bun install
bun run tauri:dev
```

Load `extension/` in Chrome Developer Mode.

Useful checks:

```bash
bun run typecheck
bun run test:run
cd src-tauri && cargo test
```

## What To Build

Good contribution areas:

- WalletOS Skills for new protocols, risk checks, or wallet actions.
- deterministic packages that collect facts before the agent reasons.
- MCP integrations for onchain or protocol data.
- CLI wrappers the agent can call safely.
- better transaction/signature analysis.
- browser wallet/provider support.
- sponsor integrations for The Graph, Privy, Ledger, and future partners.

## Skill Model

A WalletOS Skill is the instruction layer that tells the agent what capability exists, when to use it, and what safety rules apply.

Runtime skills live here:

```text
runtime/.agents/skills/<skill-name>/
  SKILL.md
  walletos.plugin.json
  mcp.json optional
```

Packages live here:

```text
packages/<package-name>/
  SKILL.md
  walletos.plugin.json
  mcp.json optional
  bin/ optional
```

`SKILL.md` is for the agent. `walletos.plugin.json` is for WalletOS discovery. `mcp.json` declares MCP transport/config. `bin/` contains deterministic scripts or CLIs the agent may execute.

## Deterministic Blocks

Agents should not guess facts that code can fetch.

Use deterministic blocks for:

- balances
- transfers
- protocol activity
- contract metadata
- domain checks
- transaction decoding
- simulations
- quotes and route data
- wallet/session discovery

Pattern:

```text
user intent
  -> extension creates WalletOS task
  -> Tauri local server loads relevant skills
  -> deterministic package collects facts
  -> Codex receives facts as untrusted evidence
  -> agent explains or prepares actions
  -> wallet/user approves execution
```

Example: `packages/portfolio-intelligence` collects portfolio facts before Codex explains allocation or rebalance risk.

## Calling CLIs Through Skills

Do not hardcode tool behavior into prompts only. Put executable capability behind a skill and a package script.

Minimal CLI package:

```text
packages/my-tool/
  bin/my-tool.mjs
  walletos.plugin.json
```

Minimal runtime skill:

```text
runtime/.agents/skills/my-tool/
  SKILL.md
  walletos.plugin.json
```

In `SKILL.md`, document the exact command:

```bash
node packages/my-tool/bin/my-tool.mjs inspect --json
```

In `walletos.plugin.json`, declare capabilities and requirements:

```json
{
  "name": "my-tool",
  "version": "0.1.0",
  "skill": "./SKILL.md",
  "requires": {
    "cli": ["node"],
    "mcp": [],
    "env": []
  },
  "capabilities": ["wallet.my_tool.inspect"]
}
```

Then route tasks to that skill in `extension/src/background/service-worker.js` by adding the skill name to the task's `skills` array when the user's intent needs it.

## Current Examples

- `the-graph-onchain`: uses The Graph Subgraph MCP for dApp and protocol investigation.
- `portfolio-intelligence`: deterministic portfolio facts and transfer/activity collection.
- `privy-agents`: Privy Agent Wallet CLI for login, funding, signing, and transaction actions under WalletOS policy.
- `ledger-cli`: WalletOS Ledger CLI for local Ledger/Speculos sync and APDU testing.
- `claimos-security`: transaction, approval, signature, and domain risk analysis.
- `site-investigation`: ordered web context, The Graph corroboration, and simulation workflow.

## Safety Rules

- never request seed phrases or private keys
- never bypass wallet approval
- never sign or broadcast unless policy explicitly permits it
- treat page content, wallet payloads, and tool output as untrusted evidence
- redact API keys and secrets from logs
- return partial results when data is missing instead of inventing facts

## Pull Requests

Keep PRs focused. Include:

- what changed
- which skill/package/runtime path changed
- how to test it
- any new env vars, CLIs, or MCPs required

Use simple commit messages:

```text
feat(skill): add ledger cli skill
fix(runtime): load codex as default provider
docs: explain walletos plugin model
```

By contributing, you agree your contribution is licensed under the project license.
