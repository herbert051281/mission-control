---
children_hash: 8a570602f99f6cc7c92d9dd33a0d7090fd06bf9994cdc571d86bf3367ced6876
compression_ratio: 0.32908704883227174
condensation_order: 3
covers: [architecture/_index.md, assets/_index.md, scripts/_index.md, travel/_index.md]
covers_token_total: 2355
summary_level: d3
token_count: 775
type: summary
---
# Knowledge Base Structural Summary (Level D3)

This level D3 summary synthesizes the architectural, operational, and logistical domains of the current knowledge base, covering the Skillmaster Companion platform, Peru 2026 travel planning, and supporting asset/script infrastructures.

## 1. Skillmaster Companion Platform (Architecture)
The Skillmaster Companion is a secure automation platform structured as a Node.js/Electron monorepo designed for Windows environments.

*   **System Topology**: Organized into `companion-desktop` (Electron wrapper), `companion-service` (Local backend), and `companion-ui` (Dashboard). It utilizes a shared `policy-engine` for risk assessment and an `audit` package for logging.
*   **Security & Orchestration**: 
    *   **Process Model**: The Electron `main.mjs` orchestrates the backend service, which is strictly bound to `127.0.0.1`.
    *   **Access Control**: Employs a `contextBridge` with a preload script to manage session tokens. Mutating endpoints require Bearer tokens (30min TTL).
    *   **Execution Safety**: Defaults to **Safe Mode**, restricting UI automation unless explicitly flagged. The `policy-engine` evaluates actions against `RiskLevel` (Low/Med/High).
*   **Task & Safety Lifecycle**: 
    *   **Queue Model**: Tasks transition through `queued` → `pending_approval` → `running` → `done/failed/cancelled`.
    *   **Panic Stop**: A global `POST /panic-stop` mechanism uses `AbortController` to terminate all tasks and lock the service (HTTP 423).
*   **Reference**: See `architecture/_index.md` for component details (`monorepo_structure.md`, `panic_stop_mechanism.md`).

## 2. Peru 2026 Expedition (Travel & Logistics)
A structured 11-day circular family itinerary (August 5–15, 2026) for two adults and one child.

*   **Route Strategy**: SAL → Lima (4 nights) → Cusco/Sacred Valley (6 nights) → Lima → SAL.
*   **Operational Constraints**:
    *   **Acclimatization**: Mandatory low-activity period in Cusco.
    *   **Energy Management**: "2-activity maximum" daily limit to accommodate pediatric needs.
    *   **Buffers**: Fixed contingency on Day 13 for travel delays.
*   **Financial Framework**: Target budget of **USD 5,300** (Range: $3,750–$7,050). Primary drivers include SAL-LIM airfare ($1.1k-$2.1k) and Machu Picchu logistics (PeruRail, entry fees, and bus).
*   **Reference**: See `travel/_index.md` for planning (`family_trip_2026.md`, `v2_squad_executive_plan.md`).

## 3. Support Infrastructure (Scripts & Assets)
Automated tools and managed resources supporting documentation and presentation needs.

*   **Presentation Engine**: A Node.js generator using `pptxgenjs` with a specific Peru-themed design system (`C1121F` palette, Aptos typography).
    *   **V1 Generator**: 11-slide family itinerary.
    *   **V2 Squad**: Executive version with expanded risk/checklist sections.
*   **Asset Management**: Centralized storage in `assets/peru/` with a mandatory `sources.json` for license compliance (CC BY-SA 4.0, CC0).
*   **Reference**: See `scripts/_index.md` and `assets/_index.md` for technical specifications.