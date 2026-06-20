# Deployment level

<!-- mrbaeksang:level=L2 -->

**Current level: L2 — production.**
Rationale: this is a public marketplace package; other people install it and depend on its
rails. A broken rail here breaks other people's repos. Full enforcement applies to building it.

Every mrbaeksang skill reads the marker above (`mrbaeksang:level=L2`) and scales its rigor.
To change level, edit the marker — that one token is the source of truth; the table below is
human reference only.

## The dial

| axis | L0 local / prototype | L1 staging / internal | L2 production |
|---|---|---|---|
| Prereq research (`/onboard-dependency`) | official quickstart only | full | **full + changelog/migration, vendored SoT** |
| Due-diligence (`/due-diligence`) | optional | recommended | **parallel, mandatory before commit** |
| Spike-first (`/spike-first`) | skip | recommended | **mandatory on the costliest assumption** |
| Smoke-gate (`/smoke-gate`) | manual, once | screenshot + vision, auto | **vision gate blocks "done"** |
| Guardrail hooks | off | warn (stderr, exit 0) | **block (exit 2)** |
