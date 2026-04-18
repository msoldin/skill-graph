# HTTP Basics

HTTP gives backend services a shared vocabulary for communication.

## Study Focus

- Learn the difference between safe and idempotent methods.
- Know when a `404` vs `409` vs `422` tells a better story.
- Treat headers as part of the contract, not transport trivia.

## Quick Practice

Build a tiny endpoint that returns `201 Created` for a new resource and `409 Conflict` when the same slug is submitted twice.
