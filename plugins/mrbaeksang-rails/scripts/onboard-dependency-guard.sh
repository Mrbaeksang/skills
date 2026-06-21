#!/usr/bin/env bash
# onboard-dependency rail (PreToolUse, matcher Edit|Write|MultiEdit).
# Blocks adding a dependency to a manifest unless it has been onboarded:
# i.e. a docs/official/<dep>/ folder exists (vendored single source of truth).
#
# Calibrated by docs/agents/deployment-level.md:
#   L0 -> off (exit 0), L1 -> warn (exit 0 + stderr), L2 -> block (exit 2).
# Fail-open on any parse error so the guard never wedges a session.
set -uo pipefail

INPUT="$(cat)"
proj="${CLAUDE_PROJECT_DIR:-$PWD}"

jqr() { printf '%s' "$INPUT" | jq -r "$1" 2>/dev/null; }
file="$(jqr '.tool_input.file_path // empty')"
body="$(jqr '.tool_input.content // .tool_input.new_string // empty')"

# Only police dependency manifests.
case "$file" in
  */package.json|package.json|*/requirements*.txt|requirements*.txt|\
  */pyproject.toml|pyproject.toml|*/go.mod|go.mod|*/Cargo.toml|Cargo.toml) ;;
  *) exit 0 ;;
esac

# Deployment level (default L2 = strictest, per "production unless told otherwise").
# Enforcement tracks the CURRENT level (blocking hooks). Read ONLY the explicit marker
# `mrbaeksang:current=L<n>` — never grep the whole file, because the dial names every level.
# (TARGET level governs architectural seams/considerations, read by skills, not this hook.)
level="L2"
lvl_file="$proj/docs/agents/deployment-level.md"
if [ -f "$lvl_file" ]; then
  m="$(grep -oiE 'mrbaeksang:current=L[0-9]' "$lvl_file" | grep -oiE 'L[0-9]' | head -1)"
  [ -n "$m" ] && level="$(printf '%s' "$m" | tr '[:lower:]' '[:upper:]')"
fi
[ "$level" = "L0" ] && exit 0

# Heuristic: candidate dependency names added in this edit.
deps="$(printf '%s' "$body" \
  | grep -oiE '"[a-z0-9@/._-]+"[[:space:]]*:|^[[:space:]]*[a-z0-9@/._-]+[[:space:]]*[=><~^]' \
  | grep -oiE '[a-z0-9@][a-z0-9@/._-]+' | sort -u)"
[ -z "$deps" ] && exit 0

missing=""
while IFS= read -r d; do
  [ -z "$d" ] && continue
  base="$(printf '%s' "$d" | sed -E 's#^@[^/]+/##; s#[/@].*$##')"
  [ -d "$proj/docs/official/$base" ] && continue
  [ -d "$proj/docs/official/$d" ] && continue
  missing="$missing $base"
done <<< "$deps"

[ -z "${missing// }" ] && exit 0

msg="BLOCKED by onboard-dependency rail: new dependency(s) ->${missing}
Onboard before adding: run /onboard-dependency, then vendor official docs into docs/official/<dep>/.
(Level=$level. Lower to L0 in docs/agents/deployment-level.md to disable.)"

if [ "$level" = "L1" ]; then
  printf '%s\n' "$msg (warn only at L1)" >&2
  exit 0
fi

printf '%s\n' "$msg" >&2
exit 2
