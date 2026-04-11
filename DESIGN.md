# Design System Inspiration of FWTI

> **FWTI（Fèiwù Type Indicator · 恋爱废物人格测试）** — A Chinese self-deprecating romance personality quiz. 16 archetypes + 8 hidden types, built with Solid.js + Vike SSG.

---

## 1. Visual Theme & Atmosphere

FWTI's design is a tonal contradiction that mirrors its content: a quiz that calls you a romantic disaster, presented with the restraint and precision of a serious design system. The dominant visual is a full-bleed **emerald green** (`#33a474`) hero against zinc-neutral surfaces — a warmth that disarms before the roast lands.

**Key Characteristics:**

- **Primary surface**: Pure white `#ffffff` (light) / near-black `#09090b` (dark). The zinc family — not gray, not slate — creates a cooler undertone that distances the brand from clinical MBTI aesthetics.
- **Signature accent**: FWTI Green `#33a474` saturates heroes, progress fills, selected states, and call-to-action buttons. It signals forward motion and choice in an otherwise neutral chrome.
- **Four family colors as a second accent layer**: GZ Coral `#F25E62`, GR Amber `#E4AE3A`, DZ Purple `#88619A`, DR Green `#33A474` each tint the personality result page via a `data-family` override, so every result card feels distinctly personal while sharing the same spatial grammar.
- **Glassmorphism bars**: Both the sticky top nav and the fixed submit bar use `backdrop-filter: saturate(160%) blur(10px)` — the only "effect" in the system. Everything else is flat.
- **Typography pairing**: `Red Hat Display` (display weight 700, humanist geometry) for all headings, paired with `Inter` for body copy and `Noto Sans SC` as the CJK fallback. The combination reads authoritative in Latin and natural in Simplified Chinese.
- **Radii vocabulary**: Four tiers — `999px` pill (badges, progress bars, chips), `20–24px` (card tiles, advice block), `12–16px` (modals, tip cards), `6–8px` (small buttons, logo mark). Pills carry playfulness; lower radii carry seriousness.
- **Elevation strategy**: Almost entirely border-based (`1px solid #e4e4e7`). Real shadows appear only on hover lifts (`translateY(-4px)`), modals, and share image previews — used sparingly to signal interactivity, not decoration.
- **Motion philosophy**: All transitions are `0.15s ease` for micro-interactions and `0.2–0.25s ease` for lift hovers. Modal entry uses `cubic-bezier(0.16, 1, 0.3, 1)` — a spring curve that feels snappy on mobile. Progress bars use `0.8s cubic-bezier(0.22, 0.61, 0.36, 1)`.
- **Dark mode**: Full first-class support via `[data-theme='dark']` attribute toggled from `localStorage`, with a FOUC-prevention inline script in `<head>`. Dark surfaces use `#09090b` / `#18181b` / `#27272a` — no blue tint, just deep zinc.
- **Accessibility signature**: Focus rings use `2px solid var(--fwti-accent)` with `outline-offset: 2–3px` consistently across all interactive elements.

---

## 2. Color Palette & Roles

### Primary Brand

- **FWTI Green** (`#33a474`): `--fwti-green`. The primary call-to-action, hero background, progress fill, selected-state border. Derived from DR (犹豫忍耐) family.
- **FWTI Green Dark** (`#278a60`): `--fwti-green-dark`. Hover state for `.btn-green`; slightly deeper push-down effect.
- **Accent Tint Default** (`rgba(51, 164, 116, 0.08)`): `--fwti-accent-tint`. Radial glow behind portrait images; background of "best match" cards when accent is green.

### Personality Family Colors

- **GZ Coral** (`#F25E62`): `--fwti-gz`. 冲动暴躁 family. Tile gradient tint `rgba(242, 94, 98, 0.08)`.
- **GR Amber** (`#E4AE3A`): `--fwti-gr`. 冲动忍耐 family. Tile gradient tint `rgba(228, 174, 58, 0.10)`.
- **DZ Purple** (`#88619A`): `--fwti-dz`. 犹豫暴躁 family. Tile gradient tint `rgba(136, 97, 154, 0.08)`.
- **DR Green** (`#33A474`): `--fwti-dr`. 犹豫忍耐 family (same as primary green).

### Hidden Personality Accents

