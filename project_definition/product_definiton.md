### Product Definition — WallyOS Desktop Companion

**WallyOS Desktop Companion** es la aplicación local que conecta la extensión del navegador con agentes instalados en la máquina del usuario, como **Codex CLI** o **Claude Code**. Su función es actuar como el **bridge seguro y visible** entre el navegador, las wallets y los agentes locales.

La app no es el “cerebro”; el cerebro sigue siendo Codex/Claude. Tampoco custodia llaves ni firma transacciones. Su trabajo es recibir contexto desde la extensión, lanzar el agente correcto con los skills/MCPs necesarios, mostrar qué está haciendo el agente y devolver el resultado al navegador.

### Core flow

```text
dApp / Wallet
    ↓
WallyOS Browser Extension
    ↓
WallyOS Desktop Companion
    ↓
Codex / Claude Code
    ↓
Skills / MCPs / CLIs
    ↓
analysis / recommendation / prepared action
    ↓
WallyOS Extension
    ↓
Wallet approval
```

### Problema que resuelve

Hoy un navegador no puede ejecutar directamente `codex exec` o `claude` por restricciones de seguridad. Además, queremos reutilizar los agentes que el usuario ya tiene instalados, sin pedir una API key ni montar otro backend de IA.

La Desktop Companion resuelve exactamente esa capa local.

### Responsabilidades principales

* Detectar qué agentes están instalados:

  * Codex
  * Claude Code
  * Hermes, después
* Recibir requests desde la extensión.
* Lanzar el agente local.
* Pasarle:

  * contexto de la página
  * contexto de wallet
  * contrato
  * calldata
  * intención del usuario
  * skill requerido
* Permitir que el agente use:

  * ClaimOS
  * portfolio skills
  * risk tools
  * rebalance tools
  * MCPs
  * CLIs
* Recoger la respuesta estructurada.
* Devolverla a la extensión.
* Mostrar actividad al usuario.

### MVP UI

Solo necesita 3 vistas.

**1. Status**

```text
WallyOS Companion

Codex        Connected
Claude Code  Not installed

Browser      Connected
Wallet       MetaMask

Agent Runtime
● Ready
```

**2. Active task**

```text
Analyzing interaction

uniswap-example.xyz

Agent:
Codex

Skill:
ClaimOS Security

Running:
✓ Inspect domain
✓ Decode transaction
✓ Check approvals
→ Simulate transaction
```

**3. Result**

```text
DANGEROUS

The website says:
Claim rewards

Actual transaction:
Unlimited USDC approval

Recommendation:
Do not sign
```

### MVP features

```text
Agent detection
Extension pairing
Local IPC / Native Messaging
codex exec runner
Claude Code runner
Skill selection
Structured input
Structured output
Execution logs
Cancel task
```

Nada más para la primera versión.

### Input contract

La extensión manda algo como:

```json
{
  "task": "security_review",
  "agent": "codex",
  "skill": "claimos",
  "context": {
    "url": "...",
    "pageText": "...",
    "wallet": "0x...",
    "chainId": 8453,
    "contract": "0x...",
    "rpcMethod": "eth_sendTransaction",
    "calldata": "0x..."
  }
}
```

### Output contract

La app devuelve:

```json
{
  "status": "completed",
  "verdict": "DANGEROUS",
  "summary": "...",
  "recommendedAction": "DO_NOT_SIGN",
  "agent": "codex",
  "skill": "claimos"
}
```

### Arquitectura interna

```text
Tauri App
│
├── Browser Bridge
├── Agent Registry
├── Task Router
├── Codex Runner
├── Claude Runner
├── Skills Registry
├── MCP Configuration
├── Process Monitor
└── Result Stream
```

### Lo importante conceptualmente

WallyOS Desktop Companion no debería quedar amarrada a ClaimOS.

Hoy:

```text
security_review
→ ClaimOS
```

Mañana:

```text
portfolio_review
→ Portfolio Skill

rebalance
→ Risk + Portfolio Skill

yield_scan
→ DeFi Skill

claim_discovery
→ ClaimOS

transaction_execution
→ Execution Skill
```

Eso es lo que convierte la app en la base del **marketplace agéntico para wallets**, en vez de ser solamente una app de seguridad.

La definición más corta sería:

> **WallyOS Companion is the local agent runtime that connects browser wallets with Codex, Claude and a marketplace of Web3 skills.**
