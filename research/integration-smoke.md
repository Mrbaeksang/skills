# Connected Claude fixture — 2026-11-05

**PARTIAL:** all seven skills discovered, four stages actually invoked and their documents connected. Agent-side build execution was denied and remained NOTRUN. A separate host artifact oracle passed; it does not turn the agent run into completed end-to-end acceptance. #13 stays blocked.

## Tested scope and environment

Integration source `d06a08292eea3825c972863a595a120c3ccac9ce`, Windows, PowerShell, Python 3.12.15, Claude Code 2.1.317, runtime-reported default `claude-opus-5-5`. Seven project skills were assembled into a new ignored `.artifacts/integration13/.claude/skills` destination. The fixture had its own git branch `fixture`, tracked keep.txt and an unrelated uncommitted line. Existing authentication was reused without copying credentials. Project-only settings/strict MCP limit configuration sources but inherited instructions and builtin skills remained: this is not a clean-profile or OS sandbox test.

The [actual input](../fixtures/integration/input.txt) requests shape → spec → ticket → build with fixed Python delivery-quote requirements, local draft tickets only, six permitted output files and no UI/Codex/network/deployment/subagents. New shared tracker/workspace lifecycle changes developed after this base were **not loaded**.

Invocation from the owned fixture used:

```powershell
Get-Content <input-file> -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Write,Edit,Skill,PowerShell' --allowedTools '<allowlist below>' --max-turns 55 --output-format stream-json --verbose
```

The host used Python subprocess stdin/capture with UTF-8 and a 480-second timeout. The allowlist was Read,Skill; Write/Edit for exactly `./decisions.md`, `./SPEC.md`, `./tickets.md`, `./evidence.md`, `./quote.py`, `./test_quote.py`; and `PowerShell(python *)`, `PowerShell(Get-Location)`, `PowerShell(git status *)`, `PowerShell(git branch *)`, `PowerShell(git worktree list)`, `PowerShell(Get-Command python*)`. This trusts the fixture interpreter and is not a general filesystem security boundary. No permissions were broadened after a denial.

Observed transport result: success, is_error=false, 43 turns, 234.774 seconds, two permission denials; runtime-reported cost USD 1.0654708. Transport success is not product completion. Raw streams remain ignored because they include machine paths/runtime IDs. [Sanitized tool inventory](../fixtures/integration/observed/tools.json) omits Write/Edit bodies, which are retained as final files. [Selected results](../fixtures/integration/observed/selected-results.json) retain initial state and denial text without runtime IDs. Path redaction uses `<fixture>`; Markdown trailing whitespace/line endings were normalized.

## Actual connected observations

| Boundary | Evidence | Verdict |
|---|---|---|
| Discovery | init skills includes build, diagnose, improve, review, shape, spec, ticket | PASS seven names; not seven invocations |
| Invocation | Skill calls in order shape, spec, ticket, build; each common contract read | PASS four connected calls |
| Decisions → spec | [decisions](../fixtures/integration/observed/decisions.md), [SPEC](../fixtures/integration/observed/SPEC.md); D-1–D-9 preserved and A-1–A-3 distinct | PASS bounded handoff |
| Spec → tickets | [tickets](../fixtures/integration/observed/tickets.md); requirement/AC coverage, T-1→T-2 and ready/blocked initial frontier | PASS local draft; no live tracker action |
| Tickets → implementation | [quote.py](../fixtures/integration/observed/quote.py), [tests](../fixtures/integration/observed/test_quote.py); shipment owns validation/price, adapter maps JSON/exit | Source boundary PASS; agent runtime NOTRUN |
| Contract correction | build removed proposed exact JSON serialization assertions and updated earlier documents while retaining AC identifiers | PASS bounded cross-stage consistency correction |
| Completion | [agent evidence](../fixtures/integration/observed/evidence.md), [final](../fixtures/integration/observed/final.md) explicitly say incomplete and all runtime NOTRUN | PASS honest reporting; not completed build |
| Preservation | keep.txt bytes equal setup content, including original dirty line; SHA-256 below | PASS named file |

The two denied requests were compound git/hash preflight and piped unittest/exit reporting. No child command retry, alternative execution path or permission escalation followed them. In particular, **red and green were not observed by the agent**. A later ordinary host artifact verification used the same existing public CLI oracle used for earlier fixtures; that is a separate validation layer, not a repaired or resumed Claude session.

Host verification of both the generated workspace and sanitized committed artifact:

```powershell
python fixtures/build/verify_cli.py fixtures/integration/observed
python -B -m unittest discover -s fixtures/integration/observed -v
```

PASS: 10 public CLI calls covering normal/invalid/boundaries/failure→recovery, plus 11 generated process tests. No host failing-before-implementation result exists for this integration fixture. Host keep.txt SHA-256: `ae5ba6bfdb8092562679ad5f3ba2b16d8900c5081ac1275a10cced87f15f8e9b`. An initial host assertion incorrectly expected LF instead of the Windows-created CRLF bytes; correcting the expected setup encoding verified the existing bytes without modifying keep.txt.

## Residual output weaknesses and unrun boundaries

The final output calls reversible A-1–A-3 proposals “approval needed” despite the earlier documents proceeding autonomously; no approval question actually interrupted work. It also leaves both tickets active although T-2 initially depends on T-1 and the runtime gate is unresolved. Thus this run is **not** evidence that live status/frontier transitions are correct. Those limitations are preserved in observed outputs, not silently repaired.

