---
title: Peru Itinerary Generator V2
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T01:51:56.322Z'
updatedAt: '2026-03-21T01:51:56.322Z'
---
## Raw Concept
**Task:**
Automate Peru itinerary PPTX generation using pptxgenjs

**Files:**
- scripts/create_peru_estilo_peru.js

**Flow:**
Initialize PPTX -> Define Theme/Colors -> Add Slides (Summary, Route, Agenda, Costs, Options, Risks, Budget, Checklist) -> Write File

**Timestamp:** 2026-03-21

**Author:** Atlas · Legolas PM

## Narrative
### Structure
Node.js script using pptxgenjs. Wide layout. Uses Aptos/Aptos Display fonts. Custom branding bar with red/earth tones.

### Dependencies
Requires pptxgenjs and path modules. Relies on assets in /assets/peru/.

### Highlights
Generates V2 Squad executive deck with tables, images, and styled shapes.

### Rules
Rule 1: Use brandBar() for consistent slide headers.
Rule 2: Use estFoot() for mandatory financial disclaimers on cost slides.

### Examples
Output file: Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru_V2_Squad.pptx
