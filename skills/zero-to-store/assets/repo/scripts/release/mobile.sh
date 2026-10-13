#!/usr/bin/env bash
# scripts/release/mobile.sh — ./release.sh mobile <android|ios|all> <internal|promote|production> [bump]
#   internal   -> build; Play internal + closed testing "testers", TestFlight + "testers" group
#                 tag mobile/vX.Y.Z + GitHub pre-release (AAB/IPA backup)
#   promote    -> promotes the SAME tested build to production (no rebuild/bump)
#                 GitHub Release becomes "latest"
#   production -> build and go straight to production (hotfix) + tag + GitHub Release
# bump: patch (default) | minor | major | none (retry a half-finished release with the same version)
# On error: if no platform was uploaded, pubspec/CHANGELOG are rolled back; on partial success the
# version is committed + tagged and the retry command is printed.
set -euo pipefail
source "$(dirname "$0")/common.sh"
APP_DIR="$ROOT/apps/mobile"
cd "$APP_DIR"

PLATFORM="${1:?Usage: ./release.sh mobile <android|ios|all> <internal|promote|production> [patch|minor|major|none]}"
TRACK="${2:?track required: internal|promote|production}"
BUMP="${3:-patch}"
case "$PLATFORM" in android) LANES=(android) ;; ios) LANES=(ios) ;; all) LANES=(android ios) ;;
  *) die "platform: android|ios|all" ;; esac
case "$TRACK" in internal | promote | production) ;; *) die "track: internal|promote|production" ;; esac

CURRENT=$(grep -E '^version:' pubspec.yaml | sed 's/version: //')
NAME="${CURRENT%%+*}"
CODE="${CURRENT##*+}"
command -v bundle >/dev/null || die "bundler not found (gem install bundler)"
require_clean_main

if [[ "$TRACK" == "promote" ]]; then
  BUMP=none
  tag_exists "mobile/v$NAME" || die "mobile/v$NAME does not exist — cut an internal release first, test it, then promote"
fi
NEW_NAME=$(bump_semver "$NAME" "$BUMP")
TAG="mobile/v$NEW_NAME"

# --- Pre-checks (no files changed yet) ---
if [[ "$BUMP" == "none" ]]; then
  NEW_CODE="$CODE"
  grep -q "^## \[$NEW_NAME\]" CHANGELOG.md || die "CHANGELOG has no [$NEW_NAME]; 'none' is only for already released versions"
else
  NEW_CODE=$((CODE + 1))
  [[ -n "$(unreleased_items CHANGELOG.md)" ]] || die "CHANGELOG [Unreleased] is empty — nothing to release"
  tag_exists "$TAG" && die "$TAG already exists — check the bump type"
  bundle exec fastlane check_notes version:"$NEW_NAME"
fi
STRICT=false
[[ "$TRACK" != "internal" ]] && STRICT=true
bundle exec fastlane check_metadata strict:"$STRICT"
bundle exec fastlane verify_accounts platform:"$PLATFORM" # is it the CORRECT account? (Section 12.8)

info "$CURRENT -> $NEW_NAME+$NEW_CODE ($PLATFORM/$TRACK)"

UPLOADED=()
rollback() {
  if [[ "$BUMP" != "none" && ${#UPLOADED[@]} -eq 0 ]]; then
    git checkout -- pubspec.yaml CHANGELOG.md
    rm -f fastlane/metadata/android/*/changelogs/"$NEW_CODE".txt
    info "No platform was uploaded; pubspec.yaml and CHANGELOG.md were rolled back."
  fi
}
if [[ "$BUMP" != "none" ]]; then
  trap 'rollback' ERR
  sed -i.bak "s/^version: .*/version: $NEW_NAME+$NEW_CODE/" pubspec.yaml && rm pubspec.yaml.bak
  changelog_release CHANGELOG.md "$NEW_NAME"
fi

LANE=release
[[ "$TRACK" == "promote" ]] && LANE=promote
FAILED=()
for lane in "${LANES[@]}"; do
  if bundle exec fastlane "$lane" "$LANE" track:"$TRACK" version:"$NEW_NAME"; then UPLOADED+=("$lane"); else FAILED+=("$lane"); fi
done
trap - ERR
if [[ ${#UPLOADED[@]} -eq 0 ]]; then
  rollback
  die "Release FAILED (${FAILED[*]})"
fi

if [[ "$TRACK" == "promote" ]]; then
  # Same build is now in production: GitHub Release is no longer a pre-release, it is "latest"
  if gh_ready; then
    gh release edit "$TAG" --prerelease=false --latest >/dev/null && info "GitHub Release $TAG -> latest" ||
      info "WARNING: could not update GitHub Release: $TAG"
  fi
else
  git add pubspec.yaml CHANGELOG.md
  for p in fastlane/metadata fastlane/release_notes; do [[ -e "$p" ]] && git add "$p"; done
  git diff --cached --quiet || git commit -q -m "chore(release): mobile v$NEW_NAME ($(IFS=,; echo "${UPLOADED[*]}")/$TRACK)"
  create_tag "$TAG" CHANGELOG.md "$NEW_NAME"
  push_release "$TAG"
  PRE=true
  [[ "$TRACK" == "production" ]] && PRE=false
  # Only builds of the platforms uploaded in THIS release are attached as backup
  ASSETS=()
  [[ " ${UPLOADED[*]} " == *" android "* ]] && ASSETS+=("$APP_DIR/build/app/outputs/bundle/release/app-release.aab")
  [[ " ${UPLOADED[*]} " == *" ios "* ]] && ASSETS+=("$APP_DIR/build/ios/ipa/Runner.ipa")
  github_release "$TAG" "Mobile v$NEW_NAME" "$APP_DIR/CHANGELOG.md" "$NEW_NAME" "$PRE" ${ASSETS[@]+"${ASSETS[@]}"}
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
  info "PARTIAL: succeeded=${UPLOADED[*]} · failed=${FAILED[*]}"
  for lane in "${FAILED[@]}"; do info "Retry: ./release.sh mobile $lane $TRACK none"; done
  exit 1
fi
info "Done: $TAG ($TRACK). Release diff: ./release.sh changes mobile"
