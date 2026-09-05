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
- **Display/Hero:** Geist — A modern, sharply engineered sans-serif.
- **Body:** Geist — Extremely legible at small sizes.
- **UI/Labels:** Geist
- **Data/Tables:** Geist Mono — Perfect for lining up numbers, tickers, and agent reasoning logs.
- **Code:** Geist Mono
- **Loading:** `next/font/google` (built into Next.js)
- **Scale:** Tailwind defaults tuned for density (e.g., `text-xs` for labels, `text-sm` for standard data, `text-2xl` for primary metrics)

## Color
- **Approach:** Restrained (1 Accent + Neutrals)
- **Primary/Accent:** #00E5FF (Electric Cyan) — Primary CTA, active states, key focus areas.
- **Secondary:** #1F1F1F — Subtle elevation for interactive elements.
- **Neutrals:** #0A0A0A (Background), #141414 (Surface), #8A8A8A (Muted Text), #EDEDED (Primary Text)
- **Semantic:** success #00FF94 (Neon Green), warning #FFD500, error #FF2A55
- **Dark mode:** Native/Only (Designed exclusively for dark mode to reduce eye strain).

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

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-01 | Initial design system created | Created by /design-consultation to optimize for data density and a technical "terminal" feel. |
