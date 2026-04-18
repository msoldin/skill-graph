# OpenCode Playwright MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standard Playwright MCP integration to `opencode.json` so OpenCode can use browser automation in this repository.

**Architecture:** Extend the existing `mcp` object in `opencode.json` with one new `playwright` entry using OpenCode's local MCP format. Keep the existing `plugin`, `mcp.context7`, and `mcp.github` entries unchanged, and do not add any repository-level Playwright project files.

**Tech Stack:** JSON config, OpenCode MCP configuration, `npx`, Playwright MCP, shell verification with Python and ripgrep, git

---

## File Structure

- Modify: `opencode.json`
  - Preserve the existing OpenCode plugin and MCP entries
  - Add `mcp.playwright` using the standard local command form for OpenCode
- Create: `docs/superpowers/plans/2026-04-18-opencode-playwright-mcp.md`
  - Implementation plan for the approved Playwright MCP config change
- Reference only: `docs/superpowers/specs/2026-04-18-opencode-playwright-mcp-design.md`
  - Approved design for this work

### Task 1: Add The Playwright MCP Entry

**Files:**
- Modify: `opencode.json`
- Reference: `docs/superpowers/specs/2026-04-18-opencode-playwright-mcp-design.md`

- [ ] **Step 1: Replace `opencode.json` with the full target config**

Update `opencode.json` to exactly:

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
        },
        "playwright": {
            "type": "local",
            "command": [
                "npx",
                "@playwright/mcp@latest"
            ],
            "enabled": true
        }
    }
}
```

- [ ] **Step 2: Validate the JSON syntax**

Run: `python3 -m json.tool opencode.json >/dev/null`

Expected output:

```text
[no output]
```

- [ ] **Step 3: Verify the Playwright block exists and the existing MCP entries remain**

Run: `rg -n '"context7"|"github"|"playwright"|"@playwright/mcp@latest"|"type": "local"' opencode.json`

Expected output:

```text
7:        "context7": {
15:        "github": {
23:        "playwright": {
24:            "type": "local",
27:                "@playwright/mcp@latest"
```

- [ ] **Step 4: Verify no plaintext credentials were reintroduced**

Run: `rg -n 'ctx7sk-|github_pat_' opencode.json`

Expected output:

```text
[no matches]
```

- [ ] **Step 5: Review the diff**

Run: `git diff -- opencode.json`

Expected output includes a new `playwright` block like:

```diff
+        "playwright": {
+            "type": "local",
+            "command": [
+                "npx",
+                "@playwright/mcp@latest"
+            ],
+            "enabled": true
+        }
```

- [ ] **Step 6: Commit the config change**

Run:

```bash
git add opencode.json
git commit -m "feat: add playwright mcp config"
```

Expected output:

```text
[main ...] feat: add playwright mcp config
 1 file changed, 8 insertions(+)
```

### Task 2: Verify Runtime Prerequisites For The Local MCP Server

**Files:**
- Modify: none
- Verify: local environment only

- [ ] **Step 1: Confirm `npx` is available**

Run: `npx --version`

Expected output:

```text
<version number>
```

- [ ] **Step 2: Check the package can be resolved by npm without changing repo files**

Run: `npx -y @playwright/mcp@latest --help`

Expected output includes:

```text
Playwright MCP
```

If the environment lacks Node.js or npm access, this step may fail. In that case, the config change is still valid, but the local machine setup remains incomplete until Node.js and npm are available.

- [ ] **Step 3: Check final git status for the tracked config file**

Run: `git status --short -- opencode.json`

Expected output:

```text
[no output]
```

If `opencode.json` is untracked in this repository instead of already tracked, the acceptable result is that it is no longer modified after the commit and any remaining status reflects only its tracked or untracked repository state.

### Task 3: Manual OpenCode Verification

**Files:**
- Modify: none in this repository

- [ ] **Step 1: Start OpenCode in the repository root**

Run the normal local OpenCode startup command for this machine.

Expected result:

```text
OpenCode reads opencode.json and does not report JSON or schema-format errors.
```

- [ ] **Step 2: Confirm the Playwright MCP server is available in OpenCode**

Use OpenCode's MCP inspection or tool listing flow after startup.

Expected result:

```text
The Playwright MCP server appears alongside the existing MCP integrations.
```

- [ ] **Step 3: Run one simple browser action through OpenCode**

Use a minimal browser action such as opening a page or listing Playwright browser tools.

Expected result:

```text
OpenCode can invoke the Playwright MCP integration successfully.
```
