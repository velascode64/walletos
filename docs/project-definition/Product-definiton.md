# WalletOS — Product Definition

Status: Draft / Source of Truth  
Product: WalletOS  
Type: Browser Extension + Local Agent Runtime  
Primary Surface: Web browser  
Primary Domain: Web3 / Crypto Wallets / dApps

> **Current implementation priority:** First make the demo path reliable: the
> extension must call Codex as the selected WalletOS agent, pass observed page
> context in every normal chat task, and render concise user-facing responses
> instead of protocol JSON. Plugin integration remains the next strategic
> priority; broader agents and advanced automation follow after this path is
> verified.

> **Chat behavior for the current demo:** Each extension opening starts a new,
> ephemeral validation session. Stored chat messages and task memory are not
> restored. Suggested actions are visible only before the first message and
> disappear when the conversation starts. Every message sent during the open
> session must go through the WalletOS bridge to Codex with the current page
> context. The chat renders the agent's user-facing answer, never the internal
> protocol envelope or raw JSON.
>
> Sensitive wallet interactions open the extension side panel and surface
> ClaimOS analysis as an in-chat status/result. WalletOS does not render a
> separate analysis overlay on top of the dApp page.

---

# 1. Product Summary

WalletOS is an intelligent agent layer between users, Web3 applications, and their crypto wallets.

It is not a wallet.

It does not replace MetaMask, Phantom, Rabby, Coinbase Wallet, or other signing wallets.

Instead, WalletOS observes the context of what the user is doing in a Web3 application, detects sensitive blockchain interactions, analyzes them using AI agents and specialized skills, and helps the user understand or prepare an action before the wallet asks for final authorization.

WalletOS turns a crypto wallet from a simple signing interface into an intelligent decision layer.

Conceptually:

Web3 Application
    ↓
WalletOS
    ↓
AI Agent + Skills
    ↓
Wallet
    ↓
User Approval
    ↓
Blockchain

The wallet remains the final signing authority.

---

# 2. Vision

Crypto wallets currently answer:

> "Do you want to sign this transaction?"

WalletOS should answer:

> "What is this transaction doing, is it safe, how does it affect me, and should I execute it?"

Long term, WalletOS becomes the intelligence layer through which AI agents can safely interact with Web3 on behalf of users.

Users should be able to say things such as:

- Analyze this transaction.
- Is this contract safe?
- Should I approve this token permission?
- Find my unclaimed rewards.
- Rebalance my portfolio.
- Reduce my exposure to this asset.
- Bridge these assets.
- Find a better yield opportunity.
- Explain what this signature actually allows.
- Prepare the transactions necessary to execute this strategy.

WalletOS analyzes and prepares.

The wallet authorizes.

The blockchain executes.

---

# 3. Core Product Principle

WalletOS must never silently take custody or remove the user's control over signing.

The core model is:

Agent proposes.
WalletOS explains.
User approves.
Wallet signs.

WalletOS may automate discovery, analysis, navigation, transaction preparation, simulation, routing, and orchestration.

Private-key signing must remain with the user's wallet unless the user explicitly connects a separate wallet infrastructure designed for autonomous agents.

For the initial product, WalletOS itself never holds private keys.

---

# 4. Problem

Web3 wallets expose technical blockchain operations but provide very little intelligence about them.

Users regularly encounter:

- opaque transaction calldata
- unknown contracts
- token approvals
- permits
- malicious signatures
- phishing dApps
- unexpected asset transfers
- complex DeFi operations
- bridge transactions
- staking contracts
- claims and rewards
- portfolio decisions
- fragmented positions across chains and protocols

A wallet usually provides information such as:

- contract address
- network
- estimated gas
- raw asset movement

But it rarely understands the user's broader intent or context.

For example, the wallet may know:

> Approve USDC

but not:

> This contract is requesting unlimited access to your USDC, it was deployed four hours ago, and it is unrelated to the protocol shown in the current page.

WalletOS exists to provide that missing intelligence layer.

---

# 5. Product Goals

## 5.1 Primary goals

WalletOS should:

1. Detect meaningful Web3 interactions in the browser.

2. Understand the context surrounding those interactions.

3. Let the user decide whether WalletOS should analyze the interaction.

