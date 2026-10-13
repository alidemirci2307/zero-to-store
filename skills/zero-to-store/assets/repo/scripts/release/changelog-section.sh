#!/usr/bin/env bash
# scripts/release/changelog-section.sh <CHANGELOG.md> <version>
# Prints that version's notes (without the heading line). The tag message, GitHub Release
# and CI use this output — CHANGELOG is the single source of release notes.
set -euo pipefail
[[ $# -eq 2 ]] || { echo "Usage: $0 <CHANGELOG.md> <version>" >&2; exit 1; }
out=$(awk -v v="$2" 'index($0, "## [" v "]") == 1 { f = 1; next } /^## \[/ { if (f) exit } f' "$1" | sed '/./,$!d')
[[ -n "$out" ]] || { echo "ERROR: no [$2] section in $1, or it is empty" >&2; exit 1; }
printf '%s\n' "$out"
