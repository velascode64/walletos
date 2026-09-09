# WalletOS — Design Definition

Status: Draft / Source of Truth  
Product: WalletOS  
Document Type: Design Definition  
Audience: Product, Design, Engineering, Codex, AI agents implementing UI  
Related Docs:
- `docs/PRODUCT_DEFINITION.md`
- `docs/TECH_ARCHITECTURE.md`

---

# 1. Purpose

This document defines the visual system, interaction design principles, component rules, and product surface distinctions for WalletOS.

It is not a mockup file.

It is the implementation-oriented design source of truth that engineering agents should use to create:
- UI components
- screen layouts
- themes
- interaction states
- extension experiences
- future product surfaces

This document exists to ensure WalletOS feels coherent as a product system, not just as a browser sidebar.

---

# 2. Core Design Principle

WalletOS should feel like:

> an intelligent operating-system layer for Web3

not like:
- a trading dashboard
- a DeFi terminal
- a wallet clone
- a noisy crypto analytics app

Design qualities:

- calm
- trustworthy
- minimal
- contextual
- intelligent
- premium but restrained
- agentic
- highly scannable
- friendly without looking playful

WalletOS should visually communicate:
- intelligence
- safety
- control
- clarity
- reversible decision-making
- human approval before execution

---

# 3. Critical Product Distinction

## 3.1 WalletOS Product vs WalletOS Extension

This distinction must remain explicit in all design and implementation work.

### WalletOS Product
WalletOS is the full intelligence platform.

It includes:
- the product vision
- the agent layer
- the skill/plugin system
- the orchestration model
- the local runtime / desktop companion
- the extension surface
- future interfaces for tasks, settings, skills, and history

The product is bigger than the extension.

### WalletOS Extension
The extension is the primary user interface surface for the MVP.

It is:
- the browser-based contextual UI
- the place where Web3 interactions are detected
- the place where analysis is shown
- the place where the user chooses whether to analyze or continue
- the place where the user sees what the agent is doing
- the place where the user is routed to the signing wallet

The extension is not the whole product.

### Implementation Rule
When designing or coding, do not collapse “WalletOS” into “the sidebar”.

The sidebar is only one surface of the product.

---

# 4. Product Surfaces

WalletOS should be designed as a multi-surface system.

## 4.1 Surface A — Browser Extension (Primary MVP Surface)
Purpose:
- contextual Web3 interaction layer
- transaction/signature analysis
- agent progress
- verdict display
- user decision point

Primary UI patterns:
- right sidebar
- contextual prompts
- floating activity bar
- small notification states
- action cards
- conversational task input

## 4.2 Surface B — Desktop / Local Runtime Surface
Purpose:
- local agent/runtime visibility
- connection status
- logs/history
- installed skills
- agent settings
- debugging and system health

This surface is more operational and system-oriented than the extension.

## 4.3 Surface C — Product-Level Settings / Skill Management
Purpose:
- configure analysis rules
- manage skills/plugins
- defaults and permissions
- trusted sites
- notification preferences
- theme preferences
- security preferences

This can live in extension settings first, but conceptually belongs to the broader product.

---

# 5. Design Positioning

WalletOS should combine inspiration from:

- ChatGPT Agent / browser agent experiences
- wallet transaction clarity (MetaMask / Phantom / Rabby only in terms of trust and approval clarity)
- operating system side panels
- modern productivity tools
- lightweight IDE/plugin systems

But visually, it should avoid:
- excessive crypto gradients everywhere
- overuse of glassmorphism
- trading chart aesthetics
- “cyberpunk” clichés
- NFT-era neon overload

The product should feel more like:
> “AI operating layer for Web3”
than:
> “crypto dashboard”

---

# 6. Brand Foundation

The WalletOS brand is derived from the owl logo.

The owl communicates:
- intelligence
- vigilance
- security awareness
- contextual awareness
- night vision / signal detection
- calm confidence

This is a strong brand metaphor and should guide the design language.

---

# 7. Brand Personality

WalletOS should feel:

- observant
- precise
- protective
- intelligent
- modern
- intentional
- lightweight
- agentic

It should not feel:

- loud
- speculative
- meme-like
- overly financial
- childish
- aggressively hacker-themed

---

# 8. Color Strategy

The brand system should use:
- white
- black
- a restrained neutral grayscale
- owl-derived purple/violet tones
- selective warm highlights from the owl logo

The brand is not monochrome, but it should be grounded in white and black.