4. Analyze transactions and signatures before final wallet approval.

5. Use specialized skills/plugins to improve analysis.

6. Present a concise verdict and supporting evidence.

7. Allow the user to continue to their existing wallet.

8. Allow agents to prepare multi-step Web3 actions.

9. Keep the user in control whenever signing or irreversible actions are required.

10. Provide a plugin model so WalletOS intelligence can expand without rebuilding the core extension.

---

# 6. Non-Goals

For the initial product, WalletOS is NOT:

- a new crypto wallet
- a private-key manager
- a centralized exchange
- a portfolio dashboard
- an autonomous trading bot
- a replacement for MetaMask or Phantom
- a custody provider
- a blockchain RPC provider
- an AI model provider
- a protocol-specific DeFi frontend

WalletOS should integrate with existing infrastructure rather than replace it.

---

# 7. User Mental Model

The user should think of WalletOS as:

> "An AI companion for my wallet."

or:

> "An intelligence layer for my wallet."

Not:

> "Another wallet."

WalletOS watches the interaction between:

- browser
- dApp
- blockchain
- wallet
- user

and provides contextual intelligence when it matters.

---

# 8. Product Actors

## User

Owns the wallet and makes final authorization decisions.

## dApp

The website requesting wallet connections, signatures, or blockchain transactions.

Examples:

- Uniswap
- Aave
- OpenSea
- Galxe
- Merkl
- custom Web3 applications

## Wallet

Existing wallet responsible for signing.

Examples:

- MetaMask
- Phantom
- Rabby
- Coinbase Wallet

## WalletOS Extension

Browser-level intelligence and orchestration layer.

Responsibilities include:

- detecting Web3 activity
- collecting context
- presenting agent activity
- coordinating analysis
- interacting with the local WalletOS runtime

## WalletOS Agent Runtime

Executes reasoning and tool orchestration.

Possible agents include:

- Codex
- Claude Code
- Hermes
- other local or remote agents

WalletOS should not depend permanently on one specific agent provider.

## Skill / Plugin

Specialized intelligence that an agent can use.

Examples:

- security analysis
- claim discovery
- transaction simulation
- portfolio analysis
- contract reputation
- token permissions
- bridge routing
- DeFi risk
- market data

---

# 9. Core Interaction Model

WalletOS should primarily react to significant Web3 actions.

It should remain passive for normal browser activity.

Example flow:

User clicks "Swap"
    ↓
dApp creates blockchain transaction
    ↓
WalletOS detects transaction request
    ↓
WalletOS surfaces the detected action
    ↓
User chooses:

    Analyze
       OR
    Continue without WalletOS

If Analyze:
    ↓
Agent receives context
    ↓
Skills analyze transaction
    ↓
WalletOS returns verdict
    ↓
User chooses whether to continue
    ↓
Request reaches wallet
    ↓
Wallet asks for signature
    ↓
User signs or rejects

---

# 10. Web3 Interaction Detection

WalletOS should detect Ethereum-compatible provider interactions when possible.

Relevant methods include, but are not limited to:

- eth_sendTransaction
- eth_sign
- personal_sign
- eth_signTypedData
- eth_signTypedData_v4
- wallet_requestPermissions
- wallet_addEthereumChain
- wallet_switchEthereumChain

WalletOS should distinguish between:

## Passive blockchain reads

Examples:

- eth_call
- eth_getBalance
- eth_blockNumber
- eth_getTransactionReceipt

These should normally NOT interrupt the user.

## Sensitive actions

Examples:

- transaction submission
- message signing
- typed-data signing
- token approvals
- permits
- transfers
- contract interactions

These may trigger WalletOS.

---

# 11. Semantic Action Detection

WalletOS should try to convert low-level blockchain requests into understandable actions.

Examples:

Raw transaction:

eth_sendTransaction

Semantic interpretation:

Swap
Approve
Stake
Unstake
Claim
Bridge
Transfer
Mint
Deposit
Withdraw
Rebalance
Permit
Sign message

The semantic action is more important to the user than the raw RPC method.

---

# 12. Interaction Trigger Policy

WalletOS should not interrupt every Web3 request.

Default behavior:

### Normal RPC read

Do nothing.

### Wallet connection request

Optionally show lightweight contextual information.

