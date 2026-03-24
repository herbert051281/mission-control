---
children_hash: 226f6cbf7121bc85a336a6b96bb81b6d5a1bdf2f8ba95611cd66e2ccfb11d3d5
compression_ratio: 0.7022900763358778
condensation_order: 1
covers: [context.md, peru_itinerary_generator.md, peru_itinerary_generator_v2.md]
covers_token_total: 524
summary_level: d1
token_count: 368
type: summary
---
# Topic Summary: pptx_generation

## Overview
Automated PowerPoint generation scripts for travel itineraries, specifically focusing on the Peru 2026 family trip.

## Structural Components
*   **Core Engine**: Node.js scripts utilizing the `pptxgenjs` library with `LAYOUT_WIDE` (13.333 x 7.5) specifications.
*   **Design System**:
    *   **Palette**: Peru-themed colors (Red: `C1121F`, Earth: `9C6644`).
    *   **Typography**: Aptos and Aptos Display fonts.
    *   **Components**: `brandBar()` for consistent headers/footers and `estFoot()` for financial disclaimers.
*   **Data Flow**: Initialize PptxGenJS → Define Theme → Sequential Slide Addition (Route, Agenda, Budget, Risks) → File Write.

## Key Entries
### [peru_itinerary_generator.md](peru_itinerary_generator.md)
*   **File**: `scripts/create_peru_estilo_peru.js`
*   **Output**: `Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru.pptx`
*   **Content**: 11-slide deck focusing on route and budget basics.

### [peru_itinerary_generator_v2.md](peru_itinerary_generator_v2.md)
*   **File**: `scripts/create_peru_estilo_peru.js` (Updated)
*   **Output**: `Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru_V2_Squad.pptx`
*   **Enhancements**: "V2 Squad" executive version including tables, styled shapes, and expanded sections for Options, Risks, and Checklists.

## Critical Dependencies
*   **Software**: `pptxgenjs`, `path` modules.
*   **Assets**: Required local resources located in `/assets/peru/`.