- **ALL Gray** (`#6B7280`): 我全都要 — neutral ambiguity made literal.
- **RAT Charcoal** (`#4A4A4A`): 鼠鼠恋人 — blends into shadows.
- **PURE Sand** (`#D4A574`): 纯爱战士 — warm parchment.
- **MAD Red** (`#C73E3E`): 发疯文学家 — urgent, alarming.
- **E-DOG Pink** (`#E8A5C8`): 赛博舔狗 — soft sakura.
- **CHAOS Lavender** (`#B7A4D1`): 已读乱回 — scattered violet.
- **CPU Orange** (`#E07A2B`): CPU 恋人 — processing amber.
- **BENCH Tan** (`#CBB89A`): 备胎之王 — resigned beige.
- **VOID Slate** (`#3B4252`): 电子断联户 — dark Nordic blue-gray.
- **LIMBO Mauve** (`#5A3A5E`): 意难平学家 — nostalgic purple.

### Neutral Scale (Light Mode)

- **Surface White** (`#ffffff`): `--fwti-bg`, `--fwti-surface`. Page background, modal background.
- **Soft Background** (`#f4f4f5`): `--fwti-bg-soft`. Card backgrounds, quiz option default, advice section fill.
- **Tinted Background** (`#f4f4f5`): `--fwti-bg-tint`. Quiz option selected state background.
- **Text Dark** (`#18181b`): `--fwti-text-dark`. All primary text, headings.
- **Text Mid** (`#52525b`): `--fwti-text-mid`. Secondary labels, nav items, metadata.
- **Text Soft** (`#71717a`): `--fwti-text-soft`. Tertiary hints, eyebrows, disclaimers.

### Neutral Scale (Dark Mode)

- **Background** (`#09090b`): `--fwti-bg` (dark). Page background.
- **Surface** (`#18181b`): `--fwti-bg-soft`, `--fwti-surface` (dark). Card backgrounds.
- **Tinted** (`#27272a`): `--fwti-bg-tint` (dark). Hover states, chips.
- **Text Dark** (`#fafafa`): `--fwti-text-dark` (dark). Primary text.
- **Text Mid** (`#a1a1aa`): `--fwti-text-mid` (dark). Secondary labels.
- **Elevated Surface** (`#3f3f46`): `--fwti-border-strong` (dark). Strong borders, dot empties.

### Surface & Borders

- **Border Default Light** (`#e4e4e7`): `--fwti-border`. All card borders, dividers, input borders.
- **Border Strong Light** (`#d4d4d8`): `--fwti-border-strong`. Hover borders, outline button border.
- **Border Default Dark** (`#27272a`): `--fwti-border` (dark).
- **Border Strong Dark** (`#3f3f46`): `--fwti-border-strong` (dark).
- **Nav Background Light** (`rgba(255, 255, 255, 0.92)`): `--fwti-nav-bg`. Frosted glass bar.
- **Nav Background Dark** (`rgba(9, 9, 11, 0.92)`): `--fwti-nav-bg` (dark).
- **Submit Bar Light** (`rgba(255, 255, 255, 0.96)`): `--fwti-submit-bar-bg`. Denser frost.
- **Modal Background Light** (`#ffffff`): `--fwti-modal-bg`.
- **Modal Background Dark** (`#18181b`): `--fwti-modal-bg` (dark).
- **Modal Border Light** (`rgba(0, 0, 0, 0.08)`): `--fwti-modal-border`.
- **Modal Border Dark** (`rgba(255, 255, 255, 0.10)`): `--fwti-modal-border` (dark).

### Shadow Colors

- **Preview Tile Shadow Light** (`rgba(0, 0, 0, 0.08)`): `--fwti-preview-tile-shadow`. Hover lifts on grid tiles and legend chips.
- **Preview Tile Shadow Dark** (`rgba(0, 0, 0, 0.35)`): `--fwti-preview-tile-shadow` (dark).
- **Match Card Shadow Light** (`rgba(0, 0, 0, 0.08)`): `--fwti-match-card-shadow`. Hover on compatibility cards.
- **Match Card Shadow Dark** (`rgba(0, 0, 0, 0.40)`): `--fwti-match-card-shadow` (dark).
- **Modal Shadow Key Light** (`rgba(0, 0, 0, 0.18)`): Spread layer in `--fwti-modal-box-shadow`.
- **Modal Shadow Rim Light** (`rgba(0, 0, 0, 0.04)`): Ring layer in `--fwti-modal-box-shadow`.
- **Modal Shadow Key Dark** (`rgba(0, 0, 0, 0.55)`): Spread layer in dark modal box-shadow.
- **Modal Shadow Rim Dark** (`rgba(255, 255, 255, 0.06)`): Subtle light rim in dark modal.
- **Overlay Light** (`rgba(10, 10, 10, 0.55)`): `--fwti-overlay`. Modal/drawer backdrop.
- **Overlay Dark** (`rgba(0, 0, 0, 0.72)`): `--fwti-overlay` (dark). Denser backdrop.