Do not force full analysis.

### Signature request

Surface WalletOS.

### Transaction request

Surface WalletOS.

### Token approval

Surface WalletOS.

### Permit / typed signature

Surface WalletOS.

### High-risk interaction detected

Surface WalletOS with elevated priority.

---

# 13. User Analysis Choice

When WalletOS detects a relevant interaction, the user should have two primary options:

## Analyze

WalletOS pauses or gates the action when technically possible and sends the interaction context to the agent.

## Continue without WalletOS

WalletOS immediately lets the wallet interaction continue.

WalletOS should never require AI analysis for every transaction.

The user remains in control of whether intelligence is invoked.

---

# 14. Automatic Analysis Preferences

Users may configure WalletOS to automatically analyze certain interactions.

Possible policies:

- Always analyze transactions.
- Always analyze signatures.
- Always analyze token approvals.
- Always analyze this website.
- Never analyze this website.
- Ask every time.

These preferences belong to WalletOS policy configuration.

---

# 15. Agent Context

When an interaction is analyzed, the agent should receive structured context.

The context may include:

## Browser Context

- current URL
- domain
- page title
- detected protocol
- relevant visible page metadata

## Wallet Context

- wallet address
- selected account
- blockchain network

## Transaction Context

- from
- to
- value
- calldata
- chain ID
- gas information
- decoded function if available

## Signature Context

When applicable:

- message
- typed data
- domain
- spender
- token
- amount
- expiration

## Portfolio Context

When relevant:

- wallet balances
- token holdings
- DeFi positions
- existing approvals
- relevant risk thresholds

## Skill Context

Skills may enrich the context before or during agent reasoning.

---

# 16. Analysis Lifecycle

An analysis should follow a predictable lifecycle.

Detected
    ↓
Awaiting user decision
    ↓
Analyzing
    ↓
Gathering evidence
    ↓
Verdict
    ↓
User decision
    ↓
Wallet authorization
    ↓
Completed / rejected / failed

---

# 17. Analysis Status

WalletOS should expose observable execution status without exposing private model chain-of-thought.

Allowed examples:

- Decoding transaction
- Contract identified
- Simulating transaction
- Checking permissions
- Checking contract reputation
- Checking portfolio impact
- Checking protocol
- Evaluating destination
- Querying security skill

WalletOS must NOT expose hidden internal reasoning tokens or raw chain-of-thought.

The user sees actions and results, not private reasoning.

---

# 18. Verdict Model

Initial verdict categories:

## SAFE

No significant unexpected risks were detected.

Example:

SAFE

Official Uniswap router.
Simulation succeeded.
Expected assets received.
No unexpected approvals detected.

## REVIEW

The transaction may be legitimate but contains conditions the user should understand.

Example:

REVIEW

This transaction creates an unlimited USDC allowance.

## DANGEROUS

WalletOS found strong evidence that the interaction may expose user assets or behave differently than expected.

Example:

DANGEROUS

Unknown spender.
Unlimited USDC approval.
Simulation indicates tokens can be transferred by the spender.

## UNKNOWN

WalletOS does not have enough evidence to make a confident assessment.

Unknown must never silently become Safe.

---

# 19. Evidence

Verdicts should be accompanied by structured evidence.

Example:

Verdict: DANGEROUS

Reasons:

- spender is not associated with the visible protocol
- unlimited token allowance requested
- contract deployed recently
- transaction simulation indicates unexpected token movement

Evidence should be attributable to the skill or tool that produced it when possible.

---

# 20. Wallet Continuation

After analysis, WalletOS may offer:

Continue to wallet

This should forward or recreate the original request for the existing wallet.

The wallet then presents its normal signature interface.

WalletOS does not sign.

---

# 21. Dangerous Transaction Behavior

For dangerous transactions:

WalletOS should NOT automatically dismiss itself.

The user must explicitly choose between actions such as:

- Block transaction
- Continue anyway

Continuing a dangerous transaction must require intentional user action.

---

# 22. Auto-Close Behavior

WalletOS should be contextual rather than permanently intrusive.

Default behavior:

## User skips analysis

Continue transaction and dismiss WalletOS.

## Safe transaction

After the user continues to the wallet, WalletOS may dismiss automatically.

## Transaction completed

