# WalletOS — Technical Architecture Document

## 1. Goal

WalletOS is a local agentic layer for crypto wallets.

It connects:

- browser dApps
- browser wallets
- local AI agents such as Codex
- WalletOS Skills
- MCPs / CLIs / APIs

WalletOS never holds private keys and never signs transactions itself.

The wallet remains the signing authority.

---

## 2. Core Architecture

```text
dApp / Browser
      ↓
WalletOS Browser Extension
      ↓
WalletOS Companion (Tauri)
      ↓
Agent Runtime
      ↓
Codex
      ↓
WalletOS Skill Router
      ↓
Skills → MCPs / CLIs / APIs
      ↓
Structured Result / Prepared Action
      ↓
WalletOS Extension
      ↓
MetaMask / Wallet
      ↓
User Approval
```

---

## 3. Components

### 3.1 WalletOS Browser Extension

The browser-facing layer.

Responsibilities:

- detect the active dApp
- capture page context
- discover the active EVM wallet/provider
- observe EIP-1193 wallet requests
- read connected account and chain
- send context/tasks to WalletOS Companion
- display agent responses
- request prepared actions from the wallet
- never sign or store private keys

Internal modules:

```text
extension/
├── page-context
├── wallet-provider
├── wallet-events
├── agent-client
├── action-executor
└── ui
```

---

### 3.2 WalletOS Companion

Local Tauri application.

This is the bridge and runtime between the browser and local agents.

Responsibilities:

- receive messages from the browser extension
- detect installed agents
- launch Codex
- maintain agent/task state
- expose installed WalletOS Skills
- pass structured context to the agent
- receive structured responses
- stream task progress back to the extension
- return prepared wallet actions

Internal modules:

```text
companion/
├── browser-bridge
├── agent-runtime
├── skill-registry
├── task-router
├── process-manager
└── result-stream
```

---

## 4. Agent Runtime

Initial supported agent:

`Codex`

Future adapters:

- Claude Code
- Hermes
- other local agents

All agents must implement the same WalletOS adapter contract.

```ts
interface AgentAdapter {
  isAvailable(): Promise<boolean>
  startTask(task: AgentTask): Promise<TaskHandle>
  cancelTask(taskId: string): Promise<void>
}
```

Codex is only one implementation.

---

## 5. Invoking Codex

WalletOS Companion launches Codex locally.

Conceptually:

```text
Tauri
→ spawn local process
→ codex exec
→ WalletOS system prompt
→ task context
→ available skills
```

Do not put Web3 logic inside the Codex runner.

The runner should only:

1. build the task payload
2. invoke Codex
3. stream output
4. parse WalletOS protocol messages

Example input:

```json
{
  "taskId": "task_123",
  "type": "transaction_review",
  "intent": "Tell me if I should sign this transaction",
  "context": {
    "page": {},
    "wallet": {},
    "interaction": {}
  },
  "skills": [
    "claimos-security"
  ]
}
```

Codex receives a persistent WalletOS instruction telling it:

- it is operating as a wallet-specialized agent
- use installed skills when appropriate
- never sign directly
- return user-facing analysis separately from executable actions
- all executable actions must follow the WalletOS Action Protocol

---

## 6. WalletOS Skills

Do not call these browser extensions.

Use the term:

`WalletOS Skill`

A Skill extends what the agent can do.

Examples:

```text
claimos-security
portfolio-intelligence
risk-analysis
rebalance
defi-scout
claim-discovery
```

Suggested package structure:

```text
skills/
└── claimos-security/
    ├── SKILL.md
    ├── manifest.json
    ├── prompts/
    ├── mcp.json
    └── commands/
```

Example manifest:

```json
{
  "name": "claimos-security",
  "version": "0.1.0",
  "description": "Analyze Web3 pages, contracts and wallet interactions",
  "capabilities": [
    "transaction.review",
    "contract.inspect",
    "domain.inspect"
  ],
  "tools": {
    "cli": ["claimos"],
    "mcp": ["claimos"]
  }
}
```

`SKILL.md` tells Codex when and how to use the skill.

`manifest.json` is for WalletOS discovery, permissions and metadata.

---

## 7. Skill Registry

WalletOS Companion maintains a local registry:

```text
WalletOS Skill Registry
├── ClaimOS Security
├── Portfolio Intelligence
└── Rebalance
```

