# Local delivery fixture

Run `node probe.mjs happy|duplicate|partial|cancel|dependency`. Every probe uses
fresh in-memory state and prints the resulting state; no network or credentials.
Accepted events must cause one credit per event ID, including replay after a
failure following the credit. Cancellation and unavailable dependency must have
no credit effect. This is a small state/recovery fixture, not evidence of real
network delivery or concurrent database isolation.
