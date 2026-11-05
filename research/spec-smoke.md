# Minimal spec smoke — 2026-11-05

Result: PASS for the bounded Claude project-skill installation → discovery → `/spec` invocation → decided-conversation output. This is not full A17 across both platforms, a fresh authentication-home test, or proof of the implemented memo CLI.

## Environment and reproduction

Windows; Python 3.12.15; Claude Code 2.1.317; runtime-reported model `claude-opus-5-5` (default, not overridden). Existing subscription authentication was reused; no credentials were copied. Task files and installed skill were isolated under `.artifacts/claude-smoke`. Parent instructions and built-in skills were still available; isolation does not mean clean user profile. User settings were excluded through project-only settings sources.

```powershell
python scripts/package.py install --dest .artifacts/claude-smoke/.claude/skills
$fixture = (Get-Content fixtures/spec/decided-input.txt -Raw).Replace('$spec','/spec')
Push-Location .artifacts/claude-smoke
$fixture | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
Pop-Location
```

Use a fresh destination on rerun; collisions intentionally stop installation. Only native Read and Skill tools were exposed. Raw JSONL remains in ignored local artifacts because it contains personal paths and runtime identifiers. The sanitized durable evidence below plus [actual output](../fixtures/spec/observed-claude.md) preserves observations rather than synthesizing a success transcript.

- `system/init` contained `spec` in the discovered skills array and tools `Read`, `Skill`.
- Input invoked `/spec` with [decided-input.txt](../fixtures/spec/decided-input.txt), changing only the platform invocation prefix.
- Native slash-command loading supplied skill instructions; the agent then made exactly one tool call, `Read` of `.claude/skills/spec/references/execution-contract.md`.
- Tool result returned the complete common contract (10 lines) and accepted read permission. No denied action was bypassed.
- Final result: `subtype=success`, `is_error=false`, `num_turns=2`, `permission_denials=[]`; no spawned subagents or web requests.
- Output included R1–R9 / AC1–AC11, separate proposals and U1–U8, and NOTRUN for actual product checks. It also mentioned an inherited dashboard-report instruction as NOTRUN because shell tools were unavailable; that instruction is not part of this package.

## Rubric assessment

| Criterion from fixture rubric | Observation | Result |
|---|---|---|
| Installed discovery and invocation | Assembled project skill listed; invocation followed by exact bundled-contract Read | PASS |
| Korean, no repeated approval | Korean output, no question or confirmation gate | PASS |
| Preserve fixed scope | add/list, trim/nonempty, JSON/UTF-8/current directory, order, absent/corrupt file behavior and exclusions present | PASS |
| Observable acceptance and fact/assumption split | R/AC table plus explicitly proposed schema/ID/atomic-write choices; trim interpretation caveated as U1 | PASS |
| No invented performance target | U2 remains undecided; no numeric SLO invented | PASS |
| Bounded authority | One Read call only; no write, implementation, posting, network, deployment | PASS |
| Honest completion | Document checks stated; implementation and AC execution NOTRUN | PASS |

Caveat: AC2 appears in the fixed-requirement table but is explicitly conditional on U1 below it. Full spec-quality refinement is outside this minimum acceptance; do not interpret that trim assumption as a confirmed decision.

## Other checks and unsuccessful attempts

- TDD at the public package CLI: initial install test failed because package.py did not exist, then passed. Personal-path guard test failed by allowing the install, then passed after preflight validation. Three unittest tests pass, including invalid metadata/broken and escaping references, collision refusal, contract-byte equality, and preserved user file.
- `python scripts/package.py check`: PASS.
- Bundled skill-creator `quick_validate.py`: NOTRUN due to `ModuleNotFoundError: No module named 'yaml'`. No dependency was installed; project standard-library validation passed separately.
- Codex CLI 0.166.0: installation succeeded; `$spec` was discovered, but read-only PowerShell resource read returned `rejected: blocked by policy`. Its generated fallback spec explicitly disclosed the unread contract. Full skill behavior is NOT PASS for that attempt.
- Claude with `--setting-sources ''`: no project skill discovery; model reported `/spec` unavailable. Project-only sources corrected discovery without changing tool authority or bypassing a denial.
- Existing-file edit, unavailable filesystem/tracker, missing-decision fixtures, clean auth-home isolation, native plugins/marketplaces, update/removal, other operating systems: NOTRUN.

## Artifact hashes (SHA-256)

- Canonical SKILL.md: `B2DE97BC933D9B9AA27325D80C2C964155B81A50B462C61793533EDFBCF43C33`
- Common execution contract: `2FA4AEA987D5872BC3E91D2F4942BEC640D5D6BE140537A47539AB91F5901478`
- Input fixture: `4E417388908509454907FBD8C17AE5A36C58F0A9C3750FEEC4C75316A799805C`
- Actual Claude output: `EBD539E0C4DA498E16EC15DABF36621244F306F365B58C01C48C8C93C3F3F891`
