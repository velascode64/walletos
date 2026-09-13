# WalletOS Docs

This folder contains the working documentation for WalletOS.

The source-of-truth product definitions are in [`project-definition/`](project-definition/). Do not edit those casually; use them to understand what WalletOS is supposed to be.

## Start Here

- [`../README.md`](../README.md): project overview, install, stack, sponsors.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): how to contribute to WalletOS.
- [`EXTENDING_WALLETOS.md`](EXTENDING_WALLETOS.md): how to add skills, plugins, packages, MCPs, and CLIs.
- [`SECURITY.md`](SECURITY.md): security policy and wallet safety rules.

## Current Architecture

WalletOS has two main surfaces:

- Browser extension: observes dApps, wallet requests, page context, and user intent.
- Tauri companion: runs locally, launches `codex exec`, loads WalletOS Skills, and returns analysis or prepared actions.

Skills connect the agent to deterministic blocks: MCP servers, CLIs, local scripts, APIs, and policy-aware execution steps.

## Core Integrations

- The Graph: subgraph MCP and Data API for onchain intelligence.
- Privy: agent wallet CLI for controlled wallet setup, funding, signing, and transaction actions.
- Ledger: local Ledger CLI for Ledger-compatible sync and Speculos/APDU development testing.

## Legacy Docs

Some files under [`developer/`](developer/) still describe inherited Tauri app patterns. Keep only what helps WalletOS development: Rust/Tauri structure, testing, commands, and extension/runtime patterns. Prefer WalletOS docs for product behavior and plugin design.
