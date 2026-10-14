#!/usr/bin/env bash
# release.sh — monorepo release entry point (RULES.md Sections 12, 15, 18).
# Each app has its own version, CHANGELOG and tag (<app>/vX.Y.Z).
#   ./release.sh mobile <android|ios|all> internal [patch|minor|major|none]  # test: Play internal+closed, TestFlight
#   ./release.sh mobile <android|ios|all> promote                            # release the tested build to production
#   ./release.sh mobile <android|ios|all> production [bump]                  # direct release (hotfix)
#   ./release.sh web   [patch|minor|major]                                   # tag -> CI deploy
#   ./release.sh panel [patch|minor|major]
#   ./release.sh changes <mobile|web|panel> [old-tag] [new-tag]            # diff between releases
#   ./release.sh rollout <0.01-1>                                            # widen Play staged rollout (1 = all)
#   ./release.sh halt [current-fraction]                                     # crash spike: halt Play + pause iOS phased
#   ./release.sh resume-ios                                                  # resume iOS phased release after a fix
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DIR="$ROOT/scripts/release"
lane() { (cd "$ROOT/apps/mobile" && bundle exec fastlane "$@"); }
case "${1:-}" in
  mobile) shift; exec "$DIR/mobile.sh" "$@" ;;
  web | panel) exec "$DIR/web.sh" "$@" ;;
  changes) shift; exec "$DIR/changes.sh" "$@" ;;
  rollout) lane android rollout fraction:"${2:?fraction required, e.g. 0.5}" ;;
  halt)
    # Both stores; one failing must not skip the other
    rc=0
    lane android halt ${2:+fraction:"$2"} || rc=1
    lane ios phased action:pause || rc=1
    exit $rc ;;
  resume-ios) lane ios phased action:resume ;;
  *) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
