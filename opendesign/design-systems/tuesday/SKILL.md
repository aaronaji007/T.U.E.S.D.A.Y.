---
name: tuesday-design-system
description: Design system for TUESDAY, the autonomous multi-agent AI SOC dashboard. Use when redesigning, restyling, or building UI for the TUESDAY SOC product — light ice-field glass theme, cool-to-danger gradient identity (ice blue #D1E2E4 → mist #DED9DB → salmon #EEA4A5 → signal red #FD4040), deep-teal health hue #3E7A84, Inter + JetBrains Mono, translucent glass cards on a fixed gradient field. Tokens live in tokens/colors_and_type.css and mirror :root in styles.css.
license: MIT
---

# TUESDAY Design System

Portable design system for **TUESDAY — Threat Unification Engine for Security Defense And Your SOC**. Light, airy, "ice-field SOC glass" aesthetic for a real-time multi-agent security operations dashboard. Cool blue-grey field, translucent glass cards, one red danger ramp burning through the top-right of the page.

## Personality

- **Tone:** calm, clinical, "cold-room operations deck". Ice-blue calm that turns warm and red as risk climbs — the page itself signals severity by temperature.
- **Density:** information-dense. 0.62–0.85rem type, tight 0.5–1.25rem spacing. This is a tool, not a brochure — but a tool that breathes.
- **Language:** telemetry/systems vocabulary (SIEM, IOC, MTTR, enclave, containment, TTP). Monospace for all values, timestamps, and code.

## Key decisions

1. **Gradient-as-thermometer.** The page background is a fixed `linear-gradient(110deg, #D1E2E4 0%, #D1E2E4 45%, #DED9DB 65%, #EEA4A5 82%, #FD4040 100%)`. Cool ice on the left (normal operations), a salmon warning band in the middle, and a hot red corner on the right — live severity, rendered by the canvas itself. Left is calm, right is danger.
2. **Translucent glass over field.** Cards are `rgba(255,255,255,0.72)` with soft `rgba(86,112,122,0.28)` hairlines and a faint `0 10px 30px rgba(120,150,158,0.22)` elevation — frosted panels floating on the ice field, not solid slabs.
3. **Deep-teal health hue.** Success/benign/online reads as deep ice teal `#3E7A84` (bright variant `#6FB4BC`, tint `#E4F1F3`). The old Matrix-neon green is gone — health is now cold and composed.
4. **Status taxonomy.** Agent roles keep 8 hues tuned to the palette (Coordinator/Approval deep teal, Log cyan `#4A8CA8`, Threat Intel purple `#B08C9E`, Malware pink `#EEA4A5`, Cloud teal `#7FB3BB`, Response red `#FD4040`, Compliance amber `#C97A7C`). Hues are semantic; never re-map to decoration.
5. **Type pairing.** Inter (UI/display) + JetBrains Mono / Fira Code / Share Tech Mono (all data, IDs, timestamps, TTP codes, terminal, tables). Compact stepwise scale; uppercase letterspaced micro-labels.
6. **Glow is earned, not default.** Text-shadows on status values were removed for light-bg legibility; only live indicators (MTTR tick, attack-path trace on the twin) keep a soft glow — and it's teal/red, not neon-green.

## Usage

- Tokens: `tokens/colors_and_type.css` — copy the `:root` block into the target project's stylesheet (`styles.css`).
- All components in the source UI (`index.html` + `styles.css`) reference the `--matrix-*` aliases; retuning the token block restyles the whole product.
- Rule of thumb for a new surface: translucent `rgba(255,255,255,0.72)` fill → `1px rgba(86,112,122,0.28)` border → small radius → uppercase mono header. Accent only for meaning. On the gradient field, the danger side is already hot — don't stack more red.

## Anti-patterns (this system rejects)

- Neon-green Matrix glow and the old dark terminal theme (superseded direction).
- Solid near-black slabs; acid/yellow signal accents.
- Emoji as icons; decorative iconography; any animation that does not carry signal.
