<h1>Skills That Hold the Line</h1>

> Agent skills that don't *suggest* — they **enforce**. Engineering discipline as rails, not advice.
>
> 가이드가 아니라 **레일**. 강제되는 엔지니어링 규율.

These are the skills I use to ship to **production**, not to vibe-code a demo. They exist because, in the AI age, two things are reliably true: **the agent trusts its own memory, and memory lies** — and **"I implemented it" is not "I saw it work."** Guidance doesn't fix that. Rails do.

If you've seen Matt Pocock's [Skills for Real Engineers](https://github.com/mattpocock/skills), you'll recognize the shape — small markdown skills, slash-command invoked, model-agnostic. We owe that repo the blueprint. But we sit on the **opposite end of one axis**, on purpose (see [Philosophy](#philosophy)).

---

## Quickstart

There are two install paths, because **enforcement and reach are different jobs**:

**A. Plugin + marketplace — the enforced rails (Claude Code).** This is the one that matters: a plugin's hooks activate on install, so the rails *block*, not advise.

```bash
/plugin marketplace add Mrbaeksang/skills
/plugin install mrbaeksang-rails@mrbaeksang-skills
```

**B. skills.sh — cross-agent reach (Codex, Cursor, …), skills only.** `npx skills` distributes the skill markdown but **cannot carry live hooks** — so on non-Claude agents you get the skills as guidance, not as blocking rails.

```bash
npx skills@latest add Mrbaeksang/skills
```

After either, run `/setup-mrbaeksang-skills` in your agent. It will:

- Ask the one question that calibrates everything: **what deployment level is this repo targeting?** (`local` → `staging` → `production`)
- Wire the **dependency-onboarding rail** (any new library/framework ⇒ research → vendor official docs → generate a blocking hook)
- Install the **smoke-gate** (nothing is "done" until the real output has been rendered and looked at)
- Record it all in `docs/agents/` so every skill reads the same calibration

That's it. The rails are now load-bearing.

---

## Philosophy

Matt's framing: heavyweight process frameworks (GSD, BMAD, Spec-Kit) *own the process* and take away your control, so his skills are **small, adaptable, composable guidance** you hack on. We agree the skills should be small and composable. We **disagree that the answer to bad process is softer process.**

Our claim: **guidance that isn't enforced isn't followed, and a plan you didn't verify against reality isn't true.** So our skills enforce — but they enforce a *dial*, not a tax.

### The axis we sit on

| | Matt Pocock | **mrbaeksang** |
|---|---|---|
| Source of truth | Internal docs (CONTEXT.md, ADR, PRD) | **External / live reality** — latest upstream docs, the rendered output, the running system |
| Mechanism | Guidance (prompts *advise*) | **Rails (hooks *block*)** |
| "Done" means | Tests pass / QA | **You looked at the real artifact** (screenshot + vision) |
| Rigor | Roughly uniform | **Calibrated by deployment level** |
| Trigger to research | When you feel uncertain | **Any external dependency — unconditionally.** No judgment call. |

We're not heavier than Matt *everywhere*. At `local` level the rails are off and we're lighter than a process framework. At `production` level the rails are hard. **The deployment level is the master input, and it is always asked — never assumed.**

### The failure modes these skills kill

**#1 — The agent trusted its memory.**
Library APIs moved. The "fact" was a year stale. The fix isn't "be careful" — it's a **deterministic rail**: the moment any dependency/library/framework/SDK enters the project, you research the official source *first*, **vendor** it as a single source of truth (don't symlink — it breaks on clean clones/CI), and generate a hook that blocks usage drifting from it.
→ `/onboard-dependency`

**#2 — "Implemented" was never "working."**
Tests passed and the output was still garbage, because nobody *looked*. Done means the artifact was rendered and inspected — by a human, or by the agent taking a screenshot and checking it with vision. This is a gate, not a suggestion.
→ `/smoke-gate` · adds a `needs-smoke-test` state to triage

**#3 — Guidance wasn't followed.**
The right way was written down and ignored. So we don't write it down — we **enforce** it. Official-usage rules become `PreToolUse` hooks that deny the edit and tell the agent why.
→ `/official-guardrail` (folded into `/onboard-dependency`)

**#4 — Rigor wasn't calibrated to the stakes.**
A throwaway prototype got audited like a bank, or a payment flow got vibe-coded. Every skill reads one number — the deployment level — and dials its own intensity from it.
→ `/setup-mrbaeksang-skills` records it; every skill obeys it

**#5 — The start was shallow.**
We committed to a stack before checking it, and de-risked the cheap assumptions while the expensive one quietly waited to kill us. Before committing: parallel deep due-diligence, and a spike on the single most expensive assumption *first*.
→ `/due-diligence` · `/spike-first`

---

## The skills

> Status: **charter stage.** This README is the contract we build against. Skills land here as they're written and verified (by their own smoke-gate).

**Compact on purpose** — three skills, not a sprawl (adding skills mindlessly *is* the dodge).
One gate chains the rest; doc-discipline, feature-survey, research-first grilling, and the
deployment dial are *steps inside*, not separate skills.

| Skill | Rail it enforces |
|---|---|
| `/setup-mrbaeksang-skills` | Records deployment level (current/target); installs the blocking hooks |
| `/onboard-dependency` | New dependency ⇒ research → vendor official docs → **feature survey** → decisions ledger → blocking hook. Unconditional. |
| `/no-dodge` | The rigor gate. Refuses "overkill / blocked-on-credential / I'm-not-sure / hand-authored spec": calibrates to deployment level, forces a **test-double or local instance** before "blocked", research before asserting, doc-discipline (mechanism lives in code), and chains `/onboard-dependency`. |

Hooks shipped: `onboard-dependency-guard` (un-onboarded dep) + `doc-discipline-guard` (hand-authored `erd.md`/`api.md`/schema specs). Both calibrate block/warn/off by deployment level.

### Deployment-level dial (draft — under review)

| | **L0 local / prototype** | **L1 staging / internal** | **L2 production** |
|---|---|---|---|
| Prereq research | official quickstart only | full | **required + vendored SoT** |
| Due-diligence | optional | recommended | **parallel, mandatory** |
| Spike-first | skip | recommended | **mandatory on the costliest assumption** |
| Smoke-gate | manual, once | screenshot + vision, auto | **vision gate blocks close** |
| Guardrail hooks | off | warn | **block (exit 2)** |

---

## Credit

Structure and spirit modeled on [mattpocock/skills](https://github.com/mattpocock/skills) — *Skills for Real Engineers*. We took the blueprint and pointed it the other way down the enforcement axis. Respect.
