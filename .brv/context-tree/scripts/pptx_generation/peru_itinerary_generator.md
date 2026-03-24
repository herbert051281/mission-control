---
title: Peru Itinerary Generator
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T01:46:21.045Z'
updatedAt: '2026-03-21T01:46:21.045Z'
---
## Raw Concept
**Task:**
PptxGenJS script for generating Peru travel presentation

**Files:**
- scripts/create_peru_estilo_peru.js

**Flow:**
Initialize PptxGenJS -> Define Theme/Colors -> Add Slides (Cover, Route, Budget, etc.) -> Write File

**Timestamp:** 2026-03-21

## Narrative
### Structure
Node.js script using PptxGenJS library. Uses LAYOUT_WIDE (13.333 x 7.5).

### Dependencies
pptxgenjs, path modules; requires local assets in assets/peru/.

### Highlights
Generates 11 slides with Peru-themed palette (Red: C1121F, Tierra: 9C6644).

### Rules
Uses brandBar helper for consistent slide headers/footers.

### Examples
Output path: /data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru.pptx
