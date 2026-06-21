---
name: onboard-dependency
description: Onboard any new external dependency before using it — research the official docs, vendor them as the single source of truth, then generate a blocking guard. Use when adding or first using any library, framework, SDK, API, or CLI tool; when editing package.json / requirements.txt / pyproject.toml / go.mod / Cargo.toml; or when the user mentions adopting a new tool. This is a rail, not advice — the trigger is unconditional, never "when uncertain".
---

# Onboard a dependency

## The rail

**Trigger is deterministic, not subjective.** The moment a new dependency enters the project — any library, framework, SDK, API, or CLI — you run this pipeline *before* writing code against it. There is no "I already know this one." Memory lies; APIs move.

```
[1 RESEARCH] official docs / changelog / latest version  (search the live web — never from memory)
   ↓
[2 VENDOR]   save the official pages into docs/official/<dep>/  (copy, do NOT symlink)
   ↓
[3 RULES]    extract 5–10 "official correct usage" rules + anti-patterns
   ↓
[4 GUARD]    add/extend a PreToolUse hook that blocks edits violating those rules
```

## Steps

1. **Research (live).** Find the current version, the official docs, and the *recommended* usage — not the first StackOverflow answer. Note version + retrieval date. If a sibling `/grill` is running, feed it: "latest is X, the options are A/B/C, recommend A — which?"
2. **Vendor.** Write the official reference into `docs/official/<dep>/` with a header line: `> source: <url> · version: <v> · retrieved: <date>`. Vendoring (not symlinking) survives clean clones and CI. Record it in `docs/official/INDEX.md`.
3. **Extract rules.** From the vendored docs, list the deterministic "always do X / never do Y" facts you can grep for (banned imports, required call shapes, deprecated APIs). Judgment calls go to human review, not the hook.
4. **Guard.** Don't hand-write a guard script — **append rules to `.claude/usage-rules.tsv`** (the
   generic `usage-guard` hook reads it; the hook code never changes). One TAB-separated line per
   rule, grounded in the **actually-installed** source (venv `site-packages` / `node_modules` `.d.ts`),
   not just docs:
   ```
   exts<TAB>severity<TAB>regex<TAB>message<TAB>unless(optional)
   ```
   `exts` = comma-separated extensions (`py` or `ts,tsx,js,jsx`); `severity` = `block` (unambiguous
   bug) or `warn` (fuzzy); `regex` = an ERE grep can match in changed content; `unless` = an optional
   ERE exemption. Prefer `block` only for high-confidence patterns (deprecated/removed APIs, injection,
   wrong-field bugs); everything fuzzy is `warn`. See `rules/starter-usage-rules.tsv` for examples.

## Frameworks need a CONSIDERATIONS doc

A framework (Next.js, FastAPI, a major SDK) is not just "a dependency" — adopting it commits
architecture. So beyond vendoring its docs, write `docs/official/<framework>/CONSIDERATIONS.md`
covering the footguns people miss: runtime (Node vs Edge), rendering/caching model, auth
integration, secret exposure, streaming, deploy target, i18n/SEO, version migration. Derive it
from the **latest** official docs, not memory — frameworks move fast.

Resist the reflex to call thoroughness "overkill": at a production **target**, this research is
required, not optional. And design to the **target** level — leave seams for what's coming
(global auth, billing) even if the current level doesn't implement them yet.

### Feature survey — choose deliberately, don't default to the basics

LLMs wire the two features they remember and ignore the rest. Before building on a dependency,
**enumerate its FULL feature surface** (from the official docs at the pinned version) and tag each
**USE / SKIP / MAYBE** with a one-line reason for *this* project. Put the survey in
`CONSIDERATIONS.md` and end it with a "minimum viable feature set we actually wire". You can't
choose what you never listed.

### CONSIDERATIONS.md must carry a Decisions ledger

The most dangerous gap is the decision the agent never *surfaced* — a load-bearing choice the
SDK has an official pattern for, silently skipped. Kill it with a visible ledger. Every
framework/SDK `CONSIDERATIONS.md` ends with a `## Decisions (official SDK patterns)` table:

| concern | official pattern / options | our decision | status |
|---|---|---|---|

Enumerate the load-bearing concerns the SDK forces you to choose on — typically **memory /
conversation history, state injection, tool registration, error/retry, streaming, usage &
cost limits, auth, caching, deployment** (tailor per SDK). An undecided row is **`TBD` (visible)**,
never absent. No silent skips. Proactively raise these *before* building — the user shouldn't
have to notice they were missing.

## Deployment-level calibration

Read `docs/agents/deployment-level.md`: `current` scales the guard (block/warn/off), `target`
scales the considerations + architectural seams. Build for target, run at current.

| | L0 local / prototype | L1 staging / internal | L2 production |
|---|---|---|---|
| Research | official quickstart only | full | **full + changelog/migration review** |
| Vendor | skip (link in INDEX) | vendor key pages | **vendor + version-pin** |
| Guard | off | warn | **block (exit 2)** |

If `deployment-level.md` is missing, **stop and ask the level** — never assume.

## Checklist

- [ ] Researched the official source live (version + date noted)
- [ ] Vendored into `docs/official/<dep>/`, logged in `INDEX.md`
- [ ] Extracted grep-able official-usage rules
- [ ] Guard updated (or explicitly off, per level)
