# Ticket behavioral and native graph smoke — 2026-11-05

Bounded PASS: installed Claude `/ticket` produced executable slices and correct state/frontier plans; a separate host-driven GitHub API fixture verified native relations and label/state readback. These are distinct evidence layers, not an autonomous Claude-to-GitHub execution claim.

## Environment and boundary

Windows PowerShell, Python 3.12.15, Claude Code 2.1.317, runtime-reported model `claude-opus-5-5` (default). Reused existing authentication without copying credentials. Project-only settings, strict MCP, no session persistence, Read/Skill-only tools. Parent instructions and built-in skills remained available; this was not a clean user profile. Raw stream JSONL stays ignored because it contains local paths and runtime identifiers.

The pre-agreed public seam is installed skill invocation → observable output, then authorized TEST ONLY tracker relations/status → server readback. No wording-match tests were added.

## Red → green

Before implementation, installed the then-current package into a fresh `.artifacts/ticket-red/.claude/skills` and invoked [input](../fixtures/ticket/input.txt). The [actual red output](../fixtures/ticket/observed-red.md) disclosed that `/ticket` was absent. It also incorrectly treated active as runnable and allowed recreation after timeout followed by zero matches. Transport success is not behavioral success.

After adding ticket, installed into a distinct fresh `.artifacts/ticket-green/.claude/skills` and ran the same input:

```powershell
python scripts/package.py install --dest .artifacts/ticket-green/.claude/skills
Push-Location .artifacts/ticket-green
Get-Content ../../fixtures/ticket/input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose > green.jsonl
Pop-Location
```

Use a new destination on rerun; existing installations intentionally refuse overwrite. The [actual green output](../fixtures/ticket/observed-green.md) is unedited model text. Init listed ticket; two Read calls loaded the assembled common contract and tracker reference. Result success, 3 turns, no permission denials. Source/fixture files were not writable by the model.

| Rubric | Observation |
|---|---|
| Detailed independent slices | F common authentication/error contract, C cancellation, O operator query; goal, exclusions, ownership, contracts, failure/recovery, numbered acceptance criteria |
| Coverage and graph | R1–R4 covered, shared responsibility assigned once, F→{C,O}, no fabricated C→O dependency |
| Existing duplicate | Recovered existing C, no recreation or body overwrite |
| State/frontier | Before F completion empty frontier with F active; after evidence C/O ready; verification active; reopen conditional ready/blocked |
| Native and fallback | Distinguished containment/blocking, numeric database ID from issue number, explicit parent/blocked-by fallback |
| Authority and honesty | No approval question, posting or code execution; snapshot plan distinguished from NOTRUN tracker actions |

The model marked time boundary assumptions explicitly; it did not establish those as product decisions. This single fixture does not prove all specifications decompose correctly.

## Actual GitHub native API fixture

Official [sub-issue](https://docs.github.com/en/rest/issues/sub-issues) and [dependency](https://docs.github.com/en/rest/issues/issue-dependencies) documentation was checked on the execution date. Host used `gh api` with structured JSON input. Stable markers were checked against fully paginated all-state issues, excluding PRs, before each create. Only these new TEST ONLY issues were mutated:

- [#16 parent](https://github.com/Mrbaeksang/skills/issues/16)
- [#17 foundation](https://github.com/Mrbaeksang/skills/issues/17)
- [#18 consumer](https://github.com/Mrbaeksang/skills/issues/18)

[Sanitized server readbacks](../fixtures/ticket/live-readback.json) retain bodies, labels, states, relationship IDs and observed transitions. Parent #16 sub-issues were exactly #17/#18. Both child parent endpoints returned #16. Consumer #18 blocked-by returned #17. The pre-completion frontier was empty. Foundation evidence comment and completed closure were read back, followed by consumer blocked→ready→active→done/closed→ready/reopened. Documentation labels survived every transition and each readback contained exactly one status label. Consumer verification evidence was recorded while active. Closure/reopen state and labels were independently read after mutations.

For response reconciliation, the host deliberately discarded the known consumer create identity and recovered exactly one same-marker issue through full-list readback, with zero additional creates. This simulates a lost response after successful creation; no actual network timeout was induced. After verification all three owned issues were closed with status:done and read back. Real implementation issues were not edited. No existing labels or relationships were removed.

## Verification and limits

Package check PASS (4 skills), existing package unittest suite PASS (3 tests), isolated Codex folder install PASS, diff hygiene PASS. No dependency installation. No claim of Codex invocation, native plugin invocation, other OS/tracker runtime, race-free exactly-once, actual transport fault injection, or product implementation. GitHub host fixture establishes API behavior; Claude output establishes reasoning behavior separately.

## Reconciliation and graph repair fixture

A second fresh assembled installation ran [reconcile-input.txt](../fixtures/ticket/reconcile-input.txt) with the same Read/Skill-only flags. [Observed output](../fixtures/ticket/observed-reconcile.md): success, 3 turns, no denials; both contract and tracker reference read. Timeout followed by complete zero-match enumeration remained publication unconfirmed with no recreate; retry required definitive non-application evidence or atomic idempotency. Duplicate common-error ownership and A↔B cycle became E→{A,B}; a reopened authentication prerequisite reblocked its consumer with concrete resume conditions. No writes or repeated approvals occurred.

Limitation: the abbreviated graph fixture called E ready while later noting that its concrete error contract must come from the specification. Treat that frontier as conditional on contract readiness, not proof of an immediately executable E. The full first fixture supplies concrete acceptance/contract details. The source explicitly requires prepared contracts before ready; this output limitation is retained rather than silently corrected.
