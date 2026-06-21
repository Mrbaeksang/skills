# Official sources — single source of truth (vendored, not symlinked)

Each row is an upstream dependency this repo's authoring relies on. Vendor the page content
into `docs/official/<name>/` and keep the version + retrieval date. The
`onboard-dependency` rail checks that any dependency added to a manifest has a folder here.

| name | source | version / retrieved | governs |
|---|---|---|---|
| claude-code-skills | https://docs.claude.com/en/docs/claude-code/skills | 2026-06-20 | SKILL.md frontmatter (`name`, `description`, `disable-model-invocation`, `context: fork`, `model`, `allowed-tools`) |
| claude-code-plugins-reference | https://docs.claude.com/en/docs/claude-code/plugins-reference | 2026-06-20 | plugin.json, directory layout, `${CLAUDE_PLUGIN_ROOT}` |
| claude-code-plugin-marketplaces | https://docs.claude.com/en/docs/claude-code/plugin-marketplaces | 2026-06-20 | marketplace.json schema, `source` types, install flow |
| claude-code-hooks | https://docs.claude.com/en/docs/claude-code/hooks | 2026-06-20 | hooks/hooks.json, plugin hooks merge on enable, deny mechanism |
| claude-code-hooks-guide | https://docs.claude.com/en/docs/claude-code/hooks-guide | 2026-06-20 | PreToolUse exit-2 / permissionDecision=deny, matcher syntax |
| skills-cli (vercel-labs/skills) | https://skills.sh/docs · https://github.com/vercel-labs/skills | 2026-06-20 | `npx skills add` cross-agent install (skills-only, no live hooks) |
| mattpocock-skills (pattern ref) | https://github.com/mattpocock/skills | 2026-06-20 | structural blueprint; guardrails shipped as setup-skill, not live hooks |

**Verdict captured here (load-bearing):** `npx skills` / skills.sh distributes SKILL.md only — it cannot auto-activate blocking hooks. A Claude Code **plugin + marketplace** is the only mechanism that activates enforcing hooks at install with no manual settings.json edit. This repo ships **both**: plugin (enforced core) + skills.sh (cross-agent reach, skills-only).

## Decisions (Claude Code platform patterns)

The load-bearing choices the platform forces — visible, not silently skipped.

| concern | official pattern / options | our decision | status |
|---|---|---|---|
| **hook delivery** | plugin `hooks/hooks.json` (auto-merge on install) vs project `.claude/settings.json` vs skills.sh setup-skill | **plugin** (enforced, distributable) + project `.claude/` for per-repo rails | ✅ |
| **block mechanism** | `permissionDecision: deny` + reason vs exit 2 | **deny + reason** (Claude sees why → self-corrects); exit 2 as simple fallback | ✅ |
| **spawn cost** | `matcher` (tool) + `if` (subcommand/path) two-stage filter | matcher scopes tool; early-exit in script for path scoping (Edit/Write `if` is limited) | ✅ |
| **install scope** | user / project / local | plugin → user (distribution); `.claude/` → project (repo rails) | ✅ |
| **level detection** | n/a (our marker) | grep `mrbaeksang:current=L<n>` (enforce) / `target` (design) — never grep whole file | ✅ |
| **turn-end gate (smoke-gate)** | `Stop`/`PostToolBatch` exit 2; `type:"prompt"` (Haiku) | **TBD — redefined just before dev (item #11)**; screenshot-Stop rejected as overkill | ⏳ |
| **false-positive risk** | narrow rules; warn vs block | deny-rules narrow + level-gated (L0 off / L1 warn / L2 block) | ✅ |
