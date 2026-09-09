# AI Agent Instructions — WalletOS Development

## Overview

This repository is the **WalletOS Desktop Companion** and related browser-extension codebase.

WalletOS is a Tauri + React application that bridges browser wallets and dApps with local AI agents such as Codex. The Desktop Companion is responsible for local process execution, agent orchestration, plugin/skill discovery, and communication with the WalletOS Browser Extension.

This file is for **developing and extending the WalletOS codebase**.

It is NOT the runtime prompt for the crypto wallet agent.

---

## Project Definition — Source of Truth

Before making product, architecture, or design decisions, read the relevant files under:

`project-definition/`

The three primary project-definition documents are:

- `project-definition/Product-definiton.md`
  - Product behavior
  - User flows
  - Product responsibilities
  - Feature scope

- `project-definition/Technical-Architecture.md`
  - System architecture
  - Browser Extension ↔ Desktop Companion bridge
  - Agent runtime
  - Codex invocation
  - WalletOS plugins / skills
  - Wallet actions
  - Communication protocols
  - Security boundaries

- `project-definition/Design-defintion.md`
  - Design system
  - Branding
  - Components
  - Layout rules
  - Desktop Companion UI
  - Browser Extension UI
  - Light / dark behavior

Use these files instead of re-defining product behavior inside this `AGENTS.md`.

This file defines **how to work on the repository**.

---

## IMPORTANT: Runtime Directory Boundary

The directory:

`runtime/`

belongs to the **WalletOS runtime agent**, not to the development agent.

It contains the instructions and skills used when WalletOS launches Codex as the user's crypto-wallet agent.

### Development agents MUST NOT

- use `runtime/AGENTS.md` as development instructions
- treat runtime instructions as repository instructions
- search `runtime/` for implementation guidance
- copy runtime personality / wallet-agent behavior into application code
- modify runtime files unless the user explicitly asks for runtime-agent changes
- confuse runtime skills with development skills

### Development agents SHOULD

Use:

- root `AGENTS.md` → development instructions
- `project-definition/` → product / architecture / design source of truth
- `docs/developer/` → implementation patterns
- source folders such as `src/`, `src-tauri/`, `extension/`, `packages/` → application implementation

Think of the separation as:

```text
root AGENTS.md
→ how to BUILD WalletOS

runtime/AGENTS.md
→ how Codex should BEHAVE when WalletOS launches it
```

Do not cross these boundaries unless explicitly instructed.

---

# Core Rules

## New Sessions

At the beginning of a new development session:

1. Read this root `AGENTS.md`.
2. Read `project-definition/Technical-Architecture.md`.
3. Read `project-definition/Product-definiton.md` if changing product behavior.
4. Read `project-definition/Design-defintion.md` if changing UI, components, layout, or branding.
5. Read `docs/tasks.md` for task management if present.
6. Review `docs/developer/architecture-guide.md`.
7. Check `docs/developer/README.md` for the full documentation index.
8. Check git status and inspect the relevant project structure.
9. Read existing implementation before editing.

Do NOT inspect `runtime/` as part of normal development discovery.

---

## Development Practices

**CRITICAL:** Follow these strictly.

0. **Use Bun only**
   - This project uses `bun`.
   - Use `bun install`, `bun run`, etc.
   - Do NOT introduce `npm`, `pnpm`, or `yarn` commands unless the user explicitly requests a package-manager migration.

1. **Read Before Editing**
   - Always inspect relevant files first.
   - Understand current patterns before changing architecture.

2. **Follow Established Patterns**
   - Follow this file.
   - Follow `project-definition/Technical-Architecture.md`.
   - Follow `docs/developer/`.

3. **Senior Architect Mindset**
   - Consider maintainability, security, testability, performance, and future extensibility.
   - WalletOS must remain extensible beyond Codex and beyond a single wallet.

4. **Preserve Architectural Boundaries**
   - Browser Extension = browser / wallet interface.
   - Desktop Companion = local bridge / runtime orchestration.
   - Agent Adapter = integration with Codex, Claude, Hermes, etc.
   - Plugins / Skills = capabilities used by the runtime agent.
   - Wallet = custody and signing.
   - User = final approval.

5. **Batch Operations**
   - When possible, inspect related files together before editing.

