# Minimal spec behavioral rubric

Run `decided-input.txt` in a fresh supported agent session with the built skill installed. Keep raw logs locally; record a sanitized output, actual versions, invoked command, and a human-reviewed rubric. Avoid grading exact prose or heading strings.

For A02 and the bounded A17 path, all criteria must pass:

1. Skill discovery and invocation are observed, with the installed SKILL.md and bundled common contract read. Installation alone is insufficient.
2. Korean, conclusion-first response produces a usable spec without a question or repeated approval for the settled decisions.
3. All fixed decisions survive: Python standard library, add/list semantics, trim/nonempty, UTF-8 JSON/current-directory path, creation order, missing-file empty list, corrupt-file preservation, and excluded features.
4. Acceptance criteria connect input/actions to observable outcomes, including invalid input and corrupt storage; proposed details are distinguished from fixed decisions.
5. Undecided performance remains open rather than acquiring invented thresholds.
6. No implementation, file write, tracker post, network request, or deployment is performed by the evaluated agent. Reading the installed skill is allowed. Any extra read must be justified by context.
7. Completion describes document validation separately from unrun product implementation/tests.

Additional representative manual scenarios (not claimed passed by the one smoke run):

- Existing SPEC.md plus an authorized wording change: preserves unrelated decisions and edits only that scope.
- User requests a file but filesystem is read-only: returns useful spec content and states the concrete write blocker; does not claim a saved file.
- Missing material product decision: asks only the missing decision, grouping independent questions.
- User asks to publish but tracker tool is unavailable: identifies the unavailable tool and draft output; no claimed publication.

Record each as PASS / FAIL / NOTRUN with observations. Static package tests cannot replace these evaluations.
