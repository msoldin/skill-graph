# Testing Strategies

Useful backend test suites keep the fast checks close to pure logic and the slower checks around HTTP boundaries.

## Balanced Suite

- Unit tests for deterministic layout and path resolution.
- Integration tests for SQL-backed read models.
- A single end-to-end smoke test for the happy path.