That means:

- white/near-white is the main canvas in light mode
- black/near-black is the main canvas in dark mode
- brand colors are used intentionally, not everywhere

---

# 9. Primary Brand Palette (Derived from Logo)

The following palette is extracted from the owl logo and should be treated as the core WalletOS brand palette.

## 9.1 Core Brand Colors

### Owl Violet
- `#5C25F2`
- Main brand accent
- Use for primary actions, active states, important highlights

### Deep Indigo
- `#1A0857`
- Brand depth color
- Use in dark panels, icons, strong emphasis, dark gradients

### Midnight Core
- `#0C032B`
- Deepest brand tone
- Use for dark backgrounds, dramatic contrast areas, premium sections

### Royal Purple
- `#8E38F2`
- Secondary accent
- Use for secondary highlights, tabs, badges, active surfaces

### Orchid
- `#A651EE`
- Supporting accent
- Use for subtle fills, hover lights, decorative gradient transitions

### Soft Magenta
- `#CD6BE1`
- Supplemental gradient color
- Use sparingly in lighting or highlight moments

## 9.2 Warm Signal Colors from Logo

### Peach Glow
- `#F09B9B`
- Warm transition tone
- Use in premium accent gradients or decorative emphasis only

### Amber
- `#F3A063`
- Warm brand accent
- Use sparingly for important emphasis or high-attention non-error states

### Signal Yellow
- `#FCD763`
- Use for eyes / alert-inspired accents
- Best used for subtle highlights, focus glows, or intelligent “signal detected” moments

---

# 10. Neutral Palette

## 10.1 Light Theme Neutrals

### Pure White
- `#FFFFFF`
- Main surface

### Soft White
- `#F8F9FA`
- App background

### Light Border
- `#E5E7EB`
- Standard borders

### Soft Gray
- `#D1D5DB`
- Disabled borders, dividers

### Muted Text
- `#6B7280`
- Secondary text

### Body Text
- `#111318`
- Primary text

## 10.2 Dark Theme Neutrals

### True Black
- `#000000`
- Used selectively for immersive surfaces

### Carbon
- `#0F1115`
- Main dark background

### Panel Black
- `#131722`
- Dark panels

### Elevated Dark Surface
- `#181C25`
- Cards and nested surfaces

### Dark Border
- `#2A3140`
- Borders in dark theme

### Dark Secondary Text
- `#99A1B3`
- Secondary dark text

### Dark Primary Text
- `#F5F7FB`
- Primary dark text

---

# 11. Semantic Colors

Semantic colors should remain separate from branding.

## Success
- Base: `#16A34A`
- Light BG: `#ECFDF3`
- Dark BG: `rgba(22, 163, 74, 0.14)`

## Warning
- Base: `#F59E0B`
- Light BG: `#FFFBEB`
- Dark BG: `rgba(245, 158, 11, 0.14)`

## Danger
- Base: `#DC2626`
- Light BG: `#FEF2F2`
- Dark BG: `rgba(220, 38, 38, 0.14)`

## Info
- Base: `#2563EB`
- Light BG: `#EFF6FF`
- Dark BG: `rgba(37, 99, 235, 0.14)`

Rule:
Do not use brand purple for destructive states.
Danger should remain clearly red.

---

# 12. Brand Gradients

Gradients should be used selectively and intentionally.

## 12.1 Primary Gradient
For hero elements, logo treatments, or premium selected states:

- `#5C25F2 → #8E38F2 → #A651EE`

## 12.2 Warm Signal Gradient
For brand moments, night light accents, or focused highlights:

- `#8E38F2 → #F09B9B → #FCD763`

## 12.3 Deep Gradient
For dark surfaces or rich hero panels:

- `#0C032B → #1A0857 → #5C25F2`

Rule:
Do not fill the entire app with gradients.
Gradients are accents, not the default background system.

---

# 13. Theme System

WalletOS must support a dual-base theme system:

- Light theme
- Dark theme

and an additional ambient layer:

- Night Light system

## 13.1 Light Theme
Use when the product needs:
- maximum clarity
- daytime usability
- high legibility
- a calm modern workspace feel

Primary characteristics:
- white surfaces
- light gray borders
- black/dark gray text
- purple accent
- restrained colored emphasis

## 13.2 Dark Theme
Use when the product needs:
- immersive focus
- alignment with technical users
- nighttime comfort
- premium operating-layer feel

