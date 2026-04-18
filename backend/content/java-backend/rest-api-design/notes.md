# REST API Design

Design resources around how clients think, not how tables are stored.

## Heuristics

- Favor nouns over verbs in paths.
- Keep write workflows explicit when side effects matter.
- Return enough metadata for the next client action.

## Exercise

Sketch `GET /roadmaps/{slug}` and `GET /roadmaps/{slug}/graph` separately and write down why they should stay separate.
