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

2. **Write `docs/agents/deployment-level.md`** with the machine-readable marker on its own line:
   ```
   <!-- mrbaeksang:level=L2 -->
   ```
   Then the human-readable dial table (copy from the plugin's `docs/agents/deployment-level.md`
   template). The marker is the single source of truth that hooks grep; the table is reference.

3. **Confirm the rails are active.** Tell the user `/reload-plugins` should report the
   `mrbaeksang-rails` hooks. Smoke-test the guard: attempt to add an un-onboarded dependency to a
   manifest and confirm it is blocked at L2 (warned at L1, ignored at L0).

4. **Point at the official-docs source of truth.** Ensure `docs/official/INDEX.md` exists; the
   `/onboard-dependency` rail vendors new dependencies' official docs there.

## Which skills now read this

- `/onboard-dependency` — gates new dependencies; rigor + block/warn/off scales with the level
- `/smoke-gate` — strictness of the "look at the real output" gate scales with the level
- `/due-diligence`, `/spike-first` — mandatory at L2, optional at L0

## Done

Tell the user the level is recorded, the rails are calibrated, and they can change it anytime by
editing the `mrbaeksang:level=` marker — re-running this skill is only needed to reconfigure.
