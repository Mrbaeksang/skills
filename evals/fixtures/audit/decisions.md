# D-1: Unique items

Duplicate identifiers are removed at the public entrypoint before rendering. `render` is internal and accepts already-normalized items. Do not add a second deduplication pass without a new public caller or a change to this boundary. The invariant is covered by the repeated-ID test.
