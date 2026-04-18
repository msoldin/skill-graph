# OpenCode Config Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Claude-oriented plugin mindset with a clean OpenCode-native configuration and remove plaintext credentials from `opencode.json`.

**Architecture:** Keep the existing OpenCode `plugin` and supported `mcp` entries, but rewrite their credential values to use environment-variable placeholders instead of inline secrets. Do not add speculative replacements for Claude-only plugins; the implementation stays limited to the current supported OpenCode configuration shape.

**Tech Stack:** JSON config, OpenCode config schema, shell verification with `jq` and `rg`, git

---

## File Structure

- Modify: `opencode.json`
  - Keep `plugin` with the `superpowers` entry
  - Keep `mcp.context7` and `mcp.github`
  - Replace inline credentials with environment variable placeholders
- Create: `docs/superpowers/plans/2026-04-18-opencode-config-migration.md`
  - Implementation plan for the approved design
- Reference only: `docs/superpowers/specs/2026-04-18-opencode-config-migration-design.md`
  - Approved design source for this work

### Task 1: Replace Inline Secrets In `opencode.json`

**Files:**
- Modify: `opencode.json`
- Reference: `docs/superpowers/specs/2026-04-18-opencode-config-migration-design.md`

- [ ] **Step 1: Write the updated config content**

Replace `opencode.json` with exactly:

```json
{
    "$schema": "https://opencode.ai/config.json",
    "plugin": [
        "superpowers@git+https://github.com/obra/superpowers.git"
    ],
    "mcp": {
        "context7": {
            "type": "remote",
            "url": "https://mcp.context7.com/mcp",
            "headers": {
                "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
            },
            "enabled": true
        },
        "github": {
            "type": "remote",
            "url": "https://api.githubcopilot.com/mcp/",
            "headers": {
                "Authorization": "Bearer ${GITHUB_TOKEN}"
            },
            "enabled": true
        }
    }
}
```

- [ ] **Step 2: Run JSON validation**

Run: `jq . opencode.json`

Expected output:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git"
  ],
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      },
      "enabled": true
    },
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      },
      "enabled": true
    }
  }
}
```

- [ ] **Step 3: Inspect the diff**

Run: `git diff -- opencode.json`

Expected output includes these changed lines:

```diff
-                "CONTEXT7_API_KEY": "ctx7sk-..."
+                "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
-                "Authorization": "Bearer github_pat_..."
+                "Authorization": "Bearer ${GITHUB_TOKEN}"
```

- [ ] **Step 4: Commit the config change**

Run:

```bash
git add opencode.json
git commit -m "chore: sanitize opencode config secrets"
```

Expected output:

```text
[main ...] chore: sanitize opencode config secrets
 1 file changed, 2 insertions(+), 2 deletions(-)
```

### Task 2: Verify No Plaintext Secrets Remain In Tracked Config

**Files:**
- Modify: none
- Verify: `opencode.json`

- [ ] **Step 1: Search for the old token shapes in tracked config**

Run: `rg -n "ctx7sk-|github_pat_" opencode.json docs/superpowers`

Expected output:

```text
[no matches]
```

- [ ] **Step 2: Confirm the placeholder values are present**

Run: `rg -n '\$\{CONTEXT7_API_KEY\}|\$\{GITHUB_TOKEN\}' opencode.json`

Expected output:

```text
11:                "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
19:                "Authorization": "Bearer ${GITHUB_TOKEN}"
```

- [ ] **Step 3: Check final working tree state**

Run: `git status --short`

Expected output:

```text
[no output]
```

If there are unrelated untracked files in the repository, the acceptable result is that `opencode.json` is no longer listed as modified or untracked after the commit.

### Task 3: Manual Follow-Up Outside The Repository

**Files:**
- Modify: none in this repository

- [ ] **Step 1: Rotate exposed credentials if they were real**

Perform these actions in the relevant external services:

```text
1. Revoke the current Context7 API key that was stored in opencode.json.
2. Revoke the current GitHub personal access token that was stored in opencode.json.
3. Create replacement credentials with the minimum required scope.
```

Expected result:

```text
The old credentials no longer work, and replacement credentials exist for local use.
```

- [ ] **Step 2: Export replacement credentials in the local shell environment**

Run commands like:

```bash
export CONTEXT7_API_KEY='replacement-context7-key'
export GITHUB_TOKEN='replacement-github-token'
```

Expected result:

```text
The current shell session has CONTEXT7_API_KEY and GITHUB_TOKEN available for OpenCode.
```

- [ ] **Step 3: Start OpenCode and confirm config loads without schema errors**

Run the normal local OpenCode startup command for this environment.

Expected result:

```text
OpenCode starts successfully, recognizes opencode.json, and does not report schema or credential-format errors for the configured plugin and MCP entries.
```
