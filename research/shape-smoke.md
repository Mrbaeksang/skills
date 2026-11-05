# Shape behavioral evaluation — 2026-11-05

Public boundary: assembled Claude project skill discovery and `/shape` invocation, using
[synthetic fixtures](../fixtures/shape/rubric.md). No implementation/live service was attached.
Source inspection and package tests are reported separately from observed behavior.

## Environment and reproduction

Windows, Python 3.12.15, Claude Code 2.1.317, runtime-reported default model
`claude-opus-5-5` (not overridden). Existing subscription authentication was reused;
credentials were not copied. Project-only settings and strict MCP configuration were used.
Parent instructions remained available, so this is not a clean-profile test.

From the repository, choose a fresh destination (installation refuses collisions):

```powershell
python scripts/package.py install --dest .artifacts/shape-smoke/.claude/skills
Copy-Item fixtures/shape/fixture-context.md .artifacts/shape-smoke/fixture-context.md
Push-Location .artifacts/shape-smoke
Get-Content ../../fixtures/shape/new-product.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
Get-Content ../../fixtures/shape/existing-stack.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill,WebFetch,WebSearch' --allowedTools 'Read,Skill,WebFetch,WebSearch' --output-format stream-json --verbose
Get-Content ../../fixtures/shape/existing-stack.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
Pop-Location
```

Raw JSONL is local ignored evidence because it includes machine paths and runtime IDs.
Durable observed Markdown outputs preserve the actual final answers; any path redactions
are marked. No write/shell/deployment/tracker tools were exposed to the model. The harness
saved stdout and copied only a synthetic context into the isolated workspace.

## Checks and limits

- Package check: PASS; standard-library CLI unittest suite: 3 PASS.
- Bundled skill-creator quick_validate: NOTRUN due to `ModuleNotFoundError: No module named 'yaml'`; no dependencies installed. Repository validator passed independently.
- An initial harness call used the wrong relative fixture path, producing a missing-file error and no Claude prompt. Corrected to the repository-relative path above before behavioral runs. This was not a failed skill invocation.
- Codex invocation, native marketplace installation, other OS/model behavior, multi-turn answers, actual SQL concurrency/rollback, production deployment and comparative upstream efficacy: NOTRUN.
- Fixture comparisons are bounded qualitative observations, not reproducibility guarantees or evidence of actual product functionality. No keyword/golden-output tests were added.

## Research-budget observation

The online evaluation made 31 WebFetch calls plus one search before final reasoning.
That is excessive for this fixture even when sources are official. After observing it,
`technology.md` was narrowed to 2–3 feasible candidates per material decision, starting
with discriminating official evidence and stopping once support/compatibility/core
function evidence is sufficient. Extra retrieval must affect the recommendation.
The captured runs loaded the earlier technology reference; they do not establish that
the new stopping rule reduces resource use. A comparative budget rerun is NOTRUN.

## Completed invocation observations

- New product: discovered `shape`, loaded the skill and Read the bundled common contract;
  `success`, `is_error=false`, 3 turns, no permission denials. Two Read calls; trying to
  read the workspace directory returned EISDIR and the answer disclosed that limit.
  [Observed answer](../fixtures/shape/observed-new-product.md).
- Existing stack offline: discovered and loaded `shape`, Read common contract,
  technology, provenance and fixture; 8 Reads total, including four missing-code-path
  probes. `success`, `is_error=false`, 9 turns, no permission denials. Final answer
  explicitly bases code claims on supplied excerpts and labels technical memory
  unverified. [Observed answer](../fixtures/shape/observed-existing-offline.md).

| Rubric | Observed behavior | Assessment |
|---|---|---|
| A01 | New product grouped six independent questions; U-7–U-14 link downstream scale, operations, security and recovery choices to prerequisites; design expressly incomplete | PASS for first round; follow-up conversation NOTRUN |
| A03 offline branch | Existing offline explicitly has no web tools, no current/latest/support assertions; provides official recheck targets and tool availability resume condition | PASS for unavailable-research handling only |
| A04 | Existing offline preserves the VM/budget/stack, compares framework and platform migration costs, rejects unsupported migration, reads fixture before proposing changes | PASS for fixture |
| A05 | Reservations and loans own ReservationConflict/InvalidReturn; handler maps safe HTTP responses and request IDs; transaction, retry, audit, concurrency and recovery scenarios feed spec | PASS for design output; actual API/DB behavior NOTRUN |
| Handoff | D-01–D-13, P-01–P-08, U-01–U-14 separate fixed inputs, proposals and unresolved matters; latency stays undecided, no fresh interview or mutation | PASS with limitation below |

The offline answer is long for a modest fixture. Some proposal wording in its later
spec-requirements section is imperative, but P-ID references and its closing condition
explicitly retain proposal status; a consumer must preserve that distinction. This is
not evidence that every generated decision is correct or approved. Inherited workspace
instructions also caused an irrelevant dashboard NOTRUN note in outputs; that is not
part of the portable shape package.
