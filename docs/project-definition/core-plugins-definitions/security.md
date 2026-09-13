# WalletOS Transaction Security Skill

## Purpose

Protect users from signing Web3 interactions they do not fully understand.

The skill analyzes:

1. **The context surrounding the interaction**
2. **The actual transaction or signature being requested**

Its primary goal is to detect interactions that could:

* drain wallet assets
* grant dangerous spending permissions
* grant control over NFTs
* authorize unexpected operators or delegates
* transfer assets unexpectedly
* hide dangerous behavior behind misleading UI

The skill must explain **what is happening and why it matters**, not only output a risk score.

---

# Agent behavior

Use this skill whenever the agent detects that the user is about to:

* sign a blockchain transaction
* approve token spending
* approve NFT permissions
* sign Permit / Permit2 data
* interact with a smart contract
* connect a wallet to an interaction that may lead to signing
* execute an unfamiliar Web3 action

The agent should run the security analysis **before recommending approval or signing**.

The skill never signs or broadcasts transactions.

---

# Phase 1 — Analyze context

Before transaction simulation, inspect all context available to the agent.

Possible inputs:

* current webpage URL
* page title
* visible webpage content
* buttons and labels
* links present on the page
* destination URLs
* transaction description shown by the dApp
* wallet popup information
* user request
* contract address
* token information
* chain
* transaction calldata

The agent should determine:

> What does this website claim the user is doing?

Build an expected intent.

Example:

```json
{
  "expectedAction": "Swap 100 USDC for ETH",
  "expectedAssetsOut": [
    {
      "asset": "USDC",
      "amount": "100"
    }
  ],
  "expectedAssetsIn": [
    {
      "asset": "ETH"
    }
  ]
}
```

---

# Context security checks

Look for inconsistencies or suspicious signals.

Examples:

### Domain inconsistencies

Detect:

* suspicious domains
* typo-like domains
* unexpected subdomains
* links pointing somewhere different from what the UI suggests
* redirects to unrelated domains

Do not automatically classify an unfamiliar domain as malicious.

Treat it as additional risk context.

---

### Misleading interaction

Compare what the website says with what the wallet is being asked to do.

Example:

Website:

> Swap 100 USDC

Transaction:

```text
approve(attacker, MAX_UINT256)
```

This discrepancy must be highlighted.

---

### Unexpected permissions

If the webpage appears to request a simple action but the wallet interaction grants broad permissions, flag it.

Examples:

```text
Approve unlimited USDC
SetApprovalForAll
Permit2 unlimited spending
Delegate execution permissions
```

---

### Suspicious interface patterns

The agent may note contextual signals such as:

* extreme urgency
* misleading transaction descriptions
* requests to sign unrelated data
* unexpected wallet network changes
* unexpected contracts
* multiple permissions hidden behind one action

These signals alone must not produce a CRITICAL verdict.

They should strengthen conclusions supported by transaction analysis.

---

# Phase 2 — Transaction security scan

When transaction data is available, call the WalletOS security scanner.

The agent should use one command only.

Example:

```bash
walletos-security analyze \
  --chain-id <chainId> \
  --rpc-url <rpcUrl> \
  --from <walletAddress> \
  --to <contractAddress> \
  --value <value> \
  --data <calldata>
```

The agent must NOT call Anvil or Cast individually.

The security script encapsulates those tools.

---

# Scanner responsibilities

The local security script should use Foundry tooling such as:

```text
Anvil
Cast
```

to simulate the interaction without broadcasting anything.

The scanner should inspect:

* execution trace
* native asset balance changes
* ERC-20 balance changes
* ERC-721 transfers
* ERC-1155 transfers
* approvals
* operators
* permits
* ownership changes
* delegate permissions
* transaction reverts

The user's private key must never be required.

---

# Required detections

At minimum detect:

## Unexpected asset outflow

Determine whether execution causes assets to leave the user's wallet.

Return:

```text
ASSET_OUTFLOW
```

Include:

* asset
* amount
* recipient
* contract when available

---

## Unlimited ERC-20 approval

Detect:

```solidity
approve(spender, type(uint256).max)
```

Return:

```text
UNLIMITED_APPROVAL
```

Include:

* token
* spender
* allowance

---

## NFT operator permission

