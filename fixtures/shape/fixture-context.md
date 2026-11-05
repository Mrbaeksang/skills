# Existing equipment lending service (synthetic, no live service)

Decided: internal employees only, 80 users, up to 8 concurrent reservation attempts,
2 maintainers, one existing Linux VM, operations budget unchanged, no cloud migration.
Node.js 22, Express 5.1.0, PostgreSQL 17. Existing deployment has a single process.
One reservation is for one equipment item and a half-open time interval.
Confirmed reservations must never overlap for an item. Cancelled reservations free the slot.
A due date crossing marks a loan overdue; no payment, penalty or automatic employee ban.
Operators can correct a mistaken return with an audit trail. Employees see only their own
loans. One business day restore target and nightly encrypted backups are approved.
There is no measured response latency objective; leave it open rather than invent one.
Scope is design only. No actual credentials, deployment, database or tracker is attached.

## Current code excerpts, supplied fixture evidence

package.json: {"dependencies":{"express":"5.1.0","pg":"8.16.3"},"engines":{"node":">=22"}}
modules/reservations/service.js: checks for overlaps with a SELECT, then INSERTs separately.
modules/loans/service.js: owns checkedOut / returned state and dueAt timestamps.
http/error-handler.js: emits status 500 and error.message for every thrown error.

Existing terminology: Reservation is a promised future interval; Loan is actual custody.
ReservationConflict belongs to reservations. InvalidReturn belongs to loans.
The controller currently reads both modules' tables directly; boundaries need a proposal.
Review whether database constraints should enforce the race invariant. Compare keeping the
current framework/database with Fastify and a deployment-platform change only to expose
trade-offs; do not treat those alternatives as requested migrations.