---

## 3. Typography Rules

Google Fonts loaded: `Inter:wght@400;500;600`, `Red Hat Display:wght@500;700`, `Noto Sans SC:wght@400;500;700`.  
Global: `font-feature-settings: 'palt'` on `<body>` for proportional kana spacing. Base: `16px` root.

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|---|
| Result Name (hero) | Red Hat Display | 64px (4.00rem) | 700 | 1.05 (tight) | −1.28px (−0.02em) | Largest CJK heading |
| Result Eng (hero) | Red Hat Display | 68px (4.25rem) | 700 | 1.20 | normal (0) | Uppercase, fixed-width per-char cells |
| Home H1 Title | Red Hat Display | 56px (3.50rem) | 700 | 1.12 (tight) | −0.56px (−0.01em) | Collapses to 36px@720px, 30px@460px |
| Share Card Name | Red Hat Display | 38px (2.38rem) | 700 | 1.35 | −0.76px (−0.02em) | Export PNG card heading |
| Preview Section Title | Red Hat Display | 36px (2.25rem) | 700 | normal | −0.36px (−0.01em) | Collapses to 28px@720px |
| Section Title | Red Hat Display | 34px (2.13rem) | 700 | 1.15 (tight) | −0.34px (−0.01em) | Collapses to 26px@720px |
| Home Subtitle | Red Hat Display | 22px (1.38rem) | 600 | 1.35 | −0.22px (−0.01em) | Collapses to 17px@720px |
| Match Name | Red Hat Display | 22px (1.38rem) | 700 | 1.20 | normal | Compatibility card type name |
| Preview Tile Name | Red Hat Display | 20px (1.25rem) | 700 | normal | −0.20px (−0.01em) | Collapses to 16px@460px |
| Catchphrase | Red Hat Display | 20px (1.25rem) | 500 | 1.55 | normal | Blockquote personality quotes |
| Quiz Item Text | Red Hat Display | 26px (1.63rem) | 500 | 1.40 | normal | Collapses to 19px@460px |
| Quiz Hero Title | Red Hat Display | 32px (2.00rem) | 700 | normal | −0.32px (−0.01em) | Collapses to 24px@720px |
| Logo Text | Red Hat Display | 18px (1.13rem) | 700 | normal | +0.36px (+0.02em) | Nav brand name |
| Advice / Closing Quote | Red Hat Display | 26px (1.63rem) | 500 | 1.50 | normal | Large centered italic feel |
| Description Body | Inter | 17px (1.06rem) | 400 | 1.80 (relaxed) | normal | Personality result prose |
| Body / Option Text | Inter | 14px (0.88rem) | 400 | 1.55 | normal | Quiz option text, modal body |
| Nav / Small UI | Inter | 14px (0.88rem) | 500 | normal | +0.28px (+0.02em) | Nav links, restart button |
| Small Label / Hint | Inter | 13px (0.81rem) | 400–500 | 1.60 | normal | Tip descriptions, match hints |
| Eyebrow Label | Inter | 12px (0.75rem) | 600 | normal | +1.68px (+0.14em) | All-caps section markers |
| Code Badge / Mono | SF Mono / ui-monospace | 11px (0.69rem) | 600 | normal | +0.66px (+0.06em) | Personality code chips |
| Tag / Quiz Tag | Inter | 11px (0.69rem) | 600 | normal | +1.10px (+0.10em) | Pill tags (彩蛋, 前置) |

---

## 4. Component Stylings

### Buttons

**Primary Green (`.btn.btn-green`)**
- Background: `#33a474`
- Text: `#ffffff`
- Border: none
- Border Radius: `30px`
- Padding: `16px 32px`
- Font: Inter, 16px (1.00rem), weight 600
- Box Shadow: `0 4px 16px rgba(51, 164, 116, 0.25)`
- Hover: background `#278a60`, box-shadow `0 6px 20px rgba(51, 164, 116, 0.35)`
- Disabled: `opacity: 0.45`

**Accent (`.btn.btn-accent`)**
- Background: `var(--fwti-accent)` (family color on result page)
- Text: `#ffffff`
- Box Shadow: `0 4px 16px rgba(0, 0, 0, 0.12)`
- Hover: `filter: brightness(0.93)`

