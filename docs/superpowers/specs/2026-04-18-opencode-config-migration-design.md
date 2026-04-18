# OpenCode Config Migration Design

## Goal

Translate the current Claude Code plugin setup into a recommended OpenCode-native configuration that is small, explicit, and maintainable.

## Current State

Claude Code currently enables these plugins in `.claude/settings.json`:

- `superpowers@claude-plugins-official`
- `playwright@claude-plugins-official`
- `claude-md-management@claude-plugins-official`
- `github@claude-plugins-official`
- `context7@claude-plugins-official`
- `jdtls-lsp@claude-plugins-official`
- `typescript-lsp@claude-plugins-official`
- `context-mode@context-mode`
- `skill-creator@claude-plugins-official`
- `caveman@caveman`

OpenCode currently uses `opencode.json` with one installed plugin and two MCP integrations:

- `plugin`: `superpowers@git+https://github.com/obra/superpowers.git`
- `mcp.context7`
- `mcp.github`

The current OpenCode config also stores credentials inline, which should be treated as a security issue and replaced with environment variables.

## Recommended Approach

Adopt an OpenCode-native core configuration instead of trying to preserve 1:1 plugin parity with Claude Code.

This means:

- Keep OpenCode plugins only where OpenCode explicitly supports them
- Use MCP entries for external tool integrations such as GitHub, Context7, and Playwright
- Do not translate Claude-only plugins unless there is a confirmed OpenCode-compatible equivalent
- Prefer editor or OS-level tooling for language servers rather than forcing them into OpenCode config

This approach is recommended because it minimizes guessed behavior, reduces maintenance overhead, and matches the configuration model already present in the repository.

## Mapping

### Keep in OpenCode

- `superpowers@claude-plugins-official` -> `plugin: ["superpowers@git+https://github.com/obra/superpowers.git"]`
- `github@claude-plugins-official` -> `mcp.github`
- `context7@claude-plugins-official` -> `mcp.context7`

### Add Conditionally

- `playwright@claude-plugins-official` -> add an `mcp.playwright` entry only if browser automation is needed in OpenCode and a supported MCP endpoint or package is available

### Do Not Translate By Default

- `claude-md-management@claude-plugins-official`
- `context-mode@context-mode`
- `skill-creator@claude-plugins-official`
- `caveman@caveman`
- `jdtls-lsp@claude-plugins-official`
- `typescript-lsp@claude-plugins-official`

For these items, translation should happen only after identifying one of the following:

- a documented OpenCode-native feature
- a supported OpenCode plugin
- a supported MCP server
- a separate editor integration that should remain outside OpenCode

## Proposed `opencode.json` Shape

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

If Playwright is required later, it should be added as a separate MCP entry after confirming the exact server details.

## Environment And Secrets

The OpenCode config must not store real API secrets directly in `opencode.json`.

Required changes:

- replace inline Context7 credentials with `${CONTEXT7_API_KEY}`
- replace inline GitHub token with `${GITHUB_TOKEN}`
- rotate the currently exposed credentials if they are real

## Error Handling And Failure Modes

- If an MCP server is misconfigured, OpenCode should continue working with the remaining configured tools
- If a Claude plugin has no OpenCode equivalent, omit it rather than introducing speculative config
- If browser automation is needed but no Playwright MCP integration is available, keep Playwright outside OpenCode until a supported option is identified

## Testing And Verification

Verification for the migration should be lightweight and explicit:

- confirm `opencode.json` remains valid JSON
- confirm OpenCode recognizes the `plugin` and `mcp` entries without schema errors
- confirm `context7` and `github` connect with environment-provided credentials
- confirm no plaintext secrets remain in tracked config files

## Scope

This design covers only the recommended target configuration and plugin mapping strategy for OpenCode.

It does not cover:

- implementing or discovering replacements for every Claude-only plugin
- editor-specific LSP setup for Java or TypeScript
- broader repository cleanup outside the config migration
