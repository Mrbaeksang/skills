# Project instructions

This repository publishes portable agent skills. Canonical instructions live in `skills/<name>/SKILL.md`; `common/execution-contract.md` is the single common contract source. `scripts/package.py install` copies the contract into each skill's `references/` at packaging time. Generated installations are not canonical sources.

Use Python 3.12+ and the standard library; no dependency installation is required.

- Validate packaging: `python scripts/package.py check`
- Test CLI installation and failure behavior: `python -m unittest discover -s tests -v`
- Build an isolated Codex skill installation: `python scripts/package.py install --dest .artifacts/smoke/.agents/skills`
- Diff hygiene: `git diff --check`

Keep skill instructions portable: no personal paths, account credentials, runtime/session identifiers, or assumed platform tools. Platform-specific installation belongs in adapters/docs. Read `research/packaging.md` when changing packaging compatibility. Source validation is not evidence of agent invocation; record actual environment, input, output, and unrun boundaries for behavioral claims. Never overwrite an existing installation or unrelated user settings to make a smoke test pass.

Native plugin adapters must consume the assembled `skills/` output; pointing a marketplace directly at the raw canonical skill folders leaves the common reference unresolved.
