# Packaging research

Checked: 2026-11-05. Implementation: original project instructions, no upstream skill/code copied. Documentation was consulted, not redistributed. Original repository content uses the root MIT LICENSE; no upstream license is asserted to cover this original repository.

| Source | Version / original revision | License / reuse boundary | Decision |
|---|---|---|---|
| [Agent Skills specification](https://agentskills.io/specification), [source](https://github.com/agentskills/agentskills) | Unversioned web spec; upstream HEAD `83021e2be457a9b6679148719c1f6074f0ad975e` | GitHub license API: Apache-2.0; no files copied | Standard SKILL.md with name/description; portable local reference bundle |
| [Codex skills](https://learn.chatgpt.com/docs/build-skills), [source release](https://github.com/openai/codex/tree/rust-v0.166.0) | Installed CLI 0.166.0; tag commit `6ff1e1ca3b30fc8b914720681fcf5fe62e95f856`; docs unversioned, no public page revision exposed | CLI source Apache-2.0; docs only consulted, no copying/license grant inferred | `.agents/skills` local project discovery and `$spec`; avoid user config modification |
| [Claude skills](https://code.claude.com/docs/en/skills), [manifest](https://code.claude.com/docs/en/plugins-reference) | Installed CLI 2.1.317; docs unversioned, source revision not exposed/verified | Proprietary CLI/service; docs only consulted, no redistribution | `.claude/skills` project installation and `/spec`; native Read avoids a shell dependency |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | Installed instructions 1.3.2; live upstream HEAD `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` (not claimed equal to installed release) | MIT; no skill/code copied | Consulted TDD and writing guidance; adopted observable-boundary evaluation rather than prose snapshots |

Revisions/license identifiers were retrieved through `gh api repos/<owner>/<repo>/commits/<ref>` and `/license`. Website retrieval dates are evidence of inspection, not pinned website source revisions. No claim of latest version is made.

## Source and adapter boundary

`skills/<name>/SKILL.md` is canonical. It links to `references/execution-contract.md`; that link is intentionally resolved during assembly, from the sole `common/execution-contract.md` source. The assembler copies Markdown contracts from `common/` into every standalone skill; `common/tracker-state.md` is the sole state vocabulary/transition source, conditionally read by build and ticket for ticket state work. `common/workspace-lifecycle.md` is conditionally read by build/diagnose/improve for code modification and workspace integration/cleanup. Conditional domain references remain inside the owning skill directory and are read only on their documented trigger. No hardcoded spec-only list exists in the assembler.

`python scripts/package.py install --dest <skills-directory>` materializes all current skills into a new destination. It checks supported metadata, local links/containment, collisions, and obvious personal path/credential patterns before copying. This is a focused repository validator, not a full YAML or secret scanner. Human release inspection remains required for non-Markdown/binary assets and unrecognized secrets.

Native plugin/marketplace adapters package the **assembled output**, not raw `skills/`, because raw sources do not contain the generated contract reference. `bundle --dest <new-plugin-root>` assembles skills and native manifests from `adapters/`; tracked `plugins/skills/` ships the result for direct marketplace consumption. `check-bundle --dest plugins/skills` compares the entire generated file inventory and bytes against canonical sources. See [Codex lifecycle](codex-lifecycle.md) for actual installation results and the separate runtime blocker.

The minimal install refuses any existing skill name. It provides no force/overwrite, update, uninstall, marketplace mutation, or credential handling. Collisions across other scopes must be inspected by the platform adapter; directory preflight only covers the explicit destination. Plain files avoid symlink privileges and cache portability risks. No agent-specific tool is required by the common skill beyond reading relevant input/resources.

## Verified compatibility boundaries

| Environment | Installation | Discovery/invocation | Behavioral output |
|---|---|---|---|
| Windows, Claude Code 2.1.317, project skill folder, existing subscription auth | PASS: assembled local project directory | See [smoke record](spec-smoke.md) | See smoke record; only minimal decided conversation |
| Windows, Codex CLI 0.166.0, project skill folder, existing auth | PASS: assembled directory | Found requested skill; shell read blocked in read-only mode | NOT PASS: generated fallback is not full skill execution |
| Native Codex CLI 0.166.0, Windows, fresh config home, local marketplace | PASS including update/reinstall/removal | Installed/enabled list PASS; authenticated native invocation NOTRUN | BLOCKED in separate shared-auth project-skill fixture: shell read denied |
| Native Claude Code 2.1.317, Windows, local marketplace | See [Claude lifecycle](claude-lifecycle.md) | Separate existing-auth session plugin test in that record | Bounded spec fixture; see record |
| Other OS/hosts, GitHub remote install | NOTRUN here | NOTRUN here | NOTRUN here |

Fresh working directories isolate task artifacts, not authentication or every inherited instruction. No credentials were copied, user configuration edited, or denied tool action bypassed. Marketplace lifecycle and broad platform acceptance remain separate work.