WalletOS may dismiss after showing completion.

## Dangerous transaction

Do not automatically dismiss.

## Active agent task

Remain visible while the task is running.

---

# 23. Agent Tasks

WalletOS must support more than security analysis.

The same agent infrastructure should eventually support user-directed tasks.

Examples:

"Rebalance my portfolio to 50% ETH and 50% USDC."

"Find all rewards I can claim."

"Move idle USDC into low-risk yield."

"Bridge $500 USDC to Base."

"Reduce my SOL exposure by 10%."

"Inspect this protocol before I deposit."

---

# 24. Agent Execution Model

An agent task can contain multiple steps.

Example:

User request:

Rebalance portfolio to:
50% ETH
50% USDC

WalletOS:

1. Read portfolio.
2. Calculate required rebalance.
3. Identify possible execution routes.
4. Compare routes.
5. Prepare transactions.
6. Present proposed actions.
7. Request user approval.
8. Open wallet for signing.
9. Observe resulting transactions.
10. Continue to the next required approval if necessary.

The agent may orchestrate the process.

The user authorizes irreversible blockchain actions.

---

# 25. Agent Control

When WalletOS is actively executing a browser or Web3 workflow, users must be able to:

- see that the agent is active
- stop the task
- take control
- inspect progress

Agent control should be interruptible.

Stopping the agent must prevent future planned actions from continuing.

---

# 26. Transaction Preparation

WalletOS agents may prepare transactions.

A prepared transaction may contain:

- chain
- destination contract
- function
- parameters
- calldata
- value
- expected asset changes
- estimated gas
- source skill
- explanation

Prepared transactions should remain unsigned until sent to the wallet.

---

# 27. Multi-Transaction Plans

Agents may prepare execution plans containing multiple transactions.

Example:

Rebalance Plan

Transaction 1
Swap 0.7 ETH → USDC

Transaction 2
Deposit 2,000 USDC → lending protocol

Transaction 3
Revoke previous token allowance

Before execution WalletOS should expose the plan to the user.

Each wallet signature should remain user-authorized unless an explicitly configured delegated execution model exists in the future.

---

# 28. Skills / Plugins

WalletOS should use a modular skill architecture.

The core extension must not contain every possible Web3 capability.

Instead:

WalletOS Core
    ↓
Agent
    ↓
Skills
    ↓
Tools / APIs / MCP / CLI

A skill provides specialized context or capability to an agent.

---

# 29. Skill Examples

Initial skill categories may include:

## Security

Analyze:

- transactions
- contracts
- signatures
- token approvals
- phishing indicators
- wallet-drain patterns

Possible implementation:

ClaimOS Security

## Transaction Simulation

Simulate transaction effects before signing.

## Portfolio

Understand:

- wallet balances
- asset allocation
- DeFi positions
- exposure
- concentration

## Claims

Discover:

- rewards
- airdrops
- incentives
- claimable positions

## Protocol Intelligence

Understand:

- protocol
- contracts
- known deployments
- supported networks

## Market Intelligence

Provide:

- token prices
- liquidity
- yield
- volatility

---

# 30. Skill Package Philosophy

Installing a WalletOS skill should conceptually feel similar to installing a package or VS Code extension.

A skill should be self-contained.

A skill may provide:

- instructions
- system context
- tools
- MCP servers
- CLI commands
- APIs
- schemas
- metadata
- capability definitions

The WalletOS agent should discover available skills dynamically.

---

# 31. Proposed Skill Structure

Conceptual structure:

runtime/skills/
    security/
        skill.md
        manifest.json
        prompts/
        tools/
        mcp/
        
    portfolio/
        skill.md
        manifest.json
        tools/

    claims/
        skill.md
        manifest.json
        tools/

The precise implementation may change, but skills must remain independently installable and removable.

---

# 32. Skill Manifest

A skill should expose metadata such as:

name
version
description
capabilities
supportedChains
supportedActions
requiredTools
requiredPermissions
entrypoints

Example conceptual manifest:

{
  "name": "claimos-security",
  "version": "0.1.0",
  "description": "Security analysis for Web3 transactions and signatures",
  "capabilities": [
    "analyze_transaction",
    "analyze_signature",
    "analyze_approval"
  ]
}

