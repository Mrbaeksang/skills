# Lease fixture

A caller stores a temporary item with a two-second lease. It must exist before the
deadline and be absent afterward. Every probe uses a fresh in-memory store and a
controlled clock, never external services. Use Node 22+:

`node probe.mjs supported|legacy|override|unavailable`

`versions.json` is the supplied deployment snapshot for this fictional system.
It separates package declaration, resolved client and deployed server. Defaults
are overridden by profile settings. No real server, SDK, package install or network
is represented; do not infer production compatibility from these simulations.

Protocol contract for this fixture: server v1 accepts `leaseMs`; server v2 also
accepts `leaseSeconds`. Unknown fields are ignored, and the write can still return
ok. A disabled effective lease policy prevents expiration on either version.
The unavailable profile represents a service that cannot be queried; it is not a
successful injected-failure test of an actual remote service.

The client implementation currently uses `leaseSeconds`. The pure boundary rule
is `now >= deadline` means absent. A scheduled system clock advance represents time
passing without user action. No wall-clock sleeps are required.
