# Design System — AI Trading Intelligence Platform

## Product Context
- **What this is:** A private, single-user AI trading intelligence and execution platform.
- **Who it's for:** A solo trader/developer operating algorithmic strategies.
- **Space/industry:** Algorithmic Trading / Fintech
- **Project type:** Web App / Data-Dense Dashboard

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian
- **Decoration level:** Minimal (Typography, borders, and spacing do 100% of the work)
- **Mood:** Function-first, unapologetically technical, precision instrument.
- **Reference sites:** High-end trading terminals, modern CLI tools.

## Typography
- **Display/Hero:** IBM Plex Sans — An industrial, sharply engineered sans-serif with open apertures and high x-height.
- **Body:** IBM Plex Sans — Highly legible on dark displays with zero character ambiguity between `1`, `l`, `I`, `0`, `O`.
- **UI/Labels:** IBM Plex Sans
- **Data/Tables:** JetBrains Mono — Tabular figures for lining up numbers, tickers, timestamps, and agent reasoning logs.
- **Code:** JetBrains Mono
- **Loading:** `next/font/google` (built into Next.js)
- **Scale:** Minimum label size `text-xs` (12px), standard data `text-sm` (14px), primary metrics `text-2xl` to `text-3xl`. Micro-fonts (`text-[10px]`) deprecated for legibility.

## Color
- **Approach:** Restrained, true-black UI (inspired by high-end physical trading terminals)
- **Primary/Accent:** #00E5FF (Electric Cyan) — Used strictly for active states, AI highlights, and focus areas (creates a sleek contrast against the true-black).
- **Secondary:** #1C1C1C — Subtle elevation for interactive elements.
- **Neutrals:** #000000 (True Black Background), #0E0E0E (Surface), #8A8A8A (Muted Text), #EDEDED (Primary Text)
- **Semantic:** success #00E676, warning #F59E0B, error #FF3B30
- **Dark mode:** Native/Only (Designed exclusively for deep black/dark mode to reduce eye strain).

## Spacing
- **Base unit:** 4px
- **Density:** Compact
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** Grid-disciplined
- **Grid:** 12-column grid for dense dashboards.
- **Max content width:** Full width / fluid (utilizing all available screen real estate).
- **Border radius:** sm:2px, md:4px (sharp, boxy, technical).

## Motion
- **Approach:** Minimal-functional (zero decorative animations)
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms)

## Brand Identity & Logo System
- **Core Mark:** The Cyber-Titanium Quantum Delta (Concept 2).
- **Physical Metaphor:** Brushed dark titanium & matte obsidian squircle casing with chamfered corner bumpers.
- **Glyph Symbol:** Laser-etched Electric Cyan (`#00E5FF`) quantum delta triangle with concentric circuit traces and glowing central execution node.
- **Applications:**
  - **Vector SVG Mark:** Used in browser favicons, responsive headers, and micro-branding (`apps/web/public/icon.svg`).
  - **3D Hardware Emblem:** Used in native app icons, splash screens, and hero presentation (`apps/web/public/brand/logo.jpg`).
  - **Component:** `<BrandLogo size="sm|md|lg|xl" variant="vector|emblem" showText={true|false} />`.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-01 | Initial design system created | Created by /design-consultation to optimize for data density and a technical "terminal" feel. |
| 2026-09-04 | Typography overhaul to IBM Plex Sans + JetBrains Mono | User-approved typography upgrade to resolve small-text legibility and low contrast. Replaced generic Inter with IBM Plex Sans, elevated muted text contrast, bumped minimum label size to 12px, and reserved monospace strictly for numbers, prices, tickers, and code. |
| 2026-09-04 | Brand Identity & Logo System Approval | Adopted Concept 2 (Cyber-Titanium Quantum Delta Emblem & Vector Mark) designed via Agency Agents Brand Guardian and Image Prompt Engineer. Unified all app icons, browser favicons, and navigation marks. |