This is a conceptual contract, not yet a finalized schema.

---

# 33. Security Skill as Agent Context

The security skill should not replace the main agent.

Instead:

User Action
    ↓
WalletOS Context
    ↓
Main Agent
    ↓
Security Skill
    ↓
Security Evidence
    ↓
Main Agent Verdict

The skill provides specialized knowledge and tools.

The primary agent remains responsible for coordinating the overall decision.

---

# 34. Agent Independence

WalletOS should not be tightly coupled to Codex.

The architecture should allow:

Codex
Claude Code
Hermes
other compatible agents

to operate as the WalletOS reasoning engine.

Therefore WalletOS should define its own:

- context format
- action format
- skill interface
- execution protocol

rather than embedding provider-specific behavior throughout the extension.

---

# 35. Local Agent Runtime

Initial versions of WalletOS may communicate with a local runtime.

Conceptually:

Browser Extension
        ↓
WalletOS Local Service
        ↓
Agent Runtime
        ↓
Codex / Claude / Hermes
        ↓
Skills / MCP / CLI

The browser extension should not need to directly understand how each agent executes tools.

That responsibility belongs to the local runtime.

---

# 36. Core WalletOS Components

## Browser Extension

Responsible for:

- Web3 detection
- page context
- user interaction
- wallet interception/orchestration
- communication with local runtime

## Local Runtime

Responsible for:

- agent execution
- skill discovery
- tool execution
- streaming execution events
- task state

## Agent

Responsible for:

- interpreting context
- selecting skills
- reasoning about actions
- building recommendations
- preparing execution plans

## Skills

Responsible for:

- specialized Web3 capabilities

## Wallet

Responsible for:

- keys
- signing
- authorization

---

# 37. Event Model

WalletOS should eventually expose a normalized internal event model.

Examples:

WEB3_INTERACTION_DETECTED

ANALYSIS_REQUESTED

ANALYSIS_STARTED

SKILL_STARTED

SKILL_COMPLETED

ANALYSIS_COMPLETED

TRANSACTION_PREPARED

WAITING_FOR_USER

WALLET_REQUESTED

TRANSACTION_SIGNED

TRANSACTION_REJECTED

TRANSACTION_SUBMITTED

TRANSACTION_CONFIRMED

AGENT_STARTED

AGENT_STOPPED

AGENT_FAILED

This will allow the extension to remain agent-provider independent.

---

# 38. Suggested Interaction Object

Conceptual representation:

{
  "id": "...",
  "type": "transaction",
  "action": "swap",
  "origin": "https://app.uniswap.org",
  "chainId": 8453,
  "wallet": "0x...",
  "request": {
    "method": "eth_sendTransaction",
    "params": []
  },
  "decoded": {},
  "status": "detected"
}

This schema is conceptual and can evolve.

---

# 39. Suggested Agent Result

Conceptual representation:

{
  "interactionId": "...",
  "verdict": "SAFE",
  "summary": "This appears to be a normal Uniswap swap.",
  "action": {
    "type": "swap",
    "from": "ETH",
    "to": "USDC"
  },
  "findings": [],
  "recommendation": "continue",
  "evidence": []
}

Possible verdicts:

SAFE
REVIEW
DANGEROUS
UNKNOWN

---

# 40. Streaming

The local runtime should eventually stream execution status to the extension.

Example:

analysis.started

skill.started: transaction-decoder

skill.completed: transaction-decoder

skill.started: simulation

skill.completed: simulation

skill.started: claimos-security

analysis.completed

The extension should not need to wait for the final agent response before knowing what phase is running.

Streaming should expose execution state, not private model chain-of-thought.

---

# 41. Failure Behavior

WalletOS must fail safely.

If:

- local runtime is unavailable
- agent crashes
- skill fails
- API fails
- simulation fails
- transaction cannot be decoded

WalletOS must clearly report that analysis is incomplete.

It must never convert a failed analysis into SAFE.

Possible result:

UNKNOWN

"WalletOS could not complete transaction analysis."

The user may still choose whether to continue to their wallet.

---

# 42. Trust Principles

WalletOS must optimize for trust.

Rules:

1. Never claim certainty without evidence.
2. Never convert UNKNOWN into SAFE.
3. Never sign without explicit authorization.
4. Never hide unexpected asset movement.
5. Always distinguish recommendation from execution.
6. Always allow the user to stop an active agent.
7. Always identify when third-party skills generated evidence.
8. Never expose private chain-of-thought.
9. Never imply that WalletOS controls private keys when it does not.
10. Prefer user control over aggressive automation.

---

# 43. MVP

The first WalletOS MVP should prove one core loop:

Web3 action
    ↓
WalletOS detects it
    ↓
User chooses Analyze
    ↓
Codex receives transaction context
    ↓
Security skill analyzes it
    ↓
WalletOS receives structured verdict
    ↓
User continues or blocks
    ↓
Wallet handles signing

The MVP does NOT need:

- full portfolio management
- automated rebalancing
- marketplace UI
- multiple agents
- dozens of skills
- autonomous wallet
- cross-chain strategy engine

Those are future capabilities.

---

# 44. MVP Required Capabilities

The MVP should support:

### Browser

- Chrome extension
- detect Ethereum provider requests
- identify current website
- capture transaction/signature context

### Interaction

- detect sensitive interaction
- ask whether to analyze
- allow skip
- initiate analysis
- receive analysis state
- receive verdict
- continue to wallet
- block interaction

### Runtime

- communicate with local WalletOS service
- invoke Codex
- pass structured context
- load security skill
- return structured result

### Security Skill

At minimum analyze:

- destination contract
- transaction type
- token approvals
- spender
- requested amount
- obvious unexpected behavior

### State

Support:

DETECTED
ANALYZING
SAFE
REVIEW
DANGEROUS
UNKNOWN
WAITING_FOR_WALLET
COMPLETED
FAILED

---

# 45. MVP Success Criteria

The MVP is successful when the following end-to-end demo works:

1. User opens a Web3 dApp.

2. User initiates a transaction.

3. WalletOS detects the transaction before signing.

4. WalletOS asks whether the user wants analysis.

5. User chooses Analyze.

6. WalletOS sends transaction + page context to the local agent.

7. Codex invokes the WalletOS security skill.

8. The extension receives live execution status.

9. The agent returns a structured verdict.

10. WalletOS explains the action and relevant risks.

11. User chooses Continue.

12. MetaMask or another wallet opens.

13. User remains the final signer.

This is the first product milestone.

---

# 46. Demo Scenarios

The MVP should demonstrate at least two scenarios.

## Scenario A — Legitimate Transaction

Example:

Uniswap swap.

Expected result:

SAFE

WalletOS identifies:

- known protocol
- expected router
- expected token movement
- no suspicious approval

User continues to wallet.

---

## Scenario B — Suspicious Approval

Example:

Unknown dApp requesting unlimited USDC approval.

Expected result:

DANGEROUS or REVIEW.

WalletOS identifies:

- approval transaction
- unlimited allowance
- unknown spender
- mismatch between page context and destination contract if applicable

WalletOS recommends blocking or reviewing.

---

# 47. Future Product Direction

Once the core security loop works, WalletOS can evolve from:

Transaction Intelligence

to:

Wallet Intelligence

to:

Agentic Wallet Operations

Eventually:

User Intent
    ↓
WalletOS Agent
    ↓
Skills Marketplace
    ↓
Plan
    ↓
Prepared blockchain actions
    ↓
User authorization
    ↓
Wallet
    ↓
Blockchain

This is the long-term WalletOS product.

---

# 48. Product Positioning

WalletOS is not:

"AI inside a crypto wallet."

WalletOS is:

"An intelligence and agent layer for every wallet."

It should work across:

- wallets
- dApps
- chains
- protocols
- AI agents
- specialized skills

The wallet is the signing layer.

WalletOS is the intelligence layer.

---

# 49. One-Sentence Definition

WalletOS is an agentic intelligence layer for crypto wallets that understands Web3 interactions, uses specialized skills to analyze or prepare actions, and lets the user's existing wallet remain the final authority for execution.

---

# 50. Product Rule for Codex

When implementing WalletOS, prioritize this invariant above all others:

> WalletOS can understand, analyze, recommend, orchestrate and prepare — but the user's wallet remains the authority for signing irreversible blockchain actions.

Do not introduce architecture that violates this invariant unless the product definition is explicitly changed.