Codex should receive the installed skill list at task start.

Codex chooses the required skill based on the user's intent.

Example:

```text
"Is this claim safe?"
→ claimos-security

"Analyze all my wallets"
→ portfolio-intelligence

"Rebalance my portfolio"
→ portfolio-intelligence + risk-analysis + rebalance
```

---

## 8. Browser → Agent Context Protocol

All tasks sent from the extension should use one common envelope.

```ts
interface WalletOSTask {
  taskId: string
  type: string
  intent: string

  context: {
    page?: {
      url: string
      title?: string
      text?: string
    }

    wallet?: {
      address?: string
      chainId?: string
    }

    interaction?: {
      rpcMethod?: string
      params?: unknown[]
      to?: string
      value?: string
      data?: string
    }
  }
}
```

The extension gathers context.

The agent interprets it.

Skills add specialized capabilities.

---

## 9. Agent → WalletOS Response Protocol

Codex must communicate with WalletOS using structured messages.

```ts
interface WalletOSResponse {
  taskId: string

  status:
    | "thinking"
    | "needs_input"
    | "completed"
    | "failed"

  message?: string

  actions?: WalletAction[]
}
```

This separates conversation from execution.

Example:

```json
{
  "taskId": "task_123",
  "status": "completed",
  "message": "Your portfolio has excessive ETH exposure.",
  "actions": [
    {
      "type": "wallet.transaction",
      "label": "Swap 1 ETH to USDC",
      "chainId": "0x2105",
      "transaction": {
        "to": "0x...",
        "value": "0x0",
        "data": "0x..."
      },
      "requiresUserApproval": true
    }
  ]
}
```

---

## 10. Wallet Action Protocol

WalletOS must use a generic action format.

Initial action types:

```text
wallet.transaction
wallet.signature
wallet.switch_chain
wallet.connect
```

Example:

```ts
interface WalletAction {
  id: string
  type: "wallet.transaction"

  label: string
  chainId: string

  transaction: {
    from?: string
    to: string
    value?: string
    data?: string
  }

  requiresUserApproval: true
}
```

Execution flow:

```text
Codex prepares action
       ↓
WalletOS validates schema
       ↓
Extension receives action
       ↓
Extension calls wallet provider
       ↓
MetaMask opens confirmation
       ↓
User approves / rejects
```

WalletOS does not bypass wallet confirmation.

---

## 11. Communication Channels

### Browser Extension ↔ Companion

For the hackathon:

```text
localhost WebSocket / HTTP
```

Later:

```text
Native Messaging
```

Use a single protocol independent of transport so the transport can change later.

### Companion ↔ Codex

Local process execution.

### Codex ↔ Skills

Through:

- SKILL.md instructions
- MCP
- CLI
- local scripts

### Extension ↔ Wallet

EIP-1193 initially.

MetaMask is the first supported wallet.

---

## 12. MVP Scope

### Wallet

MetaMask only.

### Agent

Codex only.

### Chains

EVM only.

### Skills

1. ClaimOS Security
2. Portfolio Intelligence
3. Rebalance, if time permits

### Required flows

#### Security

```text
dApp
→ wallet request
→ WalletOS
→ Codex
→ ClaimOS Skill
→ security result
```

#### Portfolio

```text
User asks:
"Analyze my wallet"

→ Codex
→ Portfolio Skill
→ balances + risk analysis
```

#### Action

```text
User:
"Rebalance it"

→ Codex prepares transaction
→ WalletOS Action Protocol
→ MetaMask confirmation
→ user approves
```

---

## 13. Security Boundaries

WalletOS must never:

- request a seed phrase
- store private keys
- sign transactions itself
- execute a wallet action without explicit wallet approval

Architecture boundary:

```text
Codex = reasoning

Skills = capabilities

WalletOS Companion = runtime

WalletOS Extension = browser/wallet interface

MetaMask = custody + signature

User = final authority
```

---

## 14. Build Order

1. Extension ↔ Tauri communication
2. Tauri ↔ `codex exec`
3. common task/response protocol
4. chat inside browser extension
5. MetaMask context capture
6. WalletOS Skill Registry
7. ClaimOS Skill
8. structured Wallet Action Protocol
9. MetaMask action execution
10. Portfolio/Rebalance skill

Do not build the marketplace UI yet.

For the hackathon, the local Skills Registry is enough to prove the marketplace architecture.