Primary characteristics:
- black / near-black backgrounds
- dark elevated panels
- light text
- restrained glow accents
- subtle purple highlights

---

# 14. Night Light System

Night Light is not simply “dark mode”.

It is an ambient visual system that makes WalletOS feel alive, intelligent, and context-aware, especially during active agent states.

It should feel like:
> subtle illumination from an intelligent system working in the background

not:
> flashy neon effects

## 14.1 Purpose of Night Light
Night Light exists to:
- reinforce focus during analysis
- create brand atmosphere
- highlight important system states
- give motion and life to the interface
- connect visually with the owl / night-vision brand idea

## 14.2 When Night Light Appears
Night Light may appear in:

- active analysis states
- focused sidebar states
- “agent is working” overlays
- premium panels
- onboarding / empty states
- high-value product moments

It should not be permanently aggressive.

## 14.3 Night Light Characteristics
Night Light is composed of:
- soft radial glows
- subtle edge illumination
- low-opacity gradient washes
- faint dotted or particle-like ambient patterns
- focused lighting behind key cards or active zones

Suggested brand colors for Night Light:
- `#5C25F2`
- `#8E38F2`
- `#A651EE`
- `#FCD763` very sparingly

## 14.4 Night Light Intensity Levels

### Off
No ambient lighting beyond normal shadows and surfaces.

### Soft
Very subtle glow behind the sidebar or active chip.

### Focused
Visible ambient glow around active task areas.

### Active
Slightly stronger glow used while the agent is analyzing or executing.

Rule:
Default to Soft.
Use Active only when the product is doing something important.

## 14.5 Night Light Guardrails
Do not:
- create blurred rainbow backgrounds everywhere
- reduce readability
- overwhelm content
- make cards look like gaming UI

Night Light must always remain secondary to content clarity.

---

# 15. Typography

WalletOS typography should be neutral, modern, and highly legible.

Recommended:
- Geist
- Inter
- SF Pro
- a similarly clean sans-serif

## Type Scale

### Display
- 28–32px
- used sparingly in landing or larger product surfaces

### H1
- 24px
- semibold

### H2
- 20px
- semibold

### H3
- 16px
- semibold

### Body
- 14px
- regular / medium

### Meta
- 12–13px
- medium / regular

Rule:
Prefer dense clarity over marketing dramatics.
The extension especially should stay compact and scannable.

---

# 16. Spacing System

Use a predictable spacing scale.

Recommended base scale:
- 4
- 8
- 12
- 16
- 20
- 24
- 32

Rules:
- cards: 16–20px internal padding
- compact list rows: 10–12px vertical padding
- modal/panel sections: 20–24px padding
- screen sections: 24–32px

---

# 17. Corner Radius

Rounded corners should feel modern and calm.

Recommended system:
- small elements: `10px`
- cards: `14px`
- major panels: `16px`
- floating overlays: `18px`
- pills / chips: full or `999px`

Rule:
Do not mix too many radii randomly.

---

# 18. Elevation and Shadows

WalletOS should use soft elevation, not heavy dark shadows.

## Light Theme
- thin border first
- soft shadow second

## Dark Theme
- elevation through contrast
- minimal shadow
- subtle internal glows are acceptable

Rule:
Borders define structure more than shadows.

---

# 19. Motion System

Motion should feel quick, soft, and intentional.

## Timing
- micro interactions: 120–160ms
- panel transitions: 180–240ms
- overlay entry: 160–220ms

## Easing
Use smooth, non-bouncy motion.

## Common Motions
- sidebar slide-in
- card expand/collapse
- progress item reveal
- hover fade
- ambient glow pulse
- agent status shimmer

Rule:
No exaggerated animation.
WalletOS is calm, not playful.

---

# 20. Iconography

Icons should be:
- simple
- outlined or lightly filled
- consistent stroke weight
- recognizable at small sizes

Core icon families:
- shield / security
- wallet
- signature
- transaction
- plug / skill
- spark / intelligence
- warning / risk
- network / chain
- search / inspect
- stop / take control

Avoid overly cartoonish iconography.

---

# 21. Extension Layout Definition

The extension should be designed first as a right sidebar.

## 21.1 Sidebar Width
Recommended:
- `380px – 420px`
- ideal default: `400px`

## 21.2 Sidebar Structure
1. Header
2. Context block
3. Main content area
4. Status / analysis flow
5. Primary action zone
6. Footer input / quick actions

