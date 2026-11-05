# Codex lifecycle evidence

Date: 2026-11-05. Windows, PowerShell 7.6.6, Python 3.12.15, Codex CLI 0.166.0. Official [plugin packaging](https://developers.openai.com/plugins/build/plugins) fetched on this date; CLI add/list/remove/marketplace help inspected. Website is unversioned. No upstream code copied.

## Native installation: PASS

`python scripts/smoke_codex.py` creates an owned temporary marketplace copy and CODEX_HOME, then uses real Codex CLI commands. It copies no credentials. Observed:

- marketplace add → plugin add `skills@baeksang-skills`, version 0.1.0.
- list shows installed/enabled; cached spec contract bytes equal canonical contract.
- temporary source manifest version changed to 0.1.1; add refreshes installation; returned version and cached manifest both 0.1.1.
- remove → list installed empty → add 0.1.1 → remove → cache absent/list empty → marketplace remove.
- original user config.toml, AGENTS.md and plugin tree inventory: 2,246 files, identical SHA-256 mapping before/after.

These are local-source lifecycle results, not a GitHub-fetch or Desktop test. The version bump was confined to temporary test data. No auth file was read or copied. The protected inventory excludes volatile logs and authentication contents.

## Actual model invocation: BLOCKED

Fresh isolated CODEX_HOME `codex login status` returned `Not logged in`. A separately owned fixture received the already-installed cache's skills in `.agents/skills`. Existing authentication was reused without copying it. Invocation:

```text
codex exec --ephemeral --ignore-user-config --json --sandbox workspace-write --skip-git-repo-check --cd <owned-fixture> -o <local-output> <fixtures/spec/decided-input.txt>
```

The request was the unchanged notes CLI fixture: decided add/list behavior, standard library, UTF-8 JSON, corruption preservation, no implementation or publishing. The runtime discovered spec and attempted:

```powershell
Get-Content .agents/skills/spec/SKILL.md; Get-Content .agents/skills/spec/references/execution-contract.md
```

The host rejected the command with `rejected: blocked by policy`. No bypass or further permission-mode escalation was attempted. The response produced a Korean minimal spec with AC-01–AC-05, preserved fixed requirements and undecided performance, and disclosed that the common contract could not be read. That fallback output is **not successful skill execution**. Rubric criterion 1 (installed instruction and common-contract read) failed; native authenticated plugin invocation is NOTRUN. Shell policy permitting legitimate fixture reads in a supported environment, followed by a new successful trace and rubric review, is required to close the runtime gate. Existing-login reuse is not clean-home authentication isolation.

## Automated checks

The new CLI-boundary test first failed because bundle was unsupported, then passed after implementation. It checks a self-contained bundle, exact reference bytes, drift detection, and refusal to overwrite an existing destination containing user data. Source/package tests and diff hygiene are separate from the runtime blocker. Generated output must be rebuilt after integration changes; `check-bundle` enforces this.
