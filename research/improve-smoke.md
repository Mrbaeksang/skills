# Improve bounded behavioral and performance evidence

Date: 2026-11-05. Result: bounded A13/A15/A16 analysis behavior observed, and host-run A14 synthetic performance experiment passed. This does not establish whole-repository analysis, writable-agent restraint, production performance, or cross-platform support.

## Environment and actual invocation

Windows 11 build 26200, PowerShell, Python 3.12.15, Claude Code 2.1.317; runtime reported `claude-opus-5-5`. Existing subscription authentication was reused without copying credentials. An isolated ignored `.artifacts/improve-analysis` received assembled skills via `python scripts/package.py install --dest .artifacts/improve-analysis/.claude/skills`. No existing installation or settings were overwritten. Project-only settings and strict MCP config were used; inherited instructions and built-in plugins were still present, so this was not a clean profile.

From that fixture, the actual invocation was:

```powershell
Get-Content ../../fixtures/improve/input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --max-turns 18 --output-format stream-json --verbose
```

Raw stream stayed ignored because it contains local/runtime identifiers. Durable [input](../fixtures/improve/input.txt), [rubric](../fixtures/improve/rubric.md), sanitized [tool calls](../fixtures/improve/tool-calls.json), and actual [final output](../fixtures/improve/observed-analysis.md) record the evaluation. Transport result: success, 14 turns, zero permission denials. Tool trace shows actual `Skill(improve)`, common/exploration/performance reference reads, contract and six Python source reads. Reading the directory failed; the agent followed imports and explicitly said the complete inventory was unknown.

The workspace also contained test/measurement/after-implementation files copied during setup, but the recorded tool calls did not read those files. This limits clean-room claims; the evaluation was not supplied the expected findings. The final output found the graph and contract implications independently through its recorded source reads.

## Observed rubric result

| Criterion | Observation | Boundary |
|---|---|---|
| Module/use-case coverage | app→orders/reports→pricing→catalog and preview success/empty/unknown path traced with locations | Six source files read; archive explicitly inventory-only; full inventory/history/runtime unknown |
| Candidate signals | Direct fan-in/out, no static cycle in traced graph, manual branch counts, repeated calculation; churn unknown | No fabricated complexity score or runtime bottleneck claim |
| Concise proposals | AS-IS→TO-BE, impact, evidence, cost, risk, priority and validation state provided | Output is longer than ideal but remains Markdown; no HTML produced |
| Analysis authority | Only Read/Skill calls; no execution or source mutation | Restricted toolset enforces this; not proof of behavior with unrestricted write tools |
| Preservation | Before/after top-level file inventory and SHA-256 identical | [Recorded manifest](../fixtures/improve/preservation.json); no preexisting user changes in this fresh fixture |

The output correctly treated linear scanning as a performance hypothesis and named runtime/profile/history gaps. It also identified a possible generator contract ambiguity and unhashable-SKU regression risk. Those are proposals, not confirmed requirements. Its final “미수행” line contains an unexplained report.py reference; this is a reporting defect, not evidence of an edit (tool trace and hashes establish no edit). The skill was not silently adjusted to erase this observed weakness.

## Authorized synthetic optimization and red/green regression

The host ran [measure.py](../fixtures/improve/measure.py) against the committed baseline and [pricing_after.py](../fixtures/improve/pricing_after.py) in a temporary directory. This was host implementation/measurement, not Claude executing an optimization. The unchanged public seam is `app.preview(lines)`. Tests assert literal total/report, empty input, unknown→recovery and unhashable unknown input; no internal collaborator mocks.

The analysis found that a dictionary lookup changes unhashable unknown input from ValueError to TypeError. A public regression test was added first. Baseline passed; the optimized side failed with TypeError, recorded in [regression-red.txt](../fixtures/improve/regression-red.txt). Catching TypeError alongside KeyError restored the existing contract. Both sides then passed four public behavior tests. Earlier three-test success was insufficient and is not the final acceptance evidence.

Reproduce with `python -B fixtures/improve/measure.py`. The script copies only into a fresh temporary directory and leaves baseline sources unchanged. Workload: 2,000 unique SKUs, quantity 2, immutable per-process catalog; same interpreter, warmup, seven A/B pairs, complete preview return consumed and checked each time. Workload digest, all samples, min/max, profiles and test results are retained in [measurement.json](../fixtures/improve/measurement.json).

- Baseline median **52.383 ms**, range 50.753–52.965 ms.
- Optimized median **0.309 ms**, range 0.297–0.686 ms.
- Zero observed output errors; total 4,002,000 and 2,000 report rows on both sides, complete result equality for all timed calls.
- Separate cProfile runs locate baseline cost in 4,000 linear `price` calls; timings reported above exclude profiling. The optimization retains those calls but indexes the immutable catalog once.

This large difference is plausible because the fixture intentionally performs millions of Python comparisons. The claim is restricted to warm in-process preview; startup/index construction, memory cost, machine concurrent load, production traffic and external I/O were not measured. Dictionary memory is a trade-off, catalog immutability/unique keys a required precondition. No service-wide speedup or large real-repository coverage is claimed.

## Source and packaging validation

The skill's [methods comparison](../skills/improve/references/methods.md) links the exact Matt Pocock/pstack procedure files and Python/Git primary documentation read for this work. No upstream implementation was copied. No unsupported claim that either entire project lacks a feature is made.

`python scripts/package.py check`, existing four packaging/bundle unittests, and `git diff --check` passed. The optional skill-creator `quick_validate.py` could not run because PyYAML is unavailable; no dependency was installed. Repository stdlib validation covers metadata and references. Generated plugin bundle refresh belongs to integration and is not included in this ticket's edits. Codex runtime and Desktop UI were NOTRUN under the task boundary. Claude was not asked to execute performance work, and no claim of that behavioral coverage is made.
