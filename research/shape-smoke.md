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

The online evaluation made 36 WebFetch calls plus one search before final reasoning.
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


## Online completion

The online run completed: `success`, `is_error=false`, 41 turns, no permission denials.
The trace shows `shape` discovery, 3 Reads (contract, technology, fixture), 36 WebFetch
calls and one WebSearch. No additional tool authority was supplied during the run.
[Observed online answer](../fixtures/shape/observed-existing-online.md) is the complete
final output, not a constructed example.

A03: PASS for this bounded invocation's research/output behavior. The answer dates its
comparison 2026-11-05, separates fixture versions from candidates, cites PostgreSQL 17
versioned docs, Express support/release/registry, Fastify LTS/registry and deployment
references, preserves the keep option and names migration costs. It explicitly notes
potentially stale PostgreSQL minor tables, a release-year inference, the difference
between node-postgres master source and installed 8.16.3, and absence of actual tests.
The trace includes registry fetches for express, pg and fastify. These observations
establish real retrieval, not an independent audit of every technical claim in the
answer. A04/A05 handoff behavior also appears in this run.

The source guard narrowed after this run was loaded remains behaviorally NOTRUN. Both
existing-stack outputs are overlong, and the online source count is an optimization
finding; neither runtime efficiency nor superiority over upstream has been proven.
The canonical source was additionally assembled into an isolated Codex-format
`.agents/skills` destination successfully; Codex discovery/invocation was not run.

## Artifact SHA-256
- `skills/shape/SKILL.md`: `A68C0BE8C3EB9DDEF5BD7A2B1B4FBD13D73428C02EAA19641F96BD0EB72AD256`
- `skills/shape/references/technology.md`: `48B6744ED10948A6AE0A6D35388B860BB128AD930C0B87360F00BD64FEB90763`
- `.artifacts/shape-smoke/.claude/skills/shape/references/technology.md`: `D788367D316C800AD6E82ACFA6D51C283ACAAF76D1CBD9F57D460190184CB665`
- `fixtures/shape/new-product.txt`: `F5C33D9C6161AAA9AF9A65331C04FC8EC530CB4C03FA1A4FC3EA91DF354CFECF`
- `fixtures/shape/existing-stack.txt`: `8B4911CD4607BEDC638FB6D8B701512502BBF68651BD1B2AF31648A92809551E`
- `fixtures/shape/fixture-context.md`: `F623DA76507DA303BFBF171226C3718EC8EA7D439B5815BFF3DA30B6D2D6EDBB`
- `fixtures/shape/observed-new-product.md`: `628B90A219437A60365BB84EA10A16E072032F5E37907BD53C41A3D351FD7F6C`
- `fixtures/shape/observed-existing-offline.md`: `A222EF52F99A9A424204D35216F43549B5E61BB89634B78B6EC2676BE8E1039F`
- `fixtures/shape/observed-existing-online.md`: `16E4B2E145F18574F9DE28CF1D53CAF5950759031CB397F3414C22C810D9E9B7`
