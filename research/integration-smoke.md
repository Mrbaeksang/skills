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