A-1 adds strict lexical integer rules not specified by the user; they remain labeled proposals/conditional ACs. This fixture demonstrates preserved distinction and implementation choices, not approval of those semantics for every product. Weight unit/currency remain nonblocking unknowns. No current-version research was required because Python 3.12/stdlib was fixed by input.

Fresh-session interruption/resume, live tracker posting/status/dependencies/readback, high-risk review, native plugin all-skill invocation, Codex execution and UI remain NOTRUN or independently BLOCKED. Historical individual seven-skill invocations are linked in the release receipt; they are not rerun here. The new workspace lifecycle amendment requires separate evidence.

Final source checks for this documentation slice: package check (7 skills), bundle equality, four existing packaging tests, isolated project installation and diff hygiene PASS. These static checks do not close the runtime gates.


## Seven-skill Claude invocation reconciliation

All seven have an actual Claude invocation in the historical records below. This is **aggregate coverage across separately assembled revisions**, not seven invocations of the final integrated bundle or native plugin. The connected run's seven-name discovery is a separate observation. [Installed manifest](../fixtures/integration/installed-manifest.json) pins the exact project skill bytes used by the connected run and subsequent read-only resume; no later source fixes are retroactively included.

| Skill | Actual invocation evidence | Revision/evaluation boundary |
|---|---|---|
| shape | [shape smoke](shape-smoke.md), new-product/online/offline observed outputs | Earlier installed technology reference differs from refined canonical reference; both hashes recorded there. Research-budget refinement NOTRUN |
| spec | [detailed smoke](spec-detailed-smoke.md), corrected detailed and ambiguity outputs; [native lifecycle](claude-lifecycle.md) | Detailed record pins final spec/reference hashes at that run; native invocation tested a smaller historical bundle, not all seven |
| ticket | [ticket smoke](ticket-smoke.md), green/reconcile outputs | Historical four-skill assembly; two actual Read/Skill runs. Local reasoning and host GitHub API execution remain distinct |
| build | [build smoke](build-smoke.md), direct spec/ticket/copy/no-runtime outputs; this connected run | Historical two-skill installation, later JSON-testing source refinement not rerun there. Current connection corrected exact-serialization ACs but runtime remained NOTRUN |
| diagnose | [diagnose smoke](diagnose-smoke.md), tool transcript and repaired artifact | Actual earlier assembly; post-observation hypothesis-equivalence wording source-only, not behaviorally rerun |
| improve | [improve smoke](improve-smoke.md), tool calls/output | Actual restricted analysis, separate host optimization; not writable-agent optimization or final native bundle |
| review | [review smoke](review-smoke.md), sample-a/sample-b tools and reports | Two fresh independent sessions at pinned fixture base/head; source-review evidence only, not post-fix review or final tracker transitions |

No new invocation of the already-proven unrelated skills was needed for this reconciliation. Cross-platform seven-skill invocation remains blocked by the separate Codex runtime gate.


## Fresh-session read-only resume and local frontier reconciliation

A second fresh Claude process used `/build` with [resume input](../fixtures/integration/resume-input.txt), no prior conversation or session persistence, and the same installed bytes. Only Read/Skill were exposed and allowed, with `--max-turns 18`, a 240-second host timeout, project-only settings and strict MCP. No denied command was retried. The prompt requested context/status recovery only, expressly forbidding implementation, execution, writing, tracker changes, UI, Codex and subagents.

Observed: success, is_error=false, 9 turns, 77.245 seconds, USD 0.3987428, zero permission denials. Slash-command loading supplied build; the [tool inventory](../fixtures/integration/resume-tools.json) contains exactly eight Reads: six task outputs, common contract and completion-evidence reference. No shell/write/network/tracker tools were called. Same model/version/authentication/inherited-instruction limits as the initial run apply.

The [actual output](../fixtures/integration/resume-observed.md) reconstructs D/R/AC/T mappings, conditional A-1–A-3, nonblocking U-1 and withdrawn AC-1b/AC-5b. It distinguishes source AC-7 from NOTRUN process criteria, refusing to infer execution from test-file existence. It detects stale ready/active snapshots and T-2 active despite T-1's unresolved prerequisite. Its local recommendation is T-1 blocked on runtime availability, T-2 blocked on that gate and T-1, with empty current frontier. After authorized runtime becomes available, T-1 verification precedes T-2 completion. These are **local recommendations, not actual tracker transitions**.

This establishes bounded fresh-session restoration from durable artifacts and read-only frontier reconciliation. It does not establish resumed implementation, a completed build, external tracker readback, or the new workspace lifecycle behavior. The first run's “both active” defect remains preserved; a second session detecting it is not evidence that the first run was correct. The initial agent evidence intentionally excludes the separate host oracle, so the resume's NOTRUN conclusion follows the evidence it was given.

Output limitations: it mentions an inherited unrelated dashboard `report.py` as NOTRUN; this is environment contamination, not a package requirement. Raw trace/stderr files are host harness artifacts, not suspicious product changes; the reader correctly did not claim to have inspected them. No further action followed its suggested future permissions/commands. It confirmed proposal approval is not required to restore context, improving on the initial final report's wording without changing observed history.

Host comparison after resume: all six task outputs match the prior committed observations after the already-documented path/newline normalization, and every installed skill/reference hash matches the manifest. No task source or installed instruction was mutated.
