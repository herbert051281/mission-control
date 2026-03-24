# Atlas Multi-Agent Architecture

## Hot (Recent)

- **Orchestrator**: Atlas (main)
- **Specialists**: Newton (research), Iris (coding), Davinci (UI/UX), Kepler (Data Analyst), Einstein (Data Scientist), Gandalf (Power BI/Tableau), Legolas (PM/Agile), Skillmaster (Ops)
- **Model fallbacks (2026-03-23)**:
  - Atlas: sonnet → haiku → gemini-3-flash-preview → gpt-4o-mini
  - Kepler/Gandalf/Einstein/Iris: gpt-5.4 → opus-4-5 → sonnet-4-5 → gemini-3-pro
  - Newton/Davinci: sonnet-4-5 → haiku-4-5 → gpt-4o-mini → gemini-3-pro
  - Legolas/Skillmaster: gpt-4o-mini → haiku-4-5 → gemini-3-flash-preview

## Warm (Active Context)

- Governance: single primary owner, dependency-first sequencing, handoff schema
- Config validated: removed invalid agent-level `fallbacks` keys from openclaw.json

## Cold (Historical)

- Initial model config: Claude Pro primary → Claude Opus → Gemini Flash → GPT-5.4-mini (global fallback chain) — superseded 2026-03-23
- Initial setup: 2026-03-21
