# Review fixes and workspace lifecycle smoke — 2026-11-05

## Scope and environment

P2: the state vocabulary, single-label invariant, close/reopen rules and readback now have one canonical source, `common/tracker-state.md`. The assembler materializes common Markdown references into each standalone skill. Build loads the state reference on direct ticket input or state work; ticket loads it for state classification/creation/completion/reopening. Neither depends on another installed skill.

P3: `tests/test_package.py` has one final `unittest.main()` after all test classes. Direct execution now includes validation failures.

User follow-up: `common/workspace-lifecycle.md` supplies workspace selection, task-graph base choice, explicit cwd, scoped integration and safe cleanup. Build, diagnose and improve load it when code modification or workspace integration/cleanup applies. Small tasks may reuse a suitable workspace; conflicting/parallel work is isolated. Cleanup requires task ownership, integration ancestry, no open PR, and separate tracked/untracked/ignored inspection; unmerged work and uncertain assets remain. Only non-forced Git cleanup is prescribed, followed by a receipt.

Windows PowerShell; Python 3.12.15; Git 2.55.0.windows.3; Claude Code 2.1.317; runtime model `claude-opus-5-5`. Existing subscription authentication was reused. Fresh ignored fixture directories contain only assembled build under `.claude/skills/build`; other project skills were not installed. Inherited host instructions remained present, so this is not a clean user profile. No live tracker, UI, Codex runtime, push or external publication was attempted.

## Direct ticket state behavior

[Input](../fixtures/review-fixes/state-input.txt), [actual tool calls](../fixtures/review-fixes/state-tool-calls.json), [final ticket](../fixtures/review-fixes/state-ticket.json), [actual response](../fixtures/review-fixes/state-final.md).

The local JSON ticket began closed/completed with `status:done`, unrelated feature/urgent labels and prior evidence. Build read its local shared state contract, reopened the ticket, selected ready then active, corrected a plain-text typo, read the corrected text, appended evidence and reached done/completed. Every state change was read back. The evidence append and following label edit shared one readback; the intervening evidence-only state was not separately observed. Exactly one status label and both unrelated labels remained in each observed state; prior evidence was retained.

Result: bounded state behavior PASS, 19 turns, zero permission denials. Real tracker/API concurrency, atomic labels, relationships and provider close semantics are NOTRUN. Branch/worktree preflight was unavailable in this Read/Edit-only fixture and the output disclosed that boundary. The lifecycle pointer was added after this state run, so this run does not test the final combined build route.

An initial launch used the repository cwd instead of the fixture and was interrupted. Its trace contains failed input reads and no write calls; it is not counted as a successful invocation. The subsequent fresh invocation used the explicit fixture cwd. Raw JSONL remains ignored; committed tool calls replace local roots with placeholders and omit session identifiers.

Invocation from the fixture directory:

```powershell
Get-Content ../input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Write,Edit,Skill' --allowedTools 'Read,Skill,Write(./help.txt),Edit(./help.txt),Write(./ticket.json),Edit(./ticket.json)' --max-turns 24 --output-format stream-json --verbose
```

## Workspace cleanup decision behavior

[Input](../fixtures/review-fixes/lifecycle-input.txt), [ticket](../fixtures/review-fixes/lifecycle-ticket.txt), [Git snapshot](../fixtures/review-fixes/lifecycle-snapshot.json), [actual response](../fixtures/review-fixes/lifecycle-final.md).

A fresh disposable Git repository on integration received three task-owned worktrees. `clean` and `ignored` pointed at integration; ignored contained `private/receipt.txt` matched by `.gitignore`. `unmerged` had a new committed file absent from integration. The host captured each HEAD, integration HEAD, `merge-base --is-ancestor` exit code, `status --porcelain --untracked-files=all` and `ls-files --others --ignored --exclude-standard`. The agent received that snapshot with explicit report-only authority. The ticket also stated only clean had no work to preserve; this is a bounded instruction-following check, not a blind classification benchmark.

Build read the installed workspace lifecycle reference and proposed cleanup only for clean, preservation for ignored assets and unmerged commits, immediate rechecks before deletion, non-forced commands, and separate proposed/executed receipts. It correctly reported zero executed cleanup operations and unavailable live Git verification. Decision behavior: bounded PASS. Actual removal, branch deletion, worktree creation by the agent, PR lookup and integration: NOTRUN.

The attempted `cleanup.md` Write was denied by Claude Code dontAsk permissions despite the declared allowlist. The run respected the denial, made no alternate write attempt, and returned the proposed report in its response. File output: FAIL (not created); transport success is not artifact success. The host preserved the returned response as evidence. Result: 8 turns, one permission denial. No permission broadening or bypass retry occurred.

The same project-only/strict-MCP/no-persistence/dontAsk flags were used with `--tools Read,Write,Skill --allowedTools 'Read,Skill,Write(./cleanup.md)' --max-turns 18`. All disposable Git worktrees and their ignored assets were preserved; this evaluation deleted nothing.

## Source and assembly checks

- `python scripts/package.py check`: PASS, 7 skills.
- `python tests/test_package.py -v`: PASS, 4 tests, including both ValidationTests.
- `python -m unittest discover -s tests -v`: PASS, 5 tests.
- The standalone test moves build/ticket/diagnose/improve out of a full installation, removes sibling skills, verifies shared-reference bytes and resolves every local Markdown link inside the remaining skill.
- Bundle assembled into a fresh directory and copied into the tracked shipping tree; `python scripts/package.py check-bundle --dest plugins/skills`: PASS, 7 skills.
- `git diff --check`: PASS.

These checks establish reference availability and bounded observed decisions, not general autonomous lifecycle safety or full cross-platform acceptance.
