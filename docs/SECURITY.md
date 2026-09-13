# Security

WalletOS is a wallet intelligence layer. It must help users understand and prepare actions without silently taking custody or bypassing wallet approval.

## Report A Vulnerability

Please do not report security issues in public issues. Open a private security advisory or contact the maintainers directly.

Include:

- affected surface: extension, Tauri companion, skill, package, MCP, or CLI
- steps to reproduce
- expected vs actual behavior
- wallet/action impact
- logs with secrets removed

## Security Boundaries

- WalletOS never asks for seed phrases or private keys.
- Browser wallet signing stays inside the user's wallet.
- Privy agent-wallet execution requires explicit setup or WalletOS delegated policy.
- Ledger flows use local sync/APDU tooling and do not bypass device/user approval.
- Page content, wallet payloads, agent output, MCP output, and CLI output are untrusted evidence.
- API keys and tokens must never appear in task context, chat output, screenshots, or logs.

## Skills And CLIs

Skills may tell the agent to call CLIs, MCPs, or APIs. Every executable capability must declare its requirements in `walletos.plugin.json` and explain its safety limits in `SKILL.md`.

Do not add a CLI that signs, broadcasts, transfers, swaps, bridges, or approves assets unless the skill also defines:

- when it may run
- what policy must allow it
- what user approval is required
- what JSON result proves success or failure

## Deterministic Evidence

For wallet safety, prefer deterministic collectors over model guesses:

- The Graph for indexed onchain activity
- portfolio-intelligence for wallet facts
- ClaimOS/security skills for transaction and approval review
- Ledger CLI for local Ledger-compatible sync and APDU tests
- Privy CLI for agent wallet operations under policy

Missing data must be reported as missing, not inferred as safe.
