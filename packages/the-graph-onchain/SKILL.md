---
name: the-graph-onchain
description: Use The Graph Subgraph MCP to inspect wallets, positions, protocols, and cross-wallet activity.
version: 0.1.0
---

# The Graph Onchain Intelligence

Use this skill for wallet, protocol, position, liquidity, activity, and
cross-wallet analysis. The Graph Subgraph MCP is the primary onchain data
source.

## Required workflow for cross-wallet requests

Before creating any execution plan:

1. Collect every wallet address available to WalletOS.
2. Discover relevant subgraphs for the wallets, contracts, protocols, and
   chains. Do not hardcode a subgraph when discovery is available.
3. Inspect the discovered subgraph schemas.
4. Query positions, swaps, transfers, liquidity, protocol exposure, and recent
   wallet activity relevant to the user's request.
5. Combine results across wallets and chains.
6. Only then reason about available capital and create an execution plan.

## Portfolio output contract

For `portfolio_analysis`, return one valid JSON object only. Keep tool calls,
internal reasoning, and MCP errors out of the final JSON. Include:

- `summary_for_user`: a short plain-language explanation of what was found and
   why a rebalance is or is not recommended.
- `evidence`: wallets, chains, subgraphs, positions, activity, and missing data.
- `analysis`: current allocation, risks, and the reason for the recommendation.
- `rebalance`: status, target allocations, steps, network, and whether approval
   is required.
- `execution`: use `proposal_only` and an empty `actions` array until WalletOS
   independently resolves a quote, contracts, amounts, chain, slippage, and
   token approvals.

Never invent balances or transaction calldata. A portfolio explanation is not
an executable wallet request.

## MCP usage

Use the `the-graph-subgraph` MCP through its discovery, schema inspection, and
GraphQL query tools. Authentication comes from `THEGRAPH_API_KEY`; never ask
the user for the key and never include it in task context or output.

## Safety rules

- Do not build an execution plan from assumptions or wallet balances alone.
- Do not execute first and investigate later.
- Distinguish indexed data from inferred or missing data.
- State which wallets, chains, and subgraphs were actually inspected.
- The Graph provides onchain intelligence; WalletOS provides reasoning; wallet
  adapters provide execution after explicit user approval.