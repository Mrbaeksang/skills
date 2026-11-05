# Diagnose behavioral acceptance

- Installed skill discovery and common contract read are visible in runtime trace.
- Actual public CLI reproduces shipping 3000 at 50000 before source mutation.
- Competing explanations have distinguishable predictions and observed experiment results before correction.
- Root cause identifies the failing contract and runtime path; minimal fix preserves surrounding behavior.
- Regression at the CLI boundary fails before correction; identical reproduction and normal/boundary/invalid cases pass afterward.
- Unrelated dirty keep.txt remains byte-identical. Final report distinguishes actual runtime results and unrun boundaries.
- A transport success or static package check alone cannot satisfy these criteria.
