---
children_hash: 5393be47aa9c0ce751995c3a5c9934f69dd87b3f37b66fe6c355cdab14ab2327
compression_ratio: 0.8345864661654135
condensation_order: 2
covers: [context.md, peru_itinerary/_index.md]
covers_token_total: 798
summary_level: d2
token_count: 666
type: summary
---
# Domain: travel

The `travel` domain organizes structural frameworks, financial planning, and logistical coordination for family-oriented trips, specifically focusing on the 2026 Peru expedition.

## Strategic Overview: Peru Itinerary
The `peru_itinerary` topic (see `peru_itinerary/_index.md`) defines an 11-day circular journey (August 5–15, 2026) optimized for a family of three (2 Adults, 1 Child). The route follows a **SAL → Lima → Cusco → Sacred Valley → Machu Picchu → Lima → SAL** progression, balancing coastal and highland regions.

### Architectural Decisions & Planning
*   **Logistical Flow**: The 10-night stay is partitioned into 4 nights in Lima and 6 nights in the Cusco/Sacred Valley region. 
*   **Executive Strategy**: High-level agendas and risk mitigation are detailed in `v2_squad_executive_plan.md`, while `family_trip_2026.md` serves as the granular daily record for sites like Pisac and Ollantaytambo.
*   **Visual Documentation**: A thematic 11-slide presentation (`Peru_Itinerario_Estilo_Peru.pptx`) was programmatically generated via `PptxGenJS` using the `scripts/create_peru_estilo_peru.js` utility.

### Operational Constraints (Rules)
*   **Acclimatization**: Mandatory low-activity period upon Cusco arrival to mitigate altitude sickness.
*   **Energy Management**: Strict "2-activity maximum" daily limit (Active Morning/Light Afternoon) to prevent child fatigue.
*   **Buffer Allocation**: A fixed contingency day (Day 13) is integrated to handle weather or travel delays.
*   **Booking Window**: Critical reservations for Machu Picchu circuits and PeruRail (Ollantaytambo-Aguas Calientes) must be secured by early July.

## Financial & Resource Framework
*   **Budgetary Targets**: Total range of USD 3,750 – 7,050, with a balanced target of **USD 5,300**.
*   **Primary Cost Drivers**:
    *   **Airfare**: SAL-LIM ($1,150–2,150) and LIM-CUZ ($450–850).
    *   **Machu Picchu Logistics**: Entry fees ($45–62), Train ($120–220), and Bus ($24).
    *   **Accommodation**: Miraflores/San Isidro Airbnb rentals ($70–130/night).
*   **Asset Management**: Image metadata and licensing for travel materials are consolidated in `assets/peru/sources.json`.
*   **Dependencies**: Requires synchronized international/domestic flight booking and specialized insurance covering altitude and pediatric needs.

## Key References for Drill-down
*   **`v2_squad_executive_plan.md`**: Narrative flow and risk management.
*   **`family_trip_2026.md`**: Specific site breakdowns and daily schedules.
*   **`peru_itinerary/_index.md`**: Detailed financial tiers and cost breakdowns.
*   **`context.md`**: Domain scope and exclusion definitions.