**White / Reverse (`.btn.btn-white`)**
- Background: `#ffffff`
- Text: `#33a474`
- Box Shadow: `0 4px 16px rgba(0, 0, 0, 0.08)`
- Hover: background `#f6fcf9`, box-shadow `0 6px 22px rgba(0, 0, 0, 0.12)`
- Used on dark hero backgrounds

**Outline (`.btn.btn-outline`)**
- Background: `transparent`
- Text: `#18181b` (var --fwti-text-dark)
- Border: `2px solid #d4d4d8`
- Box Shadow: none
- Hover: background `#f4f4f5`, border-color `#71717a`

**Nav Utility Button (`.nav-restart`)**
- Background: `#f4f4f5`
- Text: `#18181b`
- Border: `1px solid #e4e4e7`
- Border Radius: `8px`
- Padding: `8px 14px`
- Font: Inter, 14px, weight 500
- Hover: background `#e4e4e7`, border-color `#d4d4d8`

### Cards

**Personality Tile (`.preview-tile`)**
- Background: `linear-gradient(180deg, var(--tile-tint) 0%, var(--fwti-bg) 72%)`
- Border: `1px solid #e4e4e7`
- Border Radius: `20px`
- Padding: `26px 18px 22px`
- Hover: `transform: translateY(-4px)`, border-color changes to tile accent, `box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08)`
- Focus: `outline: 2px solid var(--tile-color)`, outline-offset 3px
- Grid: 4 columns on desktop → 2 columns at 720px

**Tip Card (`.tip-card`)**
- Background: `var(--fwti-surface)` = `#ffffff`
- Border: `1px solid #e4e4e7`
- Border Radius: `16px`
- Padding: `28px 24px`
- Box Shadow: `0 8px 32px rgba(0, 0, 0, 0.08)`
- Floats up via negative margin (`margin-top: -60px`) over the green hero

**Match Card (`.match-card`)**
- Background: `#ffffff` (worst), `var(--fwti-accent-tint)` (best)
- Border: `1px solid #e4e4e7` (worst), `1px solid var(--fwti-accent)` (best)
- Border Radius: `16px`
- Padding: `24px`
- Hover: `transform: translateY(-2px)`, `box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08)`
- Focus: `outline: 2px solid var(--fwti-accent)`, outline-offset 3px

**Hidden Title Card (`.hidden-title-card`)**
- Background: `var(--fwti-accent-tint)` (family tint)
- Border: `1px solid var(--fwti-accent)` (family color)
- Border Radius: `20px`
- Padding: `28px`

**Advice Block (`.advice-section`)**
- Background: `#f4f4f5`
- Border: `1px solid #e4e4e7`
- Border Radius: `24px`
- Padding: `56px 44px`

### Navigation (`.top-nav`)

- Position: `sticky`, `top: 0`, `z-index: 50`
- Background: `rgba(255, 255, 255, 0.92)` (light) / `rgba(9, 9, 11, 0.92)` (dark)
- Backdrop Filter: `saturate(160%) blur(10px)`
- Border Bottom: `1px solid #e4e4e7`
- Inner max-width: `1120px`, padding: `14px 32px`

### Quiz Option (`.quiz-opt`)

- Background: `#f4f4f5`
- Border: `2px solid #e4e4e7`
- Border Radius: `12px`
- Padding: `12px 16px`
- Font: 14px, weight 400, line-height 1.55
- Selected: border-color `#33a474`, background `#f4f4f5`, box-shadow `0 0 0 1px rgba(51, 164, 116, 0.20)`
- Hover: border-color `rgba(51, 164, 116, 0.35)`, box-shadow `0 2px 12px rgba(0, 0, 0, 0.04)`
- Option badge: 26×26px circle, bg `#52525b` → `#33a474` when selected

### Submit Bar (`.submit-bar`)

- Position: `fixed`, `bottom: 0`, `z-index: 40`
- Background: `rgba(255, 255, 255, 0.96)` / `rgba(9, 9, 11, 0.96)` dark
- Backdrop Filter: `saturate(160%) blur(10px)`
- Border Top: `1px solid #e4e4e7`
- Progress Track: 6px height, border-radius `999px`, fill animates at `0.4s cubic-bezier(0.22, 0.61, 0.36, 1)`

### Modal (`.preview-modal`, `.share-image-dialog`)

