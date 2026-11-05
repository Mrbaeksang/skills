# Detailed spec and publishing smoke — 2026-11-05

Scope: issue #4, A02/A05/A19. This is skill behavior and authorized test-tracker evidence, not execution of the fictional booking product or race-safe exactly-once delivery.

## Environment and inputs

Windows PowerShell; Python 3.12.15; Claude Code 2.1.317; runtime model `claude-opus-5-5` (default, not overridden); GitHub CLI 2.97.0. Existing authentication was reused. Project-only settings and isolated assembled skill directories were used; inherited parent instructions still existed, so this is not clean-profile isolation. No dependency or helper was installed.

- [Detailed input](../fixtures/spec/detailed-input.txt): fixed multi-domain booking decisions, existing stack, failure/recovery, error ownership, conditional design choices.
- [Ambiguous response input](../fixtures/spec/ambiguous-input.txt): timeout followed by exact match, no match, duplicates, denied readback, concurrent changed content.
- [Behavioral rubric](../fixtures/spec/detailed-rubric.md): observable outputs, scope and expected stopping conditions.

For each fresh isolated directory, assemble with `python scripts/package.py install --dest .artifacts/<fresh-run>/.claude/skills`. From that directory invoke the input with only `$spec` replaced by `/spec`:

```powershell
$inputText | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
```

Raw JSONL stays in ignored local artifacts because it contains personal paths and session identifiers. Durable observed outputs contain no such raw trace. No subagents were started by these Claude runs. Tool permissions were not broadened to bypass a denial.

## Failure-led instruction refinements

The installed-agent seam was tested instead of adding tests for wording. Existing package CLI tests remain the deterministic packaging seam; no new executable publisher was justified.

1. Initial ambiguity run: immediate additional writes were zero for A–E, but B incorrectly allowed a later create after merely repeating complete zero-result reads. This failed the reconciliation rubric. The publishing reference was sharpened to require independent evidence that the original write cannot later apply, or atomic idempotency protection.
2. Corrected ambiguity run: success, 4 turns, no permission denials. Discovered `spec`, read common contract, publishing reference and specification reference. [Actual corrected output](../fixtures/spec/observed-ambiguous-claude.md) returns existing #31 for A and stops B–E; B explicitly rejects elapsed time/repeated reads as sufficient evidence. PASS for the fixture, not a live fault injection.
3. Initial detailed run: success, 3 turns, no permission denials. Read common contract and specification reference. It preserved fixed decisions and error ownership without interviewing, but some proposed behavior was described as a consequence of fixed decisions, and some affected acceptance criteria lacked conditional labels. The specification reference now requires conditional labeling through acceptance criteria and distinguishes inferred failure-key policy from fixed requirements. The live issue below preserves this first output as test material, not an approved product spec.
4. Corrected detailed run: success, 3 turns, no permission denials. Discovered `spec` and read the common contract and specification reference. [Actual corrected output](../fixtures/spec/observed-detailed-claude.md) has D-01–20, R-01–11, AC-01–35, explicit P/O tables, all decided flows, centralized transformation with domain-owned error meanings, and product tests marked NOTRUN. No questions or shape invocation occurred. Failure-key consumption is now P-08 and AC-29 conditional; replay status/body is P-07 with AC-23/26 conditional annotations. PASS for bounded A02/A05 behavior. Residual output defect: AC-01 cites P-09 (cancellation response) instead of P-07 (creation/replay response); its inline text still correctly calls 201 a proposal. The observed output is preserved verbatim, not silently corrected. This illustrates that traceability still needs review before product implementation, not perfect-generation assurance.

The corrected ambiguity run preceded only the final specification-reference clarification above; its publishing reference bytes match the final source. The corrected detailed run used final spec entrypoint and reference bytes. Each installed copy contained the generated common contract.

## Actual authorized tracker boundary

The host agent performed live writes using the published procedure; the Claude fixture runs had Read/Skill only and did **not** perform those writes. Technical repository permission was read back; user authorization was limited to a clearly marked temporary issue in this repository.

- Full open/closed issues enumeration with pagination was captured before creation; no matching stable marker existed. Marker: `skills-spec-smoke-v2`.
- Created [test issue #15](https://github.com/Mrbaeksang/skills/issues/15), title `[TEST ONLY] spec publishing/readback smoke for #4`, label `type:spec`, with full initial observed specification and a test-only preamble using UTF-8 `--body-file`.
- Read back exact body and compared it to the local body file: PASS. SHA-256 of posted body: `53E65D3AD0B33726F8A253BAC2DA2CB8DB223E253CAF23AAC922704BBF27E2C0`.
- Repeated complete REST listing using `--paginate --slurp`; filtered pull requests; found exactly one matching issue, #15. Repeated-request handling: existing issue reused, zero additional create/update calls.
- Closed only test issue #15 and read back `CLOSED`. Implementation issues were not changed.
- A redundant pre-create JSON parse attempted to parse concatenated objects as a single JSON value and emitted an error. The earlier complete enumeration supplied the absence evidence; creation succeeded once. No retry was issued. The subsequent reconciliation used valid slurped JSON and exact assertions. Future reproductions should set PowerShell `$ErrorActionPreference = 'Stop'` before parsing and use `--paginate --slurp`.

## Sources and limits

Official docs consulted 2026-11-05: [GitHub REST issue listing](https://docs.github.com/en/rest/issues/issues#list-repository-issues) for open/closed pagination and pull-request filtering; [GitHub CLI issue create](https://cli.github.com/manual/gh_issue_create) for body-file and explicit repository selection. They establish API/CLI contracts, not idempotent create guarantees.

- Package check and existing 3 unittest tests: PASS. Diff hygiene checked separately at completion.
- Skill-creator `quick_validate.py`: unavailable due to `ModuleNotFoundError: No module named 'yaml'`; no package installed. Standard-library repository validator passed.
- NOTRUN: live timeout injection, concurrent publishers, live permission-denied writes, Codex invocation of this extension, clean auth-home setup, other OS, and fictional product runtime/API/database tests.
- A closed test issue remains as evidence. This test does not claim all-platform support or atomic exactly-once publishing.

## Final source hashes (SHA-256)

- `skills/spec/SKILL.md`: `1DC0626B15BF851E7924795A42EA53AE94F9B448C5E99C39EB7AF779A5D6179B`
- `skills/spec/references/specification.md`: `2084AB466CF86381C77FAE9967EA12AEC4DC553514EC0F7B1F985C2983595EF9`
- `skills/spec/references/publishing.md`: `1CB6B53CFD8835FB48A517E0ECE4DFA36586811A425481AE516BC37ACA8C5A18`
- `common/execution-contract.md`: `FD3533639C70DC83CE857773B42216CE202BA63A5C8EEF167EFBA29AEE5C15D0`
