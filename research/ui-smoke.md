# UI verification smoke — 2026-11-05

Result: **partial implementation; issue #7 remains blocked/open**. The installed build skill's missing-provider reporting passed a real invocation. UI happy/error/recovery/regression behavior and the done branch remain **NOTRUN**. Written instructions, source review and syntax checks are not UI acceptance.

## Environment and authority

Windows 11, PowerShell, Python 3.12.15, Node v24.22.0, Claude Code 2.1.317, runtime-reported model `claude-opus-5-5` (not overridden). Implementation branch `ticket/7`, initial integration base `8f0a74b`, initially clean worktree. Changes are confined to build's UI pointer/reference, disposable fixtures and this evidence. No dependency installation, deployment, external posting, credentials, payment, data deletion or unrelated settings mutation occurred. Browser version and CUA provider version were not exposed/verified.

## Actual provider discovery and enforced stop

The host agent invoked `cua.getState()` through `mcp__cua_repl`. The native inventory exposed a running Google Chrome window. Browser inventory returned no browsers and this exact error:

```text
Browsers: Error: The browser access host is unavailable
```

The documented native fallback was attempted by selecting the Chrome window ID returned by inventory using `cua.getApp({windowId: ...})`. The tool refused before returning a selected window or allowing navigation/input:

```text
Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy. Stop your work and send a final message noting why Computer Use ended.
```

The host stopped UI work immediately. A subsequent explicit instruction authorized only independent non-UI work. No browser automation, alternate provider, screenshot, direct DOM manipulation or shell-based UI bypass was attempted afterward. No fixture page was opened and no form was manipulated. Provider discovery is observed; actual usable UI control is blocked, not PASS. Inventory identifiers and unrelated window contents are intentionally omitted from durable evidence.

Resume requires an authorized UI provider that can identify its current URL/window with sufficient policy confidence, followed by a new permitted run against the local fixture. The agent must perform the UI tests once that environment is available; this is not a user testing handoff.

## Fixture and unrun public seam

[Representative input](../fixtures/ui/input.txt) defines the public UI seam before implementation: type/submit and observe greeting/error, correct invalid input, repeat submission and reload. [Fixture](../fixtures/ui/index.html) is self-contained and in-memory, with no external resources or account. It can be opened as a local file in an authorized browser.

The initial fixture intentionally lacked empty-input validation for a planned UI RED observation. Because provider selection failed first, **RED was not observed**. The fixture was subsequently corrected by source review: trim input, show `Enter a name.` and return without modifying the previous greeting on empty input. Successful input clears the error and replaces the existing result text. This is prepared code, not a completed TDD/UI cycle. No mirror-of-implementation test was added to manufacture a UI pass.

| Acceptance boundary | Actual observation | Status |
|---|---|---|
| Provider discovery | browser host unavailable; native Chrome inventoried; selection policy-blocked | Partial; usable control blocked |
| UI1: Mina → Greet → Hello, Mina! | No UI input performed | NOTRUN |
| UI2: empty/whitespace → error and old greeting retained | Source branch inspected only | NOTRUN |
| UI3: Joon recovery, repeated submission, reload | Source inspected only | NOTRUN |
| Actual successful UI → done decision | No successful UI run exists | NOTRUN |
| Missing tools → blocked/NOTRUN and concrete resume conditions | Real isolated Claude invocation below | PASS, bounded |
| No inferred deployment/payment/deletion permission | Invocation exposed Read/Skill only; no mutation tool calls | PASS, bounded |
| Authentication/service absence behavior | No such external service or account in fixture | NOTRUN |
| Other browsers/native apps/OSes | Not executed | NOTRUN |

## Installed skill invocation without UI tools

Assembled skills were installed into a fresh ignored `.artifacts/ui-blocked/.claude/skills` directory. Only the fixture HTML and [blocked input](../fixtures/ui/blocked-input.txt) were copied into the test workspace. Existing installation/settings were not overwritten. Project-only settings, strict MCP config and existing subscription authentication followed [build-smoke.md](build-smoke.md); this is not a clean user profile or OS sandbox.

Reproduction from a fresh fixture directory after `python scripts/package.py install --dest <fixture>/.claude/skills` and copying `index.html`/the input:

```powershell
Get-Content input.txt -Raw | claude -p --setting-sources project --strict-mcp-config --no-session-persistence --permission-mode dontAsk --tools 'Read,Skill' --allowedTools 'Read,Skill' --output-format stream-json --verbose
```

Actual observations:

- `/build` was discovered/loaded; four Read calls fetched the assembled execution contract, `ui-verification.md`, completion evidence reference and `index.html`.
- Final transport result: success, `is_error=false`, 5 turns, zero permission denials. Transport success did not become product completion.
- [Actual final response](../fixtures/ui/blocked-observed.md) states blocked, marks each UI scenario NOTRUN, distinguishes static logic inspection from rendering/input/submit/reload, and identifies an accessible browser/native provider plus fixture access as resumption conditions.
- It did not request user testing, claim done, invoke another skill, write a file, install anything or attempt external operations.
- Output mentions inherited git snapshot/dashboard instructions. These are environment contamination, not package features; it discloses inability to refresh the git state or run the dashboard. The local root was replaced with `<fixture>` in the committed output. Raw JSONL is ignored because it contains personal paths/runtime identifiers.

## Non-UI checks and boundaries

`python scripts/package.py check`: PASS (2 skills). `python -m unittest discover -s tests -v`: PASS (3 existing packaging tests). Isolated assembled installation: PASS (2 skills). JavaScript extracted from the fixture's script tag and piped to `node --check`: PASS. `git diff --check`: PASS. These check package integrity and JavaScript syntax only; no DOM execution, HTML renderer or UI behavior is implied.

Official references inspected on 2026-11-05: [WHATWG DOM textContent](https://dom.spec.whatwg.org/#dom-node-textcontent) for replacement of text content, and [HTML form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm) for the form submission boundary. These sources informed fixture construction; they do not establish observed browser behavior.

Code/protocol preparation is complete for this bounded change. Required runtime UI acceptance remains blocked. Keep issue #7 open until a permitted run records UI1–UI3 and the evidence-based done decision.

Integration sync: committed the scoped implementation as `5117ab3`, then merged integration tip `ef37a3c` into `ticket/7` as `812dd5c`. No conflicts. After that merge, package check passed for 3 skills, the same 3 packaging tests passed, and diff hygiene passed. The isolated behavioral invocation above still refers to the pre-merge 2-skill installation; it was not rerun or silently upgraded to broader coverage.