- Background: `#ffffff` / `#18181b` dark
- Border: `1px solid rgba(0, 0, 0, 0.08)` / `rgba(255, 255, 255, 0.10)` dark
- Border Radius: `12px`
- Padding: `32px`
- Max Width: `520px` (preview modal), `400px` (share dialog)
- Box Shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)`
- Backdrop: `blur(6px)`, background `rgba(10, 10, 10, 0.55)`
- Entry animation: `cubic-bezier(0.16, 1, 0.3, 1)` over `0.22s`, from `translateY(8px) scale(0.98)`

### Chips / Badges

**Code Chip (`.preview-modal-code`)**
- Padding: `3px 8px`
- Border Radius: `6px`
- Font: SF Mono, 11px, weight 600, letter-spacing 0.06em
- Background: `color-mix(in srgb, var(--tile-color) 10%, transparent)`
- Border: `1px solid color-mix(in srgb, var(--tile-color) 24%, transparent)`

**Tag Chip (`.quiz-item-tag`, `.share-image-chip`)**
- Padding: `4px 10px`
- Border Radius: `999px`
- Font: Inter, 11px, weight 600, letter-spacing 0.10em, uppercase
- Background: `#f4f4f5`, border: `1px solid #e4e4e7`

**Hidden Badge (`.hidden-badge`)**
- Background: `var(--fwti-accent)`
- Text: `#ffffff`
- Padding: `6px 14px`
- Border Radius: `999px`
- Font: 11px, weight 700, letter-spacing 0.14em, uppercase

**Legend Chip (`.legend-chip`)**
- Padding: `7px 13px 7px 11px`
- Border Radius: `999px`
- Background: `#f4f4f5`, border: `1px solid #e4e4e7`
- Font: 12px, weight 500
- Hover: box-shadow `0 2px 10px rgba(0, 0, 0, 0.08)`, border-color `#d4d4d8`

### Logo Mark (`.logo-mark`)

- Width/Height: `22px × 22px`
- Border Radius: `6px`
- Background: `#33a474`
- Pseudo `::after`: inset `6px`, border-radius `2px`, background `#ffffff` (white inner square)

### Catchphrase (`.catchphrase`)

- Font: Red Hat Display, 20px, weight 500
- Padding: `24px 28px`
- Background: `#f4f4f5`
- Border Left: `4px solid var(--fwti-accent)`
- Border Radius: `0` (intentionally flush)

---

## 5. Layout Principles

**Base Spacing Unit**: `8px`

**Key Spacing Scale** (used throughout the CSS):

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| sm+ | 10px |
| md | 12px |
| md+ | 14px |
| base | 16px |
| lg | 20px |
| xl | 24px |
| 2xl | 28px |
| 3xl | 32px |
| 4xl | 40px |
| 5xl | 44px |
| 6xl | 56px |
| 7xl | 64px |
| 8xl | 72px |
| 9xl | 80px |
| 10xl | 96px |

**Max-Width Containers:**

| Context | Max Width |
|---|---|
| Top nav inner | 1120px |
| Preview grid | 1280px |
| Home tips | 1000px |
| Preview legend | 920px |
| Quiz list | 720px |
| Quiz options | 620px |
| Result container | 760px |
| Submit bar inner | 960px |
| Hero inner | 820px |
| Modal | 520px |

**Whitespace Philosophy:**

**Breathing Room at Scale.** The home hero takes `72px 32px 120px` padding — generous vertical space that gives the large white-on-green type room to breathe. The bottom overhang `120px` creates the tip-card float overlap, a spatial trick that layers sections without a visible seam.

**Vertical Rhythm via Gap.** The quiz list uses `gap: 64px` between questions — approximately 8 baseline units of breathing room per item. This encourages deliberate reading over rapid scanning, matching the quiz's "slow down and reflect" tone.

**Section Breathing.** The result container uses `gap: 72px` between all sections — nearly `9rem`. This white space functions as a divider without a visible line; it tells readers each block is its own thought.

