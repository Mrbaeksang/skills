# Catalog CLI

Run `node cli.mjs list`, `node cli.mjs get a`, or `node --test` using Node 22+.
Items have IDs a/b and names Apple/Banana. Unknown IDs must exit 2 with a JSON
NOT_FOUND error on stderr and no stdout. The CLI boundary owns error conversion.
The catalog module owns lookup semantics. Changes must preserve list behavior.
