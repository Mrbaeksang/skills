---
name: no-dodge
description: The rigor gate that refuses LLM avoidance. Use at the start of any non-trivial task, and the instant you're about to say "that's overkill", "we're blocked on X", "we'd need a credential / DB / API key", "I'm not sure", or about to hand-author a spec/schema/API doc. Calibrates rigor to the repo's deployment level, forces a test-double or local instance before claiming blocked, research before asserting, and chains onboard-dependency for any new dependency. One gate; it chains the rest.
---

# no-dodge

LLMs dodge rigor — they go shallow, call thoroughness "overkill", claim they're "blocked" on a
credential, skip research, and sprawl docs to look busy. This gate refuses all of that. It is the
single entry point; it chains `onboard-dependency` and applies doc-discipline as steps.

## Step 0 — calibrate
Read `docs/agents/deployment-level.md`: **`current`** scales how hard the gate blocks (L0 off /
L1 warn / L2 block); **`target`** scales how thorough you must be and what seams to leave. Build
for target, run at current. Never inject "v1/MVP" — read the level, don't assume it.

## The dodge table — detect the phrase, take the action (don't say the phrase)

| About to say… | Required action before you may proceed |
|---|---|
| "that's overkill" / "too much" | Check **target** level. At production target, the thoroughness is *required* — drop the word. |
| "blocked / can't without a credential / DB / API key / service" | **Prove it.** Try a test double first: `TestModel`/`FunctionModel`, a fake response dict, `sqlite`/in-memory, a local `docker` instance, an env-gated opt-in test. Only after a double genuinely can't cover it is it truly blocked — and say *exactly* what's needed and why. |
| "I'm not sure / I think / probably" | **Research first** (web + official docs), then assert with a citation. Memory lies. |
| (about to hand-author erd.md / api.md / schema) | See **doc-discipline** below — mechanism lives in code, not prose. |

## Chain — new dependency
The moment a new library/framework/SDK/API enters: **stop and run `onboard-dependency`** (research
→ vendor official docs → feature-survey → decisions ledger → guard). Unconditional.

## doc-discipline (applied whenever you create docs)
- **One fact, one home. Reference, never copy.** If it's in a `docs/official/*` ledger or an ADR, link it.
- **Mechanism lives in code** — ERD = the migration, API spec = generated OpenAPI. **Do not
  hand-author** `erd.md` / `api.md` / `schema.md`; generate them on demand. Decisions → ADR; terms → `CONTEXT.md`.
- **Lazy** — a doc is born when a decision/dependency resolves, not pre-emptively.

## Checklist
- [ ] Read deployment level (current + target) — not assumed
- [ ] No dodge-word shipped without its required action
- [ ] "Blocked" claims proven against a test double / local instance first
- [ ] New deps routed through `onboard-dependency`
- [ ] No hand-authored mechanism docs; no duplicated facts