**Content-Width Discipline.** Body text blocks (`.result-desc`, `.refs-intro`) have `max-width: 620–680px` regardless of container width. This enforces ~70–80 characters per line for CJK prose, matching established typographic practice.

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | `border: 1px solid #e4e4e7` | Default cards, tip cards, quiz options, all nav |
| 1 — Subtle Lift | `0 2px 12px rgba(0, 0, 0, 0.04)` | Quiz option hover |
| 2 — Chip Hover | `0 2px 10px rgba(0, 0, 0, 0.08)` | Legend chip hover |
| 3 — Card Hover | `0 12px 28px rgba(0, 0, 0, 0.08)` | Match card hover |
| 4 — Tile Hover | `0 18px 40px rgba(0, 0, 0, 0.08)` | Preview personality tile hover |
| 5 — Tip Card | `0 8px 32px rgba(0, 0, 0, 0.08)` | Tip cards resting state (float above hero) |
| 6 — Button Green | `0 4px 16px rgba(51, 164, 116, 0.25)` | Primary green CTA |
| 7 — Button Hover | `0 6px 20px rgba(51, 164, 116, 0.35)` | Primary green CTA hover |
| 8 — Modal | `0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)` | All dialogs and share modals |
| 9 — Share Preview | `0 8px 28px rgba(0, 0, 0, 0.12)` | Share image preview thumbnail |
| Focus (Accessibility) | `2px solid var(--fwti-accent, #33a474)` outline, offset 2–3px | All keyboard-focusable elements |

**Shadow Philosophy:**

FWTI treats shadow as a verb, not a noun — it appears to communicate *interactivity* (hover) or *separation* (modal), never as mere decoration. The system avoids decorative drop shadows on static elements; resting cards are distinguished only by their `1px` border. This keeps the surface language clean while making hover lifts feel satisfyingly tactile. In dark mode, shadow opacity scales up significantly (key from `0.18` to `0.55`) to maintain perceived depth against the near-black background, where light borders lose contrast.

---

## 7. Do's and Don'ts

### Do's

- **Do** use `--fwti-green` (`#33a474`) as the only saturated accent on neutral pages; let the green hero carry the brand weight.
- **Do** apply `backdrop-filter: saturate(160%) blur(10px)` on all floating bars (nav, submit bar) to maintain visual connection between bar and content below.
- **Do** use `border-radius: 999px` for all pill elements (badges, progress bars, tags, chips) and `border-radius: 20px` for personality tile cards.
- **Do** maintain the `1px solid #e4e4e7` border on all resting surfaces — this is the primary differentiator between card and background, not shadow.
- **Do** use `translateY(-4px)` hover lifts on clickable cards to signal interactivity; pair with the `var(--fwti-preview-tile-shadow)` shadow.
- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` for modal entry animations and `cubic-bezier(0.22, 0.61, 0.36, 1)` for progress bar fills.
- **Do** override `--fwti-accent` and `--fwti-accent-tint` via `data-family` or inline style on the result container — the entire page theme follows from this single variable pair.
- **Do** use the zinc neutral family (`#18181b / #52525b / #71717a`) for text hierarchy — never generic gray.
- **Do** ensure focus rings are always `2px solid var(--fwti-accent)` with a minimum `outline-offset: 2px`.
- **Do** use `font-feature-settings: 'palt'` globally to tighten CJK spacing.

### Don'ts

- **Don't** introduce new saturated colors outside the four family palette (`#F25E62`, `#E4AE3A`, `#88619A`, `#33A474`) and the ten hidden personality accents — each new color dilutes the system's quadrant meaning.
- **Don't** use `box-shadow` on resting (non-hover) cards other than the tip cards floating over the hero; it breaks the flat/lift contrast hierarchy.
- **Don't** set `border-radius` below `6px` on interactive elements — the minimum is `6px` (small buttons, code chips) to match the rounded, approachable tone.
- **Don't** use font-weight values of `800` or `900` — the system caps at `700` for display type. Over-bold headings clash with the self-deprecating tone.
- **Don't** use `blur()` backdrop filter on anything other than the two bars (nav, submit) and modal backdrops (`blur(6px)`) — overuse degrades performance on older mobile devices.
- **Don't** break the `max-width` constraints on text blocks — `.result-desc` must stay ≤ `620px` wide; CJK prose above ~35em per line becomes hard to track.
- **Don't** remove the spring `cubic-bezier(0.16, 1, 0.3, 1)` from modal entry in favor of linear or `ease-out` — the spring feel is a deliberate character moment.
- **Don't** use color for the sole indicator of a selected quiz option — the `2px solid #33a474` border + `box-shadow: 0 0 0 1px rgba(51, 164, 116, 0.20)` double-ring is the required selection treatment.

---

## 8. Responsive Behavior

