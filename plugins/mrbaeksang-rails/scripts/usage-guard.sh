#!/usr/bin/env bash
# usage-guard: GENERIC, data-driven dependency-usage guard. Never edited per project.
# Reads project rules from .claude/usage-rules.tsv (fed by /onboard-dependency); the hook
# code is fixed. Each rule line is TAB-separated:
#   exts <TAB> severity <TAB> regex <TAB> message <TAB> unless(optional)
#     exts     : comma-separated extensions, no dot (e.g. "py" or "ts,tsx,js,jsx" or "sql")
#     severity : block | warn
#     regex    : ERE matched against the changed file content (grep -E)
#     message  : the fix shown to the agent
#     unless   : optional ERE; if the content also matches this, the rule is skipped (exemption)
# Lines starting with # and blank lines are ignored. Level: L0 off / L1 warn-all / L2 block.
set -uo pipefail

INPUT="$(cat)"
proj="${CLAUDE_PROJECT_DIR:-$PWD}"
file="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
body="$(printf '%s' "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty' 2>/dev/null)"
[ -z "$file" ] && exit 0
[ -z "$body" ] && exit 0

rules="$proj/.claude/usage-rules.tsv"
[ -f "$rules" ] || exit 0
ext="${file##*.}"

block=""; warn=""
while IFS=$'\t' read -r exts sev regex msg unless || [ -n "$exts" ]; do
  case "$exts" in ''|'#'*) continue ;; esac
  case ",$exts," in *",$ext,"*) ;; *) continue ;; esac
  [ -n "$regex" ] || continue
  printf '%s' "$body" | grep -qE "$regex" || continue
  if [ -n "${unless:-}" ] && printf '%s' "$body" | grep -qE "$unless"; then continue; fi
  if [ "$sev" = "block" ]; then block="$block
  - $msg"; else warn="$warn
  - $msg"; fi
done < "$rules"

[ -z "${block// }" ] && [ -z "${warn// }" ] && exit 0

level="L2"; lvl="$proj/docs/agents/deployment-level.md"
if [ -f "$lvl" ]; then
  m="$(grep -oiE 'mrbaeksang:current=L[0-9]' "$lvl" | grep -oiE 'L[0-9]' | head -1)"
  [ -n "$m" ] && level="$(printf '%s' "$m" | tr '[:lower:]' '[:upper:]')"
fi
[ "$level" = "L0" ] && exit 0

out="usage-guard: deviates from agreed official usage (docs/official/<dep>/CONSIDERATIONS.md)"
[ -n "${block// }" ] && out="$out
BLOCK:$block"
[ -n "${warn// }" ] && out="$out
WARN:$warn"
out="$out
(Level=$level)"

if [ "$level" = "L1" ]; then printf '%s\n' "$out (warn only at L1)" >&2; exit 0; fi
if [ -n "${block// }" ]; then printf '%s\n' "$out" >&2; exit 2; fi
printf '%s\n' "$out" >&2
exit 0
