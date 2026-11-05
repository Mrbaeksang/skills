# Claude native lifecycle evidence

Date: 2026-11-05. Windows, PowerShell 7.6.6, Python 3.12.15, Claude Code 2.1.317. Official [manifest reference](https://code.claude.com/docs/en/plugins-reference) and [marketplace guide](https://code.claude.com/docs/en/plugin-marketplaces) retrieved on this date; unversioned documentation, no upstream code copied. Original repository content is MIT; consulted third-party documentation retains its own rights.

## Native installation

`python scripts/smoke_claude.py` assembles the canonical skills, common contract, both native manifests, README, and LICENSE into an owned temporary directory. It uses real CLI commands with a child-only `CLAUDE_CONFIG_DIR`. Authentication files are not read or copied. Session plugin injection via `CLAUDE_CODE_PLUGIN_DIRS` is omitted in the test subprocess; this does not change the parent environment or policies.

- `plugin validate <plugin> --strict --json` and marketplace validation: manifest success with no errors/warnings. Directory review separately checked for blocking findings; none remained. Optional `ICON_MISSING` directory advisory remains. Manifest `success` alone does not establish directory eligibility.
- Marketplace add → install `skills@baeksang-skills` at 0.1.0 → list enabled and installed. Cached spec contract bytes equal the canonical contract.
- Temporary source version changed to 0.1.1 → marketplace update → plugin update. List and cached manifest both report 0.1.1.
- Uninstall → absent from installed list → reinstall 0.1.1 → uninstall → absent again.
- Separately installed `unrelated@baeksang-skills`, sentinel env setting, and CLAUDE.md remain unchanged across target update/reinstall/removal. Only after that assertion is the owned unrelated fixture removed and the temporary marketplace deregistered.

The script compares original `settings.json`, `CLAUDE.md`, and plugin installation/cache inventory before and after. Volatile `plugins/store` runtime data is excluded, as are auth and logs. An initial broader check failed after Claude updated a builtin agents-md runtime store file; no user configuration was restored or overwritten to hide that observation. This is deliberately a configuration/install preservation claim, not an all-profile byte-for-byte immutability claim.

Final rerun including runtime: all lifecycle assertions PASS; 2,713 protected original files have identical SHA-256 mappings before/after. Source validation, four unittest boundary tests, isolated standard skill installation, and `git diff --check` also PASS.

## Authenticated session plugin invocation

`python scripts/smoke_claude.py --invoke` additionally uses the installed cache in a separate existing-auth session. This is session-only native plugin loading, **not** proof that a fresh config home has authentication. The lifecycle installation and invocation have distinct state scopes.

```text
claude -p --plugin-dir <installed-cache> --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools Read,Skill --allowedTools Read,Skill --output-format stream-json --verbose
```

Input is unchanged [decided-input.txt](../fixtures/spec/decided-input.txt), with only `$spec` replaced by `/skills:spec`. The task directory is temporary and outside the repository. Managed/builtin instructions may still exist. Only Read and Skill tools are exposed; no shell, browser, writes, tracker, or subagents are exposed. No denied action is bypassed.

Raw traces remain in ignored `.artifacts/claude-native` because they contain personal paths and runtime identifiers. Sanitized observed output is recorded with the fixture. Native slash-command loading supplies SKILL.md; the trace must additionally show successful Read of the bundled execution contract and specification reference. The behavioral rubric is applied to actual output, independently of installation checks.

Observed runtime: model `claude-opus-5-5` (default, not overridden); init includes `skills:spec`, `skills:build`, `skills:shape` and builtin skills. The requested slash command loaded the installed instructions, then exactly two successful Read calls loaded `execution-contract.md` and `specification.md` inside the installed cache. Final `subtype=success`, `is_error=false`, `num_turns=3`, `permission_denials=[]`. [Actual output](../fixtures/spec/observed-claude-native.md) contains no personal path or runtime identifier.

| Behavioral rubric | Observation | Result |
|---|---|---|
| Native discovery/invocation and bundled reads | Namespaced slash load plus two successful reference Reads | PASS |
| Korean and no repeated approval | Korean spec with no questions | PASS |
| Fixed scope preserved | R-01–R-07 and non-goals preserve supplied add/list, JSON, error-preservation requirements | PASS |
| Observable criteria and proposal separation | AC-01–AC-20; separate assumptions/proposals and conditional ACs | PASS, caveat below |
| Undecided performance | No invented SLO; performance explicitly open | PASS |
| Authority boundary | Read-only tool trace; no writes/posts/implementation/network tools | PASS |
| Honest completion | All product ACs NOTRUN; document creation distinguished | PASS |

Quality caveat: AC-02 allows file creation among fixed criteria while missing-file add is separately an assumption A-3/AC-12. Corrupt-file protection is preserved in R-07, while its extension to add is conservative assumption A-2. This bounded smoke is not proof that every proposed AC classification is perfect.

## Support boundary

| Environment | Install/discover | Update/reinstall/remove | Native spec invocation |
|---|---|---|---|
| Windows Claude 2.1.317, temporary config, local marketplace | PASS, cache bytes checked | PASS, unrelated fixture preserved | NOTRUN: no authentication copied |
| Same CLI, existing authentication, installed cache via session `--plugin-dir` | PASS: session namespace discovery | Not an installation test | PASS: bounded decided spec fixture |
| GitHub remote source, other OS/versions, Desktop UI | NOTRUN | NOTRUN | NOTRUN |

This tests one already-decided spec fixture, not every skill/workflow or a working notes CLI. Network/tracker/browser capabilities, conditional publishing/domain resources not triggered by this fixture, and the full A17 multi-platform acceptance remain separate. Static package checks and CLI lifecycle are not substitutes for runtime behavior.

## Artifact SHA-256

These are exact working-tree bytes used in this run, before later integration or line-ending normalization.

- Spec SKILL.md: `1DC0626B15BF851E7924795A42EA53AE94F9B448C5E99C39EB7AF779A5D6179B`
- Common contract: `FD3533639C70DC83CE857773B42216CE202BA63A5C8EEF167EFBA29AEE5C15D0`
- Input fixture: `48947DBACFDF22746209F8124C09DAC9393F09DAE3D723982AB4B03A4DF41D10`
- Observed output: `77C8674ED7D25818502C4B8AF62DD83FBDFAB1625A1776094D0E464435A7B085`