## 21.3 Header
Must include:
- WalletOS logo or mark
- current site / protocol
- wallet/address summary
- network
- close button
- optional overflow menu

## 21.4 Content Area
Should support:
- idle state
- interaction detected state
- analyzing state
- safe/review/dangerous result states
- future agent task state

## 21.5 Footer
Should support:
- “Ask WalletOS…” input
- quick action entry points
- optional skill/context selectors in future versions

---

# 22. Main Product Layout Definition

The broader WalletOS product must not be designed like the extension.

The full product surface can support:
- skills
- preferences
- trust settings
- runtime status
- task history
- connected wallets
- analysis logs
- system health
- future marketplace

This product-level surface can be wider, more navigational, and more structured than the sidebar.

Extension = contextual  
Product surface = operational + configurable

---

# 23. Component Philosophy

Components should be:
- composable
- predictable
- neutral by default
- theme aware
- state driven
- easy for agents to generate consistently

The design system should favor reusable primitives over one-off screens.

---

# 24. Core Component Set

The agent should create a reusable component system including at least:

## Foundational
- Button
- IconButton
- Input
- TextArea
- Select
- Toggle
- Switch
- Checkbox
- Radio
- Tabs
- Badge
- Tag / Chip
- Divider
- Tooltip

## Layout
- Panel
- Card
- Section
- Stack
- Inline
- Grid
- SidebarShell
- FloatingBar

## Feedback
- Alert
- Notice
- Toast
- ProgressStep
- StatusPill
- LoadingRow
- Skeleton

## Wallet / Web3 Specific
- TransactionCard
- SignatureCard
- AssetRow
- AddressPill
- NetworkPill
- VerdictBanner
- EvidenceList
- SkillChip
- AgentProgressBlock
- ApprovalSummary
- ExecutionPlanCard

---

# 25. Button System

## Primary Button
Use for:
- Analyze
- Continue to wallet
- Review in wallet
- Install skill
- Save settings

Light theme:
- filled brand purple
- white text

Dark theme:
- slightly brighter purple fill
- white text

## Secondary Button
Use for:
- View details
- Configure
- Expand
- Retry

Style:
- subtle border
- neutral surface

## Tertiary/Text Button
Use for:
- Continue without WalletOS
- Cancel
- Learn more

## Destructive Button
Use for:
- Block transaction
- Remove trusted site
- Uninstall skill

Use red semantic color, never purple.

---

# 26. Status System

WalletOS must visually support the following states:

- Idle
- Interaction detected
- Awaiting user choice
- Analyzing
- Safe
- Review
- Dangerous
- Unknown
- Waiting for wallet
- Completed
- Failed

Each state must have:
- color behavior
- icon behavior
- messaging rules
- action rules

---

# 27. Message Design Rules

WalletOS should not dump raw reasoning.

Messages should be:
- concise
- observable
- user-meaningful
- actionable

Good:
- Transaction decoded
- Contract identified
- Checking token permissions
- Simulation completed
- Unlimited approval detected

Bad:
- Long hidden reasoning exposition
- speculative verbose AI monologue
- internal chain-of-thought

---

# 28. Copy Tone

WalletOS copy should be:
- clear
- calm
- slightly assistant-like
- not robotic
- not overly chatty

Preferred tone:
- “Looks safe”
- “High-risk transaction detected”
- “Checking token permissions”
- “Waiting for your approval”

Avoid:
- meme language
- hype language
- excessive exclamation points
- fear-mongering

---

# 29. Light / Dark / Night Light Usage Rules

## Default Product Rule
- support both light and dark themes
- default theme can follow system preference
- night light is an enhancement layer, not a separate complete theme

## Recommendation
For extension:
- light theme is excellent for clarity
- dark theme is excellent for premium/security perception

## Suggested default
- system theme by default
- Night Light enabled in soft mode during active agent states

---

# 30. Surface Rules for Extension

The extension must feel contextual.

That means:
- it should appear when needed
- it should not dominate the entire screen
- it should not look like a full dashboard
- it should close when the interaction is resolved or skipped
- dangerous states may remain open longer
- active agent states may show overlay controls

---

# 31. Floating Agent Bar

The extension system should include a floating bottom bar for active tasks.

Purpose:
- show the agent is doing work on the page
- allow interruption
- create confidence and transparency

Can include:
- status text
- Take control
- Stop

Style:
- dark floating pill in light theme or darker elevated pill in dark theme
- compact
- high contrast
- subtle Night Light edge glow allowed during active tasks

