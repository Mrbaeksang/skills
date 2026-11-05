# Build behavioral smoke — 2026-11-05

Result: bounded PASS for direct spec and ticket implementation through actual CLI invocation, low-risk copy correction, and honest missing-runtime reporting. This is not full cross-platform A17, API/UI acceptance, or independent high-risk review.

## Environment and authority

Windows 11, PowerShell, Python 3.12.15, Claude Code 2.1.317, runtime-reported model `claude-opus-5-5` (default). The installation/discovery method follows [spec-smoke.md](spec-smoke.md). Existing subscription authentication was reused without copying credentials. Project-only settings and strict MCP configuration were used. Parent instructions and built-in skills remained available; this was not a clean user profile.

Four separate ignored workspaces under `.artifacts/build-*` received assembled project skills via `python scripts/package.py install --dest <fixture>/.claude/skills`. Spec/ticket fixtures had their own git repository and `fixture` branch, a tracked `keep.txt`, then an unrelated uncommitted line. No existing installation or settings were overwritten.

Input files: [spec](../fixtures/build/spec-input.txt), [specification](../fixtures/build/SPEC.md), [ticket](../fixtures/build/ticket-input.txt), [copy](../fixtures/build/copy-input.txt), [missing runtime](../fixtures/build/no-runtime-input.txt).

For spec/ticket, run from the fresh fixture directory (replace INPUT with the chosen input):

```powershell
Get-Content INPUT -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Write,Edit,Skill,PowerShell' --allowedTools 'Read,Skill,Write(./quote.py),Write(./test_quote.py),Write(./evidence.md),Edit(./quote.py),Edit(./test_quote.py),Edit(./evidence.md),PowerShell(python *),PowerShell(Get-Location),PowerShell(git status *),PowerShell(git branch *),PowerShell(git worktree list),PowerShell(Get-Command python*)' --output-format stream-json --verbose
```

This is a bounded trusted-fixture evaluation, not an OS sandbox: the allowed Python interpreter can execute generated fixture code. Native file permissions constrained edits to the named files, prompts confined side effects to the fixture, and tool traces were inspected. No bypass flag, external publication, dependency installation, or subagent was used. Raw JSONL stays ignored because it contains local paths and runtime identifiers. Committed outputs replace local fixture roots with `<fixture>`; generated code/tests are retained unchanged.

## Observations

| Criterion | Observed behavior | Result |
|---|---|---|
| A08 spec/ticket direct input | Both discovered `build`, loaded common contract, implemented without earlier-stage invocation or repeated approval | PASS |
| A09 public behavior | Each authored process-level tests, observed missing implementation fail, then passed 6 tests and real CLI calls | PASS (bounded fixture) |
| DDD/error responsibility | Domain validation/pricing and CLI JSON/exit conversion separated inside a small module; no imposed architecture migration | PASS |
| A16 existing changes | `keep.txt` SHA-256 before/after both runs `58BC1DF9EFE451B18EDA67997CAF87AD54021308B44E3752D0EB4B9465019B0E`; original dirty line preserved | PASS |
| A10 low-risk copy | Read → Edit → Read of help.txt; `Show delivry quote.` became `Show delivery quote.`; no test file created | PASS |

Spec run: success, 31 turns, 3 permission denials. Ticket run: success, 27 turns, 1 denial. Both attempted a compound preflight command outside the allowlist; spec also attempted compound exit-report commands. These denials were retained, not bypassed by changing permissions. Allowed individual reads and Python subprocess observations supplied the needed state/runtime evidence. Full combined preflight command success is not claimed. The copy run completed in 6 turns with no denials and explicitly disclosed unavailable shell/state checks.

Durable observed artifacts:

- [spec implementation](../fixtures/build/observed-spec/quote.py), [tests](../fixtures/build/observed-spec/test_quote.py), [evidence](../fixtures/build/observed-spec/evidence.md), [final output](../fixtures/build/observed-spec/final.md)
- [ticket implementation](../fixtures/build/observed-ticket/quote.py), [tests](../fixtures/build/observed-ticket/test_quote.py), [evidence](../fixtures/build/observed-ticket/evidence.md), [final output](../fixtures/build/observed-ticket/final.md)
- [copy output](../fixtures/build/build-copy-observed.md)

An independent host probe invokes each CLI as a subprocess and checks parsed JSON, stdout/stderr, exit codes, boundary values and failure→success recovery. It does not import domain internals. Each implementation passed 10 calls in the original workspace and again in the committed sanitized artifact directory. Each generated unittest suite also passed 6 tests after copying:

```powershell
python fixtures/build/verify_cli.py fixtures/build/observed-spec
python fixtures/build/verify_cli.py fixtures/build/observed-ticket
python -B -m unittest discover -s fixtures/build/observed-spec -v
python -B -m unittest discover -s fixtures/build/observed-ticket -v
```

## Limits and refinement

The spec run added an exact JSON whitespace test beyond the semantic JSON requirement. This is a demonstrated test-quality weakness, not a package PASS claim for all possible test choices. The final skill now explicitly prefers parsed JSON plus channel/exit checks unless serialized formatting is specified. That narrow instruction refinement has source validation but has not been rerun in the CLI; observed artifacts intentionally preserve the original output. Both fixtures added stricter lexical input choices, disclosed as reversible choices; they do not establish universal integer parsing policy.

UI adapter, API server, high-risk authentication/payment/data mutation and independent review: NOTRUN, assigned to later slices. Other OSes and Codex behavioral execution: NOTRUN. The stateless fixture has no relevant authorization/dependency service failure; these are not silently claimed tested. Network absence was source-inspected, not packet-monitored.

Official sources checked on 2026-11-05: [Python 3.12 subprocess](https://docs.python.org/3.12/library/subprocess.html) for process exit/output capture and [unittest](https://docs.python.org/3.12/library/unittest.html) for public CLI test execution. No new dependency or latest-version claim was needed.

## A12 missing runtime observation

The Read/Skill-only run completed with an explicit blocked/미완료 result: quote.py, test_quote.py and evidence.md were not written or executed; R1–R5 were NOTRUN. It supplied unexecuted draft code but did not mark it implemented. Resume conditions named writable fixture access and a Python runtime/process tool. It made no tool-installation attempt or other skill call. [Observed output](../fixtures/build/build-no-runtime-observed.md) preserves the actual result. This run used the same project-only/strict-MCP/no-persistence/dontAsk flags with `--tools Read,Skill --allowedTools Read,Skill`. Result: success (transport), 15 turns, 0 permission denials; product implementation remained blocked.

Final source verification: package check PASS (2 skills), existing package unittest suite PASS (3 tests), diff hygiene PASS. Final skill-only refinement was not behaviorally re-executed.
