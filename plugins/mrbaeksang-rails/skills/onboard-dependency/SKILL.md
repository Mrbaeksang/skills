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
4. **Guard.** Add the rules to the project's PreToolUse guard so future edits that violate official usage are **denied** with a pointer to the vendored doc. See `scripts/onboard-dependency-guard.sh` for the reference guard.

## Deployment-level calibration

Read the repo's level from `docs/agents/deployment-level.md` and scale rigor:

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
