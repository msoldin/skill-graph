# OpenCode Playwright MCP Design

## Goal

Add Playwright browser automation support to OpenCode for this repository without introducing a local Playwright test project or changing the repository's current tooling model.

## Current State

- `opencode.json` currently defines one OpenCode plugin: `superpowers@git+https://github.com/obra/superpowers.git`
- `opencode.json` currently defines two MCP integrations: `context7` and `github`
- The repository does not currently contain a `package.json`, Playwright config, Playwright tests, or other local Playwright project setup
- Claude Code previously enabled `playwright@claude-plugins-official`, so there is prior intent to have browser automation tools available in the coding assistant environment

## Recommended Approach

Add a single `mcp.playwright` entry to `opencode.json` and do not make any other repo-level Playwright changes in this step.

This approach is recommended because it provides the desired browser automation capability in OpenCode while keeping the change minimal and reversible. It also avoids guessing at a Playwright test runner, package manager, or project layout that the repository does not currently have.

## Alternatives Considered

### 1. Recommended: MCP-only Playwright integration

- Add `mcp.playwright` to `opencode.json`
- Keep all other OpenCode config unchanged
- Do not add Playwright packages, tests, or configs to the repository

### 2. MCP plus local Playwright test scaffolding

- Add `mcp.playwright`
- Add a Node.js Playwright project to the repository

This was rejected for now because the repository does not already have a JavaScript project structure, and the current ask is about OpenCode capability, not test framework setup.

### 3. Defer until exact server details are confirmed

- Make no config changes until the exact Playwright MCP server details are confirmed

This is safer when integration details are unknown, but it delays the immediate goal of exposing Playwright tools in OpenCode.

## Configuration Design

`opencode.json` should gain a new sibling entry under `mcp`:

- `mcp.playwright`

The entry should be structured as a standard OpenCode MCP integration and should point at the confirmed Playwright MCP server details chosen for this environment.

The rest of `opencode.json` should remain unchanged aside from previously approved secret-placeholder cleanup.

## Boundaries

This change includes:

- adding a Playwright MCP integration to OpenCode config
- preserving the existing `plugin`, `mcp.context7`, and `mcp.github` entries

This change does not include:

- adding `package.json`
- installing Playwright npm dependencies in the repository
- creating browser tests
- adding Playwright config files such as `playwright.config.ts`
- wiring Playwright into CI

## Error Handling And Failure Modes

- If the Playwright MCP server details are wrong, OpenCode should still continue to work with the existing configured tools
- If the Playwright MCP server requires local prerequisites that are missing, the config can remain present but the Playwright tool will not be usable until those prerequisites are installed
- If no supported Playwright MCP server can be confirmed, the change should stop before editing `opencode.json` rather than adding speculative config

## Verification

Verification for this change should confirm:

- `opencode.json` remains valid JSON
- a new `mcp.playwright` block exists
- the existing `plugin`, `mcp.context7`, and `mcp.github` entries are preserved
- no plaintext secrets are introduced into tracked config
- OpenCode loads the config without schema-format errors

## Scope

This design covers only adding Playwright MCP support to OpenCode for browser automation in this repository.

It does not cover broader translation of the remaining Claude plugins or creation of a Playwright testing project inside the repository.