6. **Match Code Style**
   - Follow existing formatting, naming, and architecture.

7. **Test Coverage**
   - Add tests for meaningful business logic and protocol handling.

8. **Quality Gates**
   - Run the repository's existing checks after significant changes.
   - Prefer:
     `bun run check:all`
     if the script exists.

9. **No Dev Server**
   - Do not start long-running development servers unless explicitly requested.
   - Ask the user to run interactive dev servers and report back when needed.

10. **No Unsolicited Commits**
    - Do not commit or push unless explicitly requested.

11. **Documentation**
    - Update the relevant source-of-truth document when architecture, product behavior, or design rules change.

12. **Removing Files**
    - Use `rm -f` when removing files from shell commands.

13. **Tauri v2 Only**
    - Use Tauri v2 documentation and APIs.
    - Do not introduce Tauri v1 patterns.

14. **Modern Rust Formatting**
    - Use modern Rust formatting:
      `format!("{variable}")`

---

# WalletOS Repository Responsibilities

## Desktop Companion

Primary folders:

```text
src/
src-tauri/
```

The Desktop Companion is responsible for:

- communicating with the WalletOS Browser Extension
- detecting local agents such as Codex
- launching local agent processes
- passing structured wallet / dApp context to agents
- discovering installed WalletOS plugins / skills
- receiving structured agent output
- streaming task state
- returning prepared actions to the browser extension
- keeping the signing boundary inside the user's wallet

Do not move product intelligence into Rust unless native OS access requires it.

Prefer TypeScript for higher-level orchestration where practical.

Use Rust for native responsibilities such as:

- local process execution
- OS integration
- Tauri commands
- native filesystem access
- secure local bridge capabilities

---

## Browser Extension

Primary folder:

`extension/`

The Browser Extension is responsible for:

- observing dApp context
- detecting supported wallet providers
- reading connected account / chain context
- observing wallet interactions
- capturing transaction / signature context
- communicating with the Desktop Companion
- displaying agent activity and results
- forwarding prepared Wallet Actions to the wallet provider
- allowing the wallet to request final user approval

The Browser Extension must NOT:

- store private keys
- sign transactions itself
- execute `codex`, `claude`, or other local processes directly
- duplicate Desktop Companion runtime responsibilities

---

## Plugins / Skills

The plugin system is part of WalletOS architecture.

Do NOT invent plugin behavior from this document.

Read:

`project-definition/Technical-Architecture.md`

for the canonical plugin / skill design.

General rule:

```text
WalletOS Plugin
→ exposes a Skill
→ Skill instructs the runtime agent
→ agent uses CLI / MCP / API / scripts
```

Product plugin source code should live under the plugin/package structure defined by the technical architecture.

Do not confuse:

- development-agent skills
- WalletOS runtime skills
- browser extensions
- CLI tools

They are different concepts.

---

# Architecture Patterns

## State Management Onion

```text
useState (component)
→ Zustand (global UI)
→ TanStack Query (persistent / async data)
```

Decision rule:

1. Is the data only needed by one component?
   → `useState`

2. Is it shared UI/application state?
   → Zustand

3. Is it remote, persistent, async, cached, or server-derived state?
   → TanStack Query

---

## Performance Pattern

```typescript
// GOOD: selector syntax
const leftSidebarVisible = useUIStore(state => state.leftSidebarVisible)

// BAD: subscribes to more state than needed
const { leftSidebarVisible } = useUIStore()

// GOOD: callbacks that need fresh state
const handleAction = () => {
  const { data, setData } = useStore.getState()
  setData(newData)
}
```

Avoid unnecessary Zustand render cascades.

---

## Static Analysis

- **React Compiler**
  - Handles memoization automatically.
  - Do not add manual `useMemo` / `useCallback` unless there is a concrete need.

- **ast-grep**
  - Enforces architecture patterns.
  - See `docs/developer/static-analysis.md`.

- **Knip / jscpd**
  - Use existing cleanup tooling when needed.

Do not replace existing static-analysis tools without a clear reason.

---

# Event-Driven Tauri Bridge

## Rust → React

Use Tauri events:

```text
app.emit("event-name", data)
→
listen("event-name", handler)
```

Use this for runtime events, process status, streaming updates, and other event-driven flows.

## React → Rust

Use typed commands from:

