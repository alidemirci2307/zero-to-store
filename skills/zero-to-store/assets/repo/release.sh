#!/usr/bin/env bash
# release.sh — monorepo release entry point (RULES.md Section 12, 15).
# Each app has its own version, CHANGELOG and tag (<app>/vX.Y.Z).
#   ./release.sh mobile <android|ios|all> internal [patch|minor|major|none]  # test: Play internal+closed, TestFlight
#   ./release.sh mobile <android|ios|all> promote                            # release the tested build to production
#   ./release.sh mobile <android|ios|all> production [bump]                  # direct release (hotfix)
#   ./release.sh web   [patch|minor|major]                                   # tag -> CI deploy
#   ./release.sh panel [patch|minor|major]
#   ./release.sh changes <mobile|web|panel> [old-tag] [new-tag]            # diff between releases
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)/scripts/release"
case "${1:-}" in
  mobile) shift; exec "$DIR/mobile.sh" "$@" ;;
  web | panel) exec "$DIR/web.sh" "$@" ;;
  changes) shift; exec "$DIR/changes.sh" "$@" ;;
  *) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