| Breakpoint | Width | Key Changes |
|---|---|---|
| Desktop | > 1100px | 4-column personality grid; nav padding `14px 32px`; hero title 56px |
| Tablet Large | ≤ 1100px | Preview grid gap reduces to `16px`; portrait images shrink to 160px |
| Tablet | ≤ 900px | Hero title collapses to 44px; portrait to 140px |
| Mobile | ≤ 720px | 2-col personality grid; match grid → 1 col; nav padding → `12px 20px`; hero title 36px; result name 44px; quiz question 21px; tip cards switch to horizontal scroll-snap strip |
| Mobile Small | ≤ 460px | Hero title 30px; result name 36px; result eng 38px; quiz question 19px; portrait 130px |

**Collapsing Strategy:**

The four-column personality grid hard-collapses to two columns at 720px (not a fluid column approach) — this preserves the card proportions and keeps portrait images readable. The tips section switches from a CSS Grid to a horizontal flex with `scroll-snap-type: x mandatory` and `scroll-padding-inline: 20px`, letting the three cards horizontalize into a swipe carousel on mobile without JavaScript. The `prefers-reduced-motion` media query disables the scroll-snap on this strip.

**Image Behavior:**

Portrait images use `aspect-ratio: 1/1` containers with a CSS mask (`radial-gradient(circle at 50% 48%, #000 45%, transparent 68%)`) that vignettes the circular portrait into the card background — no `<img>` border-radius or overflow clip needed. On the result hero, the portrait is 320px desktop → 240px mobile, with a CSS-only radial glow pseudo-element (`::before`) that adapts to `--fwti-accent-tint`.

**Touch Target Sizes:**

All interactive elements have a minimum touch target of 38×38px (`.theme-toggle`: exactly 38×38px). Quiz option buttons are full-width with `12px 16px` padding, creating a comfortable `44px+` height. The legend chip buttons are `7px 13px` padding — slightly below the recommended 44px minimum on very small screens but mitigated by the large text and spacing around them.

---

## 9. Agent Prompt Guide

### Example Component Prompts

- "Create a personality result hero section. Background white `#ffffff`. Central portrait image 320px wide with a radial gradient glow behind it using `rgba(51, 164, 116, 0.08)`. Above the image: eyebrow text in Inter 12px weight 600, letter-spacing 0.14em, all-caps, color `#52525b`, saying '测试完成 · 你的恋爱人格是'. Below image: a Chinese heading at 64px Red Hat Display weight 700, line-height 1.05, letter-spacing -1.28px (-0.02em), color `#18181b`. Below heading: large English text 68px Red Hat Display weight 700, line-height 1.20, color `#33a474`, uppercase, characters spaced in fixed 1em-wide cells. Below that: an italic tagline at 19px Inter weight 400, line-height 1.55, color `#52525b`. At the bottom: a pill badge with background `#f4f4f5`, border `1px solid #e4e4e7`, border-radius 999px, padding `12px 22px`, containing a '废物指数' label at 13px color `#52525b` and 5 dot indicators 9px circles colored `#d4d4d8` (empty) or `#33a474` (filled)."

- "Create a personality card grid tile. Card size ~280px, border-radius 20px. Background: linear-gradient from `rgba(242, 94, 98, 0.08)` at top to white `#ffffff` at 72% down. Border `1px solid #e4e4e7`. Padding `26px 18px 22px`. Centered content: a circular-vignette portrait image 180px wide, then a row with a code label 11px Red Hat Display weight 700 letter-spacing 0.24em in `#F25E62` and an English name 10px Inter weight 600 letter-spacing 0.20em uppercase in `#71717a`. Below: Chinese type name at 20px Red Hat Display weight 700 color `#18181b` letter-spacing -0.01em. Below: italic tagline 12px Inter line-height 1.55 color `#52525b`, max-width 220px centered. On hover: `transform: translateY(-4px)`, border-color `#F25E62`, box-shadow `0 18px 40px rgba(0, 0, 0, 0.08)`, transition 0.25s ease."

- "Create a quiz option button. Full width, background `#f4f4f5`, border `2px solid #e4e4e7`, border-radius 12px, padding `12px 16px`. Layout: flex row, align-items flex-start, gap 12px. Left: a 26×26px circle with background `#52525b` and white 12px Red Hat Display weight 700 letter label centered. Right: option text at 14px Inter weight 400, line-height 1.55, color `#18181b`. When selected: border-color `#33a474`, border-width 2px, background `#f4f4f5`, box-shadow `0 0 0 1px rgba(51, 164, 116, 0.20)`, circle background changes to `#33a474`. Hover (unselected): border-color `rgba(51, 164, 116, 0.35)`, box-shadow `0 2px 12px rgba(0, 0, 0, 0.04)`. Transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease."

