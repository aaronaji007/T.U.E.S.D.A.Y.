# TUESDAY Design System

Light "ice-field SOC glass" theme for **TUESDAY**, an autonomous multi-agent AI SOC dashboard (Node.js + vanilla JS, zero dependencies).

## Sources consulted

- `styles.css` — component layer and canonical `:root` token block (restored original UI, re-colored to the light gradient palette).
- `index.html` — original hackathon structure preserved; only color changed.
- `app.js`, `mitre.js`, `network_vis.js` — inline `var(--matrix-*)` template styles that consume the tokens; neon/dark literals neutralized to the palette.
- `showcase.js` / tour styles — guided-tour spotlight overlay (preserved, re-colored).
- `CONTEXT.md` — product/problem context (SOC, alert overload, MTTR).

## What the system contains

```
tokens/colors_and_type.css   canonical :root token block (raw + semantic + --matrix-* aliases)
SKILL.md                     portable marker + design decisions
```

## Design DNA

- **Gradient-as-thermometer.** Fixed page gradient `linear-gradient(110deg, #D1E2E4 0%, #D1E2E4 45%, #DED9DB 65%, #EEA4A5 82%, #FD4040 100%)` — ice-blue calm on the left, salmon warning band, hot red danger corner on the right. Severity reads from the canvas itself.
- **Translucent glass cards.** `rgba(255,255,255,0.72)` fills, `rgba(86,112,122,0.28)` hairlines, `0 10px 30px rgba(120,150,158,0.22)` elevation.
- **Deep-teal health hue `#3E7A84`.** Success/benign/online; bright `#6FB4BC`, tint `#E4F1F3`. No neon green.
- **8-hue status taxonomy** — one palette-tuned hue per agent role (deep teal/cyan/purple/pink/teal/red/amber). Hues carry meaning.
- **Type:** Inter (UI/display) + JetBrains Mono / Fira Code / Share Tech Mono (all data). Uppercase letterspaced micro-labels, compact scale.
- **Motion:** signal-only. Status blink, terminal cursor, live MTTR tick, attack-path trace; `prefers-reduced-motion` respected.

## Applying it

1. Replace the `:root` block in `styles.css` with the token block from `tokens/colors_and_type.css` (keeping any project-specific extras).
2. Style components per the SKILL.md rules. The `--matrix-*` aliases mean a token retune cascades to every component and every inline JS template style.

## Status

Repurposed from the brutalist acid direction (superseded). Tokens are the single source of truth; the source stylesheet mirrors them.
