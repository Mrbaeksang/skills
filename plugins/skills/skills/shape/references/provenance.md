# Upstream comparison and attribution

Read on 2026-11-05. These are source observations, not comparative performance results.
The Korean shape procedure is newly written, adapting the concepts below; it does not
vendor upstream scripts, templates, runtime configuration or model orchestration.
MIT notices are preserved in [third-party notices](third-party-notices.md).

| Source pinned to revision | Observed procedure | Reuse and deliberate difference |
|---|---|---|
| [Matt Pocock grilling](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/grilling/SKILL.md) | A design tree groups all questions with settled prerequisites into a round; facts are explored before dependent questions; user confirmation closes the session. | Reuse dependency-aware question rounds and facts-before-questions. Current upstream already batches questions; claiming it only asks one at a time would be false. Shape limits batches to usable size, permits reversible implementation judgment, and removes mandatory final reconfirmation and mandatory subagent fact-finding. |
| [Matt Pocock domain-modeling](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling/SKILL.md) | Challenge terminology against glossary/code, probe concrete edge cases, capture domain language, reserve ADRs for meaningful difficult-to-reverse decisions. | Reuse language checking and selective ADRs. Shape respects the requested output destination instead of always creating glossary files immediately; adds explicit invariants, module contracts, centralized translation versus domain error ownership. |
| [pstack architect](https://github.com/cursor/plugins/blob/bb68f2365eceafa0cb2d253112f675acf5f144cc/pstack/skills/architect/SKILL.md) | Ground existing systems with how/why, compare structurally distinct sketches with arena, synthesize rationale, implement; human checkpoint is opt-in. | Reuse existing-system grounding, alternatives and rationale. Shape stops at decisions; no implementation scaffolds, arena/model dependencies, or mandatory two whole architectures for small requests. Its default also avoids redundant confirmation. |
| [pstack feature playbook](https://github.com/cursor/plugins/blob/bb68f2365eceafa0cb2d253112f675acf5f144cc/pstack/skills/poteto-mode/playbooks/feature.md) | Understand subsystem, architecture, scoped delegation and matching-surface verification; distinguish inconclusive checks. | Reuse evidence boundaries and scoped success criteria, not implementation/PR/delegation steps, which exceed shape's responsibility. |

Matt Pocock sources: MIT, Copyright (c) 2026 Matt Pocock; license at the same
[revision](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/LICENSE).
pstack sources: MIT, Copyright (c) 2026 Lauren Tan; license at the same
[revision](https://github.com/cursor/plugins/blob/bb68f2365eceafa0cb2d253112f675acf5f144cc/pstack/LICENSE).

The excerpts read do not constitute a complete audit of either upstream suite. Shape's
explicit operational-gap checklist, dated official technology comparison with a keep
option, and spec-ready decision ledger are product requirements, not claims that every
upstream skill lacks those behaviors. No superiority claim is supported by this reading.
