# Synthetic daily tasks and operator console

This fixture has no customer data, credentials, dependencies or external services.
Run `node server.mjs` and use the loopback URL printed on stdout. `PORT=0`
chooses an available port. State lives in this synthetic process, not a database;
it survives page reloads but intentionally ends with the process.

Pages: `/tasks.html` (daily tasks), `/topics.html` (topic selection),
`/operator.html` (operations). Shared presentation is in `styles.css`.

The signed-in synthetic account has two profiles, both called `김하늘`, with
different IDs and birth dates. Each has independent task state. The first profile
is the existing default. No real account authentication is represented here.

HTTP contract:

- `GET /api/profiles` returns the profile list.
- `GET /api/tasks?profileId=p1` returns `{ profileId, done: string[] }`.
- `POST /api/tasks` takes `{ profileId, taskId, done: boolean }` and returns the
  resulting state. `walk`, `call`, `tidy` are the only task IDs. Repeating the same
  state assignment is idempotent and grants no credits or other reward.
- `GET /api/operations` returns synthetic diagnostic state used by the operator.
- `POST /fixture/control` takes `{ delayMs, loseReply }`. This test-only control
  delays a task write (0–2000ms). When `loseReply` is true the write commits but
  returns HTTP 503. A GET can then reconcile; an error is not proof of no effect.

Use `node --test server.test.mjs` for the transport fixture's own contract.
That proves neither agent behavior nor the page's correctness.

The operator's provider name, job ID and failure status support a diagnostic
decision. Its two-step job removal confirmation is required by this fixture's
contract. The consumer's task labels and three task meanings must be preserved.
The category meanings in `topics.html` are also fixed; their presentation is not.

Local SVG illustrations are explanatory drawings, not evidence photographs.
They may be reused or replaced within a requested illustration task. Creating
them is not proof that each page consumes them correctly.
