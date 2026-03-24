---
children_hash: f9e5dccff61c2ca3b1480e7d48a6d29e476d7764fa4395f274b1679a7515e3d3
compression_ratio: 0.537525354969574
condensation_order: 2
covers: [context.md, pptx_generation/_index.md]
covers_token_total: 493
summary_level: d2
token_count: 265
type: summary
---
# Domain Summary: scripts

## Overview
Automation scripts for document and presentation generation, primarily focused on the Peru 2026 travel itinerary.

## Structural Components
*   **Engine**: Node.js utilizing `pptxgenjs` with `LAYOUT_WIDE` (13.333 x 7.5).
*   **Design System**: Peru-themed palette (`C1121F`, `9C6644`), Aptos typography, and standardized components (`brandBar`, `estFoot`).
*   **Workflow**: Theme initialization followed by sequential slide generation (Route, Agenda, Budget, Risks).

## Key Entries
### [pptx_generation/](pptx_generation/_index.md)
*   **[peru_itinerary_generator.md](peru_itinerary_generator.md)**: Generates `Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru.pptx` (11 slides) via `scripts/create_peru_estilo_peru.js`.
*   **[peru_itinerary_generator_v2.md](peru_itinerary_generator_v2.md)**: "V2 Squad" executive version adding tables, styled shapes, and expanded Risk/Checklist sections.

## Critical Dependencies
*   **Libraries**: `pptxgenjs`, `path`.
*   **Resources**: Local assets located in `/assets/peru/`.