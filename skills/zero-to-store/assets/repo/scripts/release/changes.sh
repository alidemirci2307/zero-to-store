#!/usr/bin/env bash
# scripts/release/changes.sh <mobile|web|panel> [old-tag] [new-tag]
# Commits, file summary and CHANGELOG notes between two releases. Default: the last two tags.
#   ./release.sh changes mobile                          # last two mobile releases
#   ./release.sh changes web web/v1.0.0 web/v1.3.0       # specific range
#   ./release.sh changes mobile mobile/v1.2.0 HEAD       # changes since the latest release
set -euo pipefail
source "$(dirname "$0")/common.sh"
APP="${1:?Usage: ./release.sh changes <mobile|web|panel> [old-tag] [new-tag]}"
case "$APP" in
  mobile) PATHS=(apps/mobile supabase) ;;
  panel) PATHS=(apps/panel packages supabase) ;;
  web) PATHS=(apps/web packages) ;;
  *) die "app: mobile|web|panel" ;;
esac
TAGS=()
while IFS= read -r t; do TAGS+=("$t"); done < <(git -C "$ROOT" tag --list "$APP/v*" --sort=-v:refname)
[[ ${#TAGS[@]} -gt 0 || $# -ge 3 ]] || die "no tags yet for $APP"
TO="${3:-${TAGS[0]}}"
FROM="${2:-${TAGS[1]:-$(git -C "$ROOT" rev-list --max-parents=0 HEAD | tail -1)}}"

cd "$ROOT"
echo "== $APP: $FROM -> $TO  (${PATHS[*]})"
echo
git log --no-merges --format='  %h %ad %s' --date=short "$FROM..$TO" -- "${PATHS[@]}"
echo
git diff --stat=100 "$FROM" "$TO" -- "${PATHS[@]}" | tail -1
if [[ "$TO" == "$APP/v"* ]]; then
  version="${TO#"$APP"/v}"
  echo
  echo "== CHANGELOG [$version]"
  "$SCRIPTS/changelog-section.sh" "apps/$APP/CHANGELOG.md" "$version" | sed 's/^/  /' || true
fi
echo
echo "Detailed diff: git diff $FROM $TO -- ${PATHS[*]}"
