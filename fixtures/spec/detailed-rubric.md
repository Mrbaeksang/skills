# Spec behavioral rubric

Evaluate actual output and tool trace; matching these words is not sufficient evidence.

## detailed-input.txt — A02, A05

- Already decided behavior is preserved without interviewing or invoking shape. Actors and permissions distinguish member ownership from administrator cancellation.
- Normal, overlap, forbidden, missing, storage-failure and retry flows state observable results and preserved data. State transitions and overlap invariant are explicit.
- Domain owns error meaning; central handler maps public code/message/trace_id, hides internals and logs once. Storage adapter responsibility does not move domain policy to the handler.
- Atomic idempotency mapping and reservation commit, same/different payload behavior, and cancellation no-op remain fixed requirements.
- Requirements map to identifiable acceptance criteria. Paths and identifier format are proposals; performance SLO/retention remain undecided. Existing Python/SQLite choices and exclusions remain intact.
- Actual product/API execution is NOTRUN. A detailed reply is allowed because this fixture explicitly requests the artifact in chat.

## ambiguous-input.txt — A19

- A returns existing #31, no create/update on repeated input.
- B remains uncertain. Even repeated complete zero-result reads or elapsed time cannot justify a new create without independent evidence that the original will not apply, or atomic idempotency protection.
- C/D/E stop additional writes, preserve remote state, and identify the precise reconciliation/permission/conflict gate.
- All five cases produce zero additional writes. Fixture observations are not presented as real tracker reads.

## Live authorized test tracker

Use only the explicitly authorized temporary test issue. Identify it clearly as test material, reuse a stable marker, enumerate open/closed issues with complete pagination, and compare exact readback body/title. Repeat lookup without writing to establish sequential no-op behavior. Close only this test issue after evidence collection. Never mutate implementation tickets to make a smoke test pass.

This workflow cannot prove race-safe exactly-once creation. Record platform/model/tool version, installed skill discovery and references read, observed output, any permission denials, and unrun boundaries separately.
