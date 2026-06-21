# Deployment level

<!-- mrbaeksang:current=L2 -->
<!-- mrbaeksang:target=L2 -->

**Current: L2 · Target: L2 — production.**
Rationale: a public marketplace package others install and depend on. A broken rail here breaks
other people's repos, so enforcement is full from day one and the target equals the current.

Two markers, two jobs:
- **`current`** — what blocking hooks enforce *right now* (block / warn / off).
- **`target`** — what skills design *toward* (architectural seams, considerations). Build for
  target, run at current. If current < target, leave seams (auth, billing) even if unbuilt.

Edit the markers to change level; they are the source of truth, the table is reference.

## The dial

| axis | L0 local / prototype | L1 staging / internal | L2 production |
|---|---|---|---|
| Prereq research (`/onboard-dependency`) | official quickstart only | full | **full + changelog/migration, vendored SoT** |
| Due-diligence (`/due-diligence`) | optional | recommended | **parallel, mandatory before commit** |
| Spike-first (`/spike-first`) | skip | recommended | **mandatory on the costliest assumption** |
| Smoke-gate (`/smoke-gate`) | manual, once | screenshot + vision, auto | **vision gate blocks "done"** |
| Guardrail hooks | off | warn (stderr, exit 0) | **block (exit 2)** |