- "Create a personality detail modal. Width 100%, max-width 520px, max-height min(88vh, 820px), overflow-y auto. Background `#ffffff`, border-radius 12px, padding 32px, border `1px solid rgba(0, 0, 0, 0.08)`, box-shadow `0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)`. Modal entry animation: from `opacity: 0; transform: translateY(8px) scale(0.98)` to full, 0.22s, `cubic-bezier(0.16, 1, 0.3, 1)`. Close button: absolute top-right 16px/16px, 32×32px, border-radius 6px, transparent bg, hover bg `rgba(0, 0, 0, 0.06)`. Header: centered column, Chinese name 28px Red Hat Display weight 700 letter-spacing -0.02em, tagline 14px italic color `#71717a`. Code chip: 3px 8px padding, border-radius 6px, SF Mono 11px weight 600, background and border use `color-mix(in srgb, #F25E62 10%, transparent)` and `color-mix(in srgb, #F25E62 24%, transparent)`. Divider: 1px solid `rgba(0, 0, 0, 0.08)`, margin 20px 0. Body text: 14px Inter line-height 1.70 color `#3f3f46`."

- "Create the FWTI top navigation bar. Position sticky, top 0, z-index 50. Background `rgba(255, 255, 255, 0.92)`, backdrop-filter `saturate(160%) blur(10px)`, border-bottom `1px solid #e4e4e7`. Inner: max-width 1120px, margin auto, padding `14px 32px`, flex row align-center justify-space-between, gap 16px. Left: logo mark (22×22px border-radius 6px background `#33a474`, with a white inner square inset 6px border-radius 2px) + 'FWTI' text in Red Hat Display 18px weight 700 color `#18181b` letter-spacing 0.02em + meta badge '自嘲系列 · 娱乐测试' in Inter 13px color `#52525b` letter-spacing 0.02em. Right: GitHub link Inter 14px weight 500 color `#52525b`, theme toggle button 38×38px border-radius 8px border `1px solid #e4e4e7` background `#f4f4f5`. All transitions 0.15s ease. Focus visible: `outline: 2px solid #33a474`, outline-offset 2px."

### Iteration Guide

1. **Always anchor the accent to a family color.** When building a result or personality component, first establish `--fwti-accent` and `--fwti-accent-tint`. Every accent-aware CSS variable (`border`, `glow`, `selected state`, `bullet`, `label`) derives from these two values — do not hardcode the hex.

2. **Respect the border-radius tier system.** Pills (`999px`) for inline flow elements, `20–24px` for large standalone cards, `12–16px` for modals and small panels, `6–8px` for small interactive elements. Mixing tiers within a single component breaks the spatial hierarchy.

3. **Transitions are always `0.15s ease` for state changes.** Only deviate for: hover lifts on cards (`0.2–0.25s ease`), progress fills (`0.4s cubic-bezier`), modal entries (`0.22s cubic-bezier(0.16,1,0.3,1)`), and dimension bars (`0.8s cubic-bezier`). Do not use `0.3s` or `ease-in-out` — they read as sluggish.

4. **Surface distinction requires a border, not a shadow.** In the default (non-hover) state, every card-on-page surface is differentiated by `1px solid #e4e4e7` — not shadow. Adding resting shadows to new cards destroys the flat/lift contract.

5. **Dark mode requires semantic variable use.** Never hardcode `#18181b` or `#f4f4f5` as literal colors — use `--fwti-bg-soft`, `--fwti-text-dark`, etc. The entire theme swap happens through variable override; literal hex values do not update.

6. **Eyebrow labels before section headings.** Every content section should begin with an eyebrow (`11–12px, weight 600, letter-spacing 0.14–0.16em, all-caps, color --fwti-text-soft`) followed by the section title (`Red Hat Display, 34px, weight 700`). This two-level pattern is the system's primary content hierarchy marker.

7. **CJK-English pairing rule.** When a text element mixes CJK and English (e.g., section eyebrows like '维度分析 · Dimensions'), use Inter for the whole string — `Noto Sans SC` handles CJK glyphs automatically through the font stack fallback. Do not set separate font-family values for mixed strings.

8. **Interactive elements must pass the 38px minimum.** Ensure all buttons, chips, and tiles meet at least 38px in height on mobile. Use generous padding rather than fixed heights to let CJK content wrap gracefully on small screens.