`@/lib/tauri-bindings`

Prefer tauri-specta generated bindings.

---

# Tauri Command Pattern

```typescript
// GOOD
import { commands } from '@/lib/tauri-bindings'

const result = await commands.loadPreferences()

if (result.status === 'ok') {
  console.log(result.data.theme)
}

// BAD
const prefs = await invoke('load_preferences')
```

Avoid raw string-based `invoke()` when typed bindings exist.

For new commands, follow:

`docs/developer/tauri-commands.md`

---

# Local Agent Integration

WalletOS currently targets Codex first, but the architecture must remain adapter-based.

Do NOT hard-wire WalletOS business logic directly into Codex-specific code.

Preferred abstraction:

```ts
interface AgentAdapter {
  isAvailable(): Promise<boolean>
  startTask(task: AgentTask): Promise<TaskHandle>
  cancelTask(taskId: string): Promise<void>
}
```

Example:

```text
AgentAdapter
├── CodexAdapter
├── ClaudeAdapter
└── HermesAdapter
```

Codex-specific process invocation belongs inside the Codex adapter.

The Desktop Companion is responsible for selecting and invoking the adapter.

The canonical invocation and message contracts live in:

`project-definition/Technical-Architecture.md`

---

# WalletOS Communication Model

Keep these boundaries intact:

```text
dApp / Browser
      ↓
WalletOS Browser Extension
      ↓
WalletOS Desktop Companion
      ↓
Agent Adapter
      ↓
Codex / other local agent
      ↓
WalletOS Skills
      ↓
MCP / CLI / API / scripts
      ↓
Structured Result / Prepared Action
      ↓
Browser Extension
      ↓
Wallet
      ↓
User Approval
```

Do not bypass the wallet's confirmation flow.

WalletOS must never silently sign on behalf of the user.

---

# Internationalization (i18n)

Use the existing i18n architecture.

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('myFeature.title')}</h1>
}
```

For non-React contexts:

```typescript
import i18n from '@/i18n/config'

const t = i18n.t.bind(i18n)

i18n.t('key')
```

Rules:

- all user-facing strings belong in `/locales/*.json`
- preserve RTL support
- use CSS logical properties such as `text-start`, not `text-left`

See:

`docs/developer/i18n-patterns.md`

---

# Documentation & Versions

Use current project versions and established patterns.

Expected stack:

- Tauri v2.x
- React 19.x
- shadcn/ui v4.x
- Tailwind v4.x
- Zustand v5.x
- Vite v7.x
- Vitest v4.x

Before introducing a framework-specific implementation, prefer the project's existing documentation and installed APIs.

Do not assume a template-era decision is still valid if it conflicts with the WalletOS project-definition documents.

---

# Developer Documentation

For implementation details, see:

`docs/developer/README.md`

Important files include:

- `architecture-guide.md`
  - mental models
  - security
  - anti-patterns

- `state-management.md`
  - state onion
  - Zustand patterns

- `tauri-commands.md`
  - adding Rust / Tauri commands

- `static-analysis.md`
  - linting and quality gates

The `docs/developer/` directory describes engineering patterns.

The `project-definition/` directory describes WalletOS itself.

Do not mix those responsibilities.

---

# Documentation Update Rules

When changing product behavior:

Update:

`project-definition/Product-definiton.md`

When changing system architecture:

Update:

`project-definition/Technical-Architecture.md`

When changing branding, visual language, components, layout, or design behavior:

Update:

`project-definition/Design-defintion.md`

When changing a reusable engineering pattern:

Update the relevant file under:

`docs/developer/`

Do not update `runtime/AGENTS.md` unless the task explicitly concerns runtime-agent behavior.

---

# Primary Engineering Principle

WalletOS is a Tauri-based local companion plus browser extension that bridges crypto wallets with local AI agents.

When extending the system, preserve this separation:

```text
Browser Extension
= browser + wallet interface

Desktop Companion
= local bridge + orchestration

Agent Adapter
= Codex / Claude / Hermes integration

WalletOS Plugin / Skill
= specialized wallet capability

CLI / MCP / API / Script
= tool used by a skill

Wallet
= custody + signing

User
= final authority
```

When uncertain about behavior, architecture, or design, consult the corresponding file in `project-definition/` before implementing.
