# Project instructions

This repository publishes portable Markdown skills. Canonical instructions live in `skills/<name>/SKILL.md`; `common/` is the single source for shared contracts. `npm run sync` updates generated references in each skill and the native plugin bundle. Commit those copies so direct installers receive self-contained skills; edit their common source rather than generated copies.

Maintainer scripts use Node.js 22+ and built-in modules; no dependency installation is required. Ordinary users install with native marketplaces or `npx skills@latest add Mrbaeksang/skills`, without running maintainer scripts.

- Validate standalone references and native bundle drift: `npm run check`
- Test validation, containment, and preservation behavior: `npm test`
- Exercise the existing skills installer in an isolated project: `npm run smoke:install`
- Diff hygiene: `git diff --check`

Keep skill instructions portable: no personal paths, account credentials, runtime/session identifiers, or assumed platform tools. Platform-specific installation belongs in adapters/docs. Read `research/packaging.md` when changing packaging compatibility. Source validation is not evidence of agent invocation; record actual environment, input, output, and unrun boundaries for behavioral claims. Never overwrite an existing installation or unrelated user settings to make a smoke test pass.

Native plugin adapters consume the assembled `plugins/skills/` output. Repository skill folders also contain generated shared references for direct-copy installers. Preserve historical Python fixtures and execution records as evidence, separately from current Node.js maintenance commands.