Detect:

```solidity
setApprovalForAll(operator, true)
```

Return:

```text
SET_APPROVAL_FOR_ALL
```

Include:

* collection
* operator

---

## Permit authorization

Detect recognizable:

* EIP-2612 Permit
* Permit2
* similar token spending authorization

Return:

```text
PERMIT_AUTHORIZATION
```

Include the scope of the permission whenever possible.

---

## Dangerous authority changes

Detect obvious changes to:

* owner
* operator
* delegate
* execution authority
* token spending authority

Return an appropriate security finding.

---

## Simulation failure

If the interaction cannot be simulated reliably:

```text
SIMULATION_FAILED
```

Do not classify it as SAFE.

---

# Context vs execution

The most important responsibility of the skill is comparing:

```text
WHAT THE USER THINKS WILL HAPPEN
```

against:

```text
WHAT THE TRANSACTION ACTUALLY DOES
```

Example:

```text
Website says:
Swap 100 USDC → ETH

Simulation shows:
Approve unlimited USDC to another contract
Transfer NFT #3821
```

The response should emphasize the discrepancy:

```text
CRITICAL

This interaction does not match what the webpage describes.

The page describes a token swap, but the transaction grants unlimited
USDC spending permission and transfers an NFT from your wallet.

Do not sign this transaction.
```

---

# Risk levels

Return:

```text
SAFE
WARNING
CRITICAL
UNKNOWN
```

## SAFE

Simulation succeeded and no meaningful unexpected behavior was detected.

Example:

```text
You are sending 100 USDC and receiving approximately 0.03 ETH.
This matches the interaction shown by the website.
```

---

## WARNING

Potentially dangerous behavior exists but is not necessarily malicious.

Examples:

* normal token approval
* broad permission required by a protocol
* unexpected contract interaction
* unusual but explainable asset movement

Explain what requires attention.

---

## CRITICAL

Use when there is strong evidence that signing could expose or remove assets.

Examples:

* unexpected wallet asset drain
* unlimited approval inconsistent with expected action
* `setApprovalForAll` unrelated to expected action
* broad spending authorization hidden behind another action
* multiple unexpected asset transfers
* transaction behavior materially contradicts the webpage

The skill should recommend:

```text
Do not sign.
```

---

## UNKNOWN

Use when there is insufficient information.

Examples:

* simulation failed
* RPC unavailable
* unsupported transaction format
* incomplete calldata

Never convert UNKNOWN into SAFE.

---

# Output

The scanner should return structured JSON.

Example:

```json
{
  "risk": "CRITICAL",
  "simulationSucceeded": true,
  "findings": [
    {
      "type": "UNLIMITED_APPROVAL",
      "severity": "critical",
      "token": "0x...",
      "spender": "0x...",
      "amount": "MAX_UINT256"
    },
    {
      "type": "ASSET_OUTFLOW",
      "severity": "critical",
      "asset": "NFT #3821",
      "recipient": "0x..."
    }
  ]
}
```

The agent combines this result with webpage context to produce the final explanation.

---

# Agent response

The final user-facing answer should prioritize clarity.

Avoid:

```text
Function selector 0xa22cb465 detected.
```

Prefer:

```text
This transaction gives 0x1234... permission to move every NFT
from this collection in your wallet.
```

The agent can include technical details afterward if useful.

A good result should answer:

1. What does the website say will happen?
2. What will actually happen?
3. What permissions are being granted?
4. What assets can move?
5. Do the two match?
6. What is the risk?
7. Should the user sign?

---

# Security boundaries

This skill:

* analyzes only
* never signs
* never broadcasts transactions
* never requires private keys
* never modifies the user's wallet
* never labels something SAFE when simulation failed
* does not rely exclusively on webpage text
* treats blockchain execution as stronger evidence than UI descriptions

---

# Skill principle

The core principle is:

> Don't ask the user to understand calldata.
> Understand what they think they are doing, simulate what will actually happen, and explain the difference.

The desired WalletOS experience is:

```text
Website context
       +
Pending Web3 interaction
       ↓
Transaction Security Skill
       ↓
Local simulation
       ↓
Context vs execution comparison
       ↓
SAFE / WARNING / CRITICAL
       ↓
Human-readable explanation
```
