#!/usr/bin/env bash
# scripts/release/web.sh — ./release.sh <web|panel> [patch|minor|major]
# Local build check -> package.json version + CHANGELOG -> commit -> tag <app>/vX.Y.Z -> push.
# The deploy and the GitHub Release (dist.zip backup) are done by the CI that picks up the tag
# (.github/workflows/deploy-<app>-*.yml). Rollback: run the workflow manually with an older tag.
set -euo pipefail
source "$(dirname "$0")/common.sh"
APP="${1:?Usage: ./release.sh <web|panel> [patch|minor|major]}"
BUMP="${2:-patch}"
DIR="$ROOT/apps/$APP"
[[ -f "$DIR/package.json" ]] || die "apps/$APP/package.json not found"
[[ "$BUMP" == "none" ]] && die "no 'none' for web/panel; to redeploy the same version, run the workflow with the tag"
command -v pnpm >/dev/null || die "pnpm not found (corepack enable)"
require_clean_main

CURRENT=$(node -p "require('$DIR/package.json').version")
NEW=$(bump_semver "$CURRENT" "$BUMP")
TAG="$APP/v$NEW"
[[ -n "$(unreleased_items "$DIR/CHANGELOG.md")" ]] || die "apps/$APP/CHANGELOG.md [Unreleased] is empty — nothing to release"
tag_exists "$TAG" && die "$TAG already exists"

info "$APP $CURRENT -> $NEW: build check"
(cd "$ROOT" && pnpm --filter "./apps/$APP" build) || die "build failed — version and tag were not created"

node -e '
  const fs = require("fs"); const f = process.argv[1];
  const pkg = JSON.parse(fs.readFileSync(f, "utf8")); pkg.version = process.argv[2];
  fs.writeFileSync(f, JSON.stringify(pkg, null, 2) + "\n");' "$DIR/package.json" "$NEW"
changelog_release "$DIR/CHANGELOG.md" "$NEW"
git -C "$ROOT" add "$DIR/package.json" "$DIR/CHANGELOG.md"
git -C "$ROOT" commit -q -m "chore(release): $APP v$NEW"
create_tag "$TAG" "$DIR/CHANGELOG.md" "$NEW"
push_release "$TAG"
if has_origin; then
  info "CI picked up the tag: deploy + GitHub Release. Watch: gh run watch  (or the Actions tab)"
else
  info "WARNING: no origin — deploy was not triggered."
fi
info "Release diff: ./release.sh changes $APP"
