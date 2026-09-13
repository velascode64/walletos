# Extending WalletOS

WalletOS grows through small capability blocks: skills, packages, MCP configs, and CLIs. Keep the core runtime boring; add specialized behavior at the edges.

## Extension Points

```text
extension/
  src/background/service-worker.js  task routing
  src/sidepanel/App.js              user surface

runtime/.agents/skills/
  <skill>/SKILL.md                  agent instructions
  <skill>/walletos.plugin.json      discovery metadata

packages/
  <package>/bin/*                   deterministic CLIs
  <package>/mcp.json                MCP config
  <package>/walletos.plugin.json    package capabilities
```

## What A Skill Does

A skill tells Codex:

- when to use a capability
- which command, MCP, or API is available
- what evidence to collect
- what output shape to return
- what safety limits apply

Skills should be explicit. If the agent should call a CLI, write the exact command in `SKILL.md`.

## What A Package Does

A package is executable or deterministic. It should produce facts, not vibes.

Use packages for:

- API collectors
- protocol-specific CLIs
- transaction decoders
- simulations
- quote fetchers
- wallet sync helpers
- MCP configs

Good package output is JSON the agent can treat as evidence.

## Deterministic First

When adding a capability, ask:

1. Can code fetch this fact reliably?
2. Can a package expose it as JSON?
3. Can a skill tell the agent when to call it?
4. Can WalletOS policy decide whether execution is allowed?

Only then let the agent reason over the result.

## Add A CLI Skill

Create the CLI:

```text
packages/example/bin/walletos-example.mjs
```

Return JSON:

```js
console.log(JSON.stringify({
  type: "example_result",
  status: "complete",
  evidence: []
}));
```

Create the skill:

```text
runtime/.agents/skills/example/SKILL.md
runtime/.agents/skills/example/walletos.plugin.json
```

In `SKILL.md`, include the command:

```bash
node packages/example/bin/walletos-example.mjs inspect
```

Declare it:

```json
{
  "name": "example",
  "version": "0.1.0",
  "skill": "./SKILL.md",
  "requires": {
    "cli": ["node"],
    "mcp": [],
    "env": []
  },
  "capabilities": ["example.inspect"]
}
```

Route it in `extension/src/background/service-worker.js`:

```js
const skills = needsExample ? ["example"] : [];
```

## Add An MCP Skill

Put MCP config in `mcp.json`:

```json
{
  "name": "example-mcp",
  "transport": "sse",
  "url": "https://example.com/mcp",
  "authentication": {
    "type": "bearer",
    "env": "EXAMPLE_API_KEY"
  }
}
```

Mention the MCP in `walletos.plugin.json`:

```json
{
  "requires": {
    "mcp": ["example-mcp"],
    "env": ["EXAMPLE_API_KEY"]
  }
}
```

Tell the agent in `SKILL.md` which tools to use and what must be verified before output.

## Current Sponsor Blocks

The Graph:

- `packages/the-graph-onchain`
- `packages/portfolio-intelligence`
- used for subgraph discovery, schema inspection, wallet activity, and portfolio evidence

Privy:

- `runtime/.agents/skills/privy-agents`
- used for agent wallet login, funding, listing, signing, and transaction actions under policy

Ledger:

- `runtime/.agents/skills/ledger-cli`
- `packages/ledger/bin/walletos-ledger.mjs`
- used for Ledger-compatible sync and Speculos/APDU development testing

## Runtime Rules

The local server loads requested skills and injects their manifests/instructions into the Codex task. Do not put every integration into the base prompt. Route only the skills needed for the current task.

Execution still follows WalletOS policy:

- analysis can be automatic
- preparation can be automatic when safe
- signing/broadcasting requires explicit delegated policy or user approval

## Tests

For a new skill/package, add one small check:

- `node --check` for JS CLIs
- a focused script test for deterministic JSON output
- a Rust discovery test if the runtime must load the skill

Run:

```bash
bun run test:run
cd src-tauri && cargo test
```
