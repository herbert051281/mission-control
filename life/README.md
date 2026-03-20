# Life Knowledge Graph (PARA)

This folder is Atlas's durable knowledge graph using PARA:
- `projects/` active projects with goals or deadlines
- `areas/` ongoing responsibilities (people, companies, roles)
- `resources/` reference topics and playbooks
- `archives/` inactive entities moved from the above

Entity pattern:
- `summary.md` = quick retrieval context
- `items.json` = atomic facts (history-preserving, no deletion)

Rules:
1. Facts are never deleted. Outdated facts are marked `status: "superseded"` and linked via `supersededBy`.
2. `summary.md` is concise and recency-weighted.
3. `items.json` is the complete historical source of truth.
