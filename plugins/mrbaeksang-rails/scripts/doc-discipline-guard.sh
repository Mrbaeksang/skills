#!/usr/bin/env bash
# doc-discipline rail (PreToolUse, Edit|Write|MultiEdit).
# Mechanism lives in code: ERD = the migration, API spec = generated OpenAPI. Block
# hand-authored mechanism-spec docs (erd.md / api.md / schema.md / endpoints.md ...).
# Decisions belong in an ADR; terms in CONTEXT.md.
# Calibrated by docs/agents/deployment-level.md: L0 off / L1 warn / L2 block. Fail-open.
set -uo pipefail

INPUT="$(cat)"
proj="${CLAUDE_PROJECT_DIR:-$PWD}"
file="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -z "$file" ] && exit 0

# Only police markdown whose basename is a mechanism spec people hand-author.
base="$(basename "$file" | tr '[:upper:]' '[:lower:]')"
case "$base" in
  erd.md|api.md|apis.md|schema.md|db-schema.md|database.md|endpoints.md|\
  data-model.md|datamodel.md|openapi.md|api-spec.md|api-reference.md) ;;
  *) exit 0 ;;
esac

# Current enforcement level (default L2).
level="L2"
lvl="$proj/docs/agents/deployment-level.md"
if [ -f "$lvl" ]; then
  m="$(grep -oiE 'mrbaeksang:current=L[0-9]' "$lvl" | grep -oiE 'L[0-9]' | head -1)"
  [ -n "$m" ] && level="$(printf '%s' "$m" | tr '[:lower:]' '[:upper:]')"
fi
[ "$level" = "L0" ] && exit 0

msg="BLOCKED by doc-discipline rail: '$base' hand-authors a mechanism spec.
Mechanism lives in CODE: ERD = the migration, API spec = generated OpenAPI (FastAPI /openapi.json).
Put decisions in docs/adr/, terms in CONTEXT.md; generate ERD/API on demand. (Level=$level)"

if [ "$level" = "L1" ]; then printf '%s\n' "$msg (warn only at L1)" >&2; exit 0; fi
printf '%s\n' "$msg" >&2
exit 2