---

# 32. Accessibility Rules

All components must be accessible.

Minimum expectations:
- sufficient contrast
- visible focus states
- keyboard navigation
- ARIA labels where relevant
- motion should be reducible
- color should not be the only signal of meaning

Verdict states must always include:
- icon
- label
- explanatory text

not just color.

---

# 33. Design Tokens

Engineering should implement themeable design tokens.

Minimum token groups:

- colors
- typography
- spacing
- radius
- shadows
- border widths
- motion timing
- motion easing
- z-index layers
- opacity values
- glow/ambient Night Light tokens

Suggested naming style:

- `color.bg.primary`
- `color.bg.surface`
- `color.text.primary`
- `color.text.secondary`
- `color.border.default`
- `color.brand.primary`
- `color.brand.secondary`
- `color.semantic.success`
- `motion.duration.fast`
- `radius.card`
- `shadow.panel`
- `glow.nightlight.soft`

---

# 34. Required Brand Tokens

Suggested first-pass token mapping:

## Brand
- `brand.primary = #5C25F2`
- `brand.secondary = #8E38F2`
- `brand.tertiary = #A651EE`
- `brand.deep = #1A0857`
- `brand.midnight = #0C032B`
- `brand.warm = #F09B9B`
- `brand.amber = #F3A063`
- `brand.signal = #FCD763`

## Light
- `bg.app = #F8F9FA`
- `bg.surface = #FFFFFF`
- `text.primary = #111318`
- `text.secondary = #6B7280`
- `border.default = #E5E7EB`

## Dark
- `bg.dark.app = #0F1115`
- `bg.dark.surface = #131722`
- `bg.dark.elevated = #181C25`
- `text.dark.primary = #F5F7FB`
- `text.dark.secondary = #99A1B3`
- `border.dark.default = #2A3140`

---

# 35. Night Light Tokens

Suggested tokens:

- `glow.nightlight.soft = rgba(92, 37, 242, 0.10)`
- `glow.nightlight.focus = rgba(142, 56, 242, 0.16)`
- `glow.nightlight.active = rgba(166, 81, 238, 0.22)`
- `glow.signal.soft = rgba(252, 215, 99, 0.14)`

Implementation hints:
- use layered box shadows or pseudo-elements
- keep blur high
- keep opacity low
- never let glow replace borders or hierarchy

---

# 36. Visual Hierarchy Rules

1. Meaning before decoration
2. Transaction/action before metadata
3. Verdict before evidence detail
4. Primary action before optional actions
5. Content before glow
6. Sidebar before overlay noise

The most important user question should always be visually answered first.

Examples:
- What is happening?
- Is it safe?
- What should I do next?

---

# 37. Engineering / Agent Instructions

Any agent implementing WalletOS UI should follow these rules:

1. Treat this file as the visual source of truth.
2. Do not design WalletOS as a generic crypto dashboard.
3. Keep the distinction clear between:
   - WalletOS Product
   - WalletOS Extension
4. Use white/black as base system colors.
5. Use owl-derived purple tones as the primary brand accent.
6. Use warm colors from the logo sparingly.
7. Implement light theme, dark theme, and Night Light ambient support.
8. Build reusable components instead of one-off screens.
9. Ensure all components are theme-aware.
10. Keep transaction and analysis UIs highly scannable.
11. Keep motion subtle and premium.
12. Never use branding in a way that reduces clarity or trust.

---

# 38. MVP Design Deliverables

For the first implementation, the design system must support:

## Extension States
- Idle
- Web3 interaction detected
- Analyzing
- Safe
- Dangerous
- Agent executing
- Waiting for wallet

## Foundational UI
- tokens
- theme system
- component primitives
- sidebar shell
- floating task bar
- verdict cards
- analysis progress blocks

## Theme Support
- light
- dark
- Night Light ambient layer

---

# 39. Final Design Definition

WalletOS is a product platform with multiple surfaces.

The extension is its first and primary contextual UI surface, but it is not the entire product.

The visual identity of WalletOS should be grounded in:
- white
- black
- disciplined neutrals
- owl-derived violet/purple brand colors
- selective warm signal accents

Its interaction design should feel:
- calm
- intelligent
- trustworthy
- contextual
- agentic

Its visual enhancement layer, Night Light, should add subtle ambient intelligence without overpowering the UI.

All future components and screens should preserve this rule:

> WalletOS should feel like an intelligent operating layer for Web3, not like another crypto dashboard.