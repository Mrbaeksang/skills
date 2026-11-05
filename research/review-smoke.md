# Review behavioral smoke — 2026-11-05

Bounded PASS: two fresh Claude Code sessions invoked the assembled `review` skill.
The seeded authorization regression produced one correct P1 finding; the clean
control produced no findings. This is independent source review, not production
payment validation or a general accuracy benchmark.

## Environment and invocation

Windows, PowerShell, Python 3.12.15, Claude Code 2.1.317; runtime reported
`claude-opus-5-5`. Existing subscription authentication was reused. Parent workspace
instructions and built-in skills remained available: this was not a clean profile.
In particular, reports mention a dashboard instruction inherited from the parent;
neither reviewer executed it. No personal settings or existing installation was replaced.

`python fixtures/review/prepare.py .artifacts/review-run` created two fresh git
fixtures with immutable base/head pairs, source snapshots, complete two-tree diffs
and spec hashes. It installed all assembled skills into each `.claude/skills`.
Only `review` was invoked; shape/spec/ticket/build were not prerequisites.

Each reviewer received the same [request](../fixtures/review/input.txt), the
[contract](../fixtures/review/spec.md), its scope/diff/base/head files and installed
skill references. Neither received the [rubric](../fixtures/review/rubric.md),
oracle, implementation discussion, variant label meaning or expected findings.
Each fresh process was separate from the builder session and from the other review.

From each sample workspace:

```powershell
Get-Content ../../../fixtures/review/input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
```

This trusted local fixture was bounded to read-only tools, not an OS sandbox.
Both sessions completed in 10 turns with success transport and zero permission
denials. Tool traces contain Skill(review) and seven Read calls each: all five
raw artifacts plus common contract and independent-review reference. No execution,
mutation, network tool, UI, Codex runtime, publication or settings changes occurred
in the reviewer trace. Raw JSONL stays ignored because it contains runtime IDs and
local paths. Sanitized tool inventories preserve calls and observed reports retain
the actual final text. An initial host prompt-file path error exited before any
model invocation; correcting the relative path required no permissions change.

## Observations and independent oracle

| Sample | Pinned scope and observed output | Quality |
|---|---|---|
| Seeded | [scope](../fixtures/review/observed/sample-a/scope.md), [diff](../fixtures/review/observed/sample-a/change.diff), [report](../fixtures/review/observed/sample-a/report.md), [tools](../fixtures/review/observed/sample-a/tools.md) | 1 true positive, 0 false positives, 0 missed seeded defects |
| Clean | [scope](../fixtures/review/observed/sample-b/scope.md), [diff](../fixtures/review/observed/sample-b/change.diff), [report](../fixtures/review/observed/sample-b/report.md), [tools](../fixtures/review/observed/sample-b/tools.md) | 0 findings, 0 false positives |

The seeded reviewer identified the removed ownership guard as an R1 violation,
gave head location, concrete input/result reasoning, impact and P1 priority, and
checked whether the authenticated upstream adapter could replace authorization.
It kept the second consequence (error precedence) under the same root cause.
It explicitly separated source inference from execution and refused build done
while the high-risk finding remained. Both reviewers found documented S1 satisfied;
neither invented style rules. The clean reviewer rejected a style candidate and
separated pre-existing argument handling observations from findings.

Both reports pinned the requested base/head and spec, acknowledged host-supplied
hash evidence instead of claiming independent hash computation, and marked runtime
NOTRUN. The clean reviewer also withheld build done without runtime evidence despite
having no finding. This demonstrates review's completion implication, not an actual
build invocation or tracker state transition.

Host public-boundary oracle: `python fixtures/review/verify_cli.py <source-directory>`.
The oracle invokes real Python CLI processes and checks parsed JSON, exit code and
stderr against independent contract examples. Base: 5/5 pass. Seeded head: 2/5 fail
(unauthorized transfer and rejection precedence), exit 1. Clean head: 5/5 pass,
exit 0. The seeded source is deliberately retained unchanged. This is a fixture
sensitivity/control check, not a claim of red-green skill improvement: there was no
prior review skill behavior baseline and no defect repair performed by reviewers.

## Validation boundaries

Package validation and four existing CLI packaging/install tests pass. Fresh
project installation succeeded for both fixtures. Source snapshots were rechecked
against pinned git tree text after CRLF normalization; saved observed heads match
workspace bytes. The reviewer made no source changes. An initial byte comparison
failed because Git stores LF while fixture files use CRLF, not a source discrepancy.
Diff hygiene passed. skill-creator's optional quick_validate.py could not run because
PyYAML is absent; no dependency was installed. Repository standard-library validation
passed instead. The shipping generated bundle is refreshed by integration.

NOTRUN: broader review accuracy, a positive documented-rule violation sample,
uncertain heuristic escalation, moving/uncommitted HEAD handling, unavailable
independent-session fallback, post-fix re-review, actual build/tracker transitions,
Codex discovery/invocation, UI, other OSes and production authorization/payment/data
systems. These procedures exist in source but these two trials do not establish
their behavioral acceptance. No previously policy-blocked runtime route was retried.

The skill was authored from repository SPEC/issue #10 and local skill-creator,
writing-for-agents and TDD guidance; no third-party implementation was copied.
SPEC already selects installed skill behavior as the public evaluation seam.
