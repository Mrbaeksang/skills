# Diagnose behavioral smoke — 2026-11-05

Bounded PASS: actual installed skill invocation repaired a reproducible CLI defect with red/green regression evidence. Hypothesis wording had a limitation documented below; this is not full performance, UI, distributed-system or cross-platform acceptance.

## Environment and input

Windows 11, PowerShell, Python 3.12.15, Claude Code 2.1.317, runtime-reported default model `claude-opus-5-5`. Existing subscription authentication was reused. Parent instructions and built-in skills remained available; this was not a clean user profile. Project skills were assembled with `python scripts/package.py install --dest <fixture>/.claude/skills` into a fresh ignored `.artifacts/diagnose-cli` workspace, with its own `fixture` git branch. No existing installation/settings were replaced.

Input: [request](../fixtures/diagnose/input.txt), [buggy implementation](../fixtures/diagnose/buggy/quote.py), [rubric](../fixtures/diagnose/rubric.md). The agent received the symptom and public contract, not a proposed fix. A tracked keep.txt had a separate uncommitted line before invocation.

Run from the fixture directory with the saved request on stdin:

```powershell
Get-Content ../diagnose-input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Write,Edit,Skill,PowerShell' --allowedTools 'Read,Skill,Write(./quote.py),Write(./test_quote.py),Write(./evidence.md),Edit(./quote.py),Edit(./test_quote.py),Edit(./evidence.md),PowerShell(python *),PowerShell(Get-Location),PowerShell(git status *),PowerShell(git branch *),PowerShell(git worktree list),PowerShell(Get-Command python*)' --output-format stream-json --verbose
```

This is a trusted bounded fixture evaluation, not an OS sandbox: allowed Python can execute generated code. No dependency installation, publication, bypass flag, subagent, UI or Codex runtime attempt occurred. Tool records were inspected; network absence is source/trace inspection, not packet monitoring. Raw JSONL remains ignored because it includes local paths/runtime IDs. The [sanitized tool transcript](../fixtures/diagnose/observed/tool-transcript.md) retains commands/results; verbose preflight inventory and Write/Edit bodies are omitted, with final file contents retained separately.

## Actual observations

Runtime completed in 24 turns, success transport, one permission denial for a compound reproduction command. Permissions were not expanded; individual CLI commands and Python subprocess capture supplied actual evidence.

| Criterion | Evidence | Verdict |
|---|---|---|
| Discovery/invocation | Skill `diagnose`, common contract and experiments reference read in trace | PASS |
| Reproduction | `python quote.py 50000`: shipping 3000, total 53000 before mutation | PASS |
| Diagnosis | Input notation and boundary probes, in-memory single-operator counterfactual; path argv → int → comparator → JSON | PASS with hypothesis caveat below |
| Regression red | Agent-authored process tests ran before source Edit: 6 tests, 4 failures for threshold forms | PASS |
| Minimal correction | Host git diff confirms only `>` → `>=` in implementation | PASS |
| Same reproduction green | Same command returns shipping 0, total 50000; 6 tests pass; 14-input before/after matrix retains other outcomes | PASS |
| User change preservation | Host before/after keep.txt SHA-256 both `70C027155A963449F7E8731E243E34E9B394AC2B67335BD4E153AC89C14D86A7` | PASS |

Durable outputs: [implementation](../fixtures/diagnose/observed/quote.py), [tests](../fixtures/diagnose/observed/test_quote.py), [agent evidence](../fixtures/diagnose/observed/evidence.md), [final report](../fixtures/diagnose/observed/final.md). Agent correctly disclosed that its own file-size observation did not establish byte identity and that it had not run git diff. Host hash/diff checks above independently close those fixture boundaries; do not rewrite the observed agent report as if it performed them.

Host verification:

```powershell
python fixtures/diagnose/verify_cli.py fixtures/diagnose/buggy
python fixtures/diagnose/verify_cli.py fixtures/diagnose/observed
python -B -m unittest discover -s fixtures/diagnose/observed -v
```

The independent oracle failed on buggy 50000 with shipping 3000, then passed 10 real-process normal/boundary/invalid cases on the corrected artifact. Generated tests passed 6 tests both in the live fixture and copied observed directory. This oracle uses parsed JSON, output channels and exit codes; it does not inspect implementation internals.

## Limits and refinement

The agent's H2 wording, “threshold higher than 50000,” is broader than its prediction that 50001 must also be charged. An inclusive threshold of 50001 is observationally equivalent on integer inputs, so the boundary probe alone does not refute that broad hypothesis. Source inspection and counterfactual establish the actual comparator defect, but the table overstates the probe's discrimination. Observed artifacts are preserved unchanged. The final experiments reference adds a narrow instruction about observational equivalence; this refinement is source-validated and has NOT been behaviorally rerun.

Reproduction-failure handling, external outage, performance measurement, nondeterminism, high-risk independent review, UI/API and other OSes: NOTRUN. Their source procedures are not runtime acceptance. Codex installation succeeded in a separate fresh `.artifacts/diagnose-codex/.agents/skills`; Codex discovery/invocation remains NOTRUN. No previously blocked UI/Codex action was retried.

Before integration sync, package check passed (4 skills), packaging unittest suite passed (3 tests), and isolated installations passed. After merging the latest integration branch, package check passed (5 skills), packaging/bundle unittest suite passed (4 tests), and final diff hygiene passed. Sanitized Markdown removes trailing whitespace without changing observed content. Methodology primary sources and adaptation boundaries are in [diagnose-methods.md](diagnose-methods.md).
