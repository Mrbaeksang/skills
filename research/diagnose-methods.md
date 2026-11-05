# Diagnose methods — 2026-11-05

Original instructions were read before composing the new skill. This is a source comparison, not a quality ranking or performance benchmark. No upstream text or code is vendored; the workflow and fixture are original. Upstream revisions identify the current default-branch snapshot queried during this research; links below are pinned for audit.

| Primary source | Useful method | Adaptation and dependency boundary |
|---|---|---|
| [Matt Pocock diagnosing-bugs](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/diagnosing-bugs/SKILL.md) | A runnable symptom-sensitive failure loop, minimization, competing predictions | Keep a real failing signal; scale hypotheses to the defect instead of imposing a fixed count. Do not require its shell HITL template. |
| [pstack investigation](https://github.com/cursor/plugins/blob/bb68f2365eceafa0cb2d253112f675acf5f144cc/pstack/skills/poteto-mode/playbooks/investigation.md) and [perf issue](https://github.com/cursor/plugins/blob/bb68f2365eceafa0cb2d253112f675acf5f144cc/pstack/skills/poteto-mode/playbooks/perf-issue.md) | Read-only investigation boundary; baseline/post-fix trace and inconclusive measurement handling | Keep scope and measurement discipline; omit its how/why/unslop/architect dependencies, model-specific delegation and automatic PR flow. |
| [Superpowers systematic-debugging](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/SKILL.md) | Trace data across failing boundaries, test one variable, regression before fix | Use evidence before mutation; no required peer skills or fixed retry-count architecture escalation. |
| [Google SRE Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/) | Hypothesis-testing and known-input probes to discriminate failure locations | Predictions, actual observation and unresolved alternatives form the evidence table. |
| [Brendan Gregg USE Method](https://www.brendangregg.com/usemethod.html) | Resource utilization, saturation and errors as investigation questions | Conditional performance reference, paired with workload/trace evidence; no assumed platform commands or tool installation. |

The concrete distinctions are intentional adaptations, not claims that upstream skills failed. Runtime/tool availability is checked per task. Only the CLI defect branch is behaviorally exercised in [diagnose-smoke.md](diagnose-smoke.md); performance, distributed traces and nondeterminism remain unrun.
