---
name: setup-mrbaeksang-skills
description: Configure the mrbaeksang rails in a repo — record its deployment level and confirm the enforcing hooks are active. Run this once after installing the plugin. Use when the user runs /setup-mrbaeksang-skills or asks to set up / configure the rails.
disable-model-invocation: true
---

# Setup mrbaeksang skills

The rails calibrate everything off one number: the repo's **deployment level**. This skill
records it and confirms the enforcing hooks are live. Run it once per repo.

## Steps

1. **Explain, then ask the deployment level.** It's the master dial — the user may not know
   the term. Levels:
   - **L0 — local / prototype.** Just making it work. Rails off; lightest.
   - **L1 — staging / internal.** Real but limited users. Research full, smoke-gate auto, hooks *warn*.
   - **L2 — production.** External/paying users, real responsibility. Full enforcement; hooks *block*.

   Recommend L2 unless the user says it's a throwaway. **Never assume — always ask.**

2. **Write `docs/agents/deployment-level.md`** with two machine-readable markers, each on its own line:
   ```
   <!-- mrbaeksang:current=L1 -->
   <!-- mrbaeksang:target=L2 -->
   ```
   `current` = what hooks enforce now (block/warn/off); `target` = what you design toward (seams).
   Then the human-readable dial table. The markers are the single source of truth hooks grep.

3. **Seed `.claude/usage-rules.tsv`** from the plugin's `rules/starter-usage-rules.tsv` (common deps'
   official-usage rules). The generic `usage-guard` hook reads this file; `/onboard-dependency`
   appends a line per new dependency. The hook code never changes — only this data grows.

4. **Write the `## Engineering rails` section into `CLAUDE.md`** (or `AGENTS.md` if that's the repo's
   file) so a fresh agent reads the conventions before hooks ever fire:
   ```markdown
   ## Engineering rails (mrbaeksang)
   - Deployment level: docs/agents/deployment-level.md (current/target). Build for target, run at current.
   - External dependency? Onboard first (/onboard-dependency): research official usage grounded in the
     installed source → vendor docs/official/<dep>/CONSIDERATIONS.md → append usage rules. Don't use a
     library you haven't onboarded.
   - No dodge: never ship "overkill / blocked-on-credential / not sure" — check level / use a test
     double or local instance / research first.
   - Mechanism lives in code: ERD = the migration, API = generated OpenAPI. Don't hand-author
     erd.md/api.md. Decisions → docs/adr/, terms → CONTEXT.md.
   - Hooks (.claude, level-calibrated): onboard-dependency-guard, doc-discipline-guard, usage-guard.
   ```

5. **Confirm rails are active.** `/reload-plugins` should report the `mrbaeksang-rails` hooks.
   Smoke-test: add an un-onboarded dependency to a manifest (blocked at L2 / warned at L1), and ensure
   `docs/official/INDEX.md` exists for vendored sources.

## Which skills now read this

- `/onboard-dependency` — gates new dependencies; rigor + block/warn/off scales with the level
- `/smoke-gate` — strictness of the "look at the real output" gate scales with the level
- `/due-diligence`, `/spike-first` — mandatory at L2, optional at L0

## Done

Tell the user the level is recorded, the rails are calibrated, and they can change it anytime by
editing the `mrbaeksang:level=` marker — re-running this skill is only needed to reconfigure.
