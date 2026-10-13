#!/usr/bin/env bash
# Release a new version of zero-to-store:
#   ./scripts/release.sh [patch|minor|major]      (default: patch)
# 1. checks (clean main, CHANGELOG [Unreleased] not empty, validate.sh)
# 2. bumps the version in .claude-plugin/plugin.json + SKILL.md metadata
# 3. turns [Unreleased] into [x.y.z] - date, commits, creates annotated tag vX.Y.Z
# 4. pushes main + tag atomically -> .github/workflows/release.yml publishes the GitHub
#    Release (notes from CHANGELOG + skill zip). Users get it via `claude plugin update`.
set -euo pipefail
cd "$(dirname "$0")/.."
BUMP="${1:-patch}"
die() { echo "ERROR: $*" >&2; exit 1; }

[[ "$(git rev-parse --abbrev-ref HEAD)" == "main" ]] || die "release only from main"
[[ -z "$(git status --porcelain)" ]] || die "working tree not clean"
git fetch -q origin main && git merge-base --is-ancestor origin/main HEAD || die "main is behind origin/main"
awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md | grep -qE '^\s*[-*] ' || die "CHANGELOG [Unreleased] is empty"
./scripts/validate.sh >/dev/null || die "validate.sh failed — run it to see why"

CUR=$(node -p 'require("./.claude-plugin/plugin.json").version')
IFS=. read -r a b c <<<"$CUR"
case "$BUMP" in
  major) NEW="$((a + 1)).0.0" ;; minor) NEW="$a.$((b + 1)).0" ;; patch) NEW="$a.$b.$((c + 1))" ;;
  *) die "bump: patch|minor|major" ;;
esac
git rev-parse -q --verify "refs/tags/v$NEW" >/dev/null && die "tag v$NEW already exists"
echo ">> $CUR -> $NEW"

node -e 'const fs=require("fs"),f=".claude-plugin/plugin.json",p=JSON.parse(fs.readFileSync(f));p.version=process.argv[1];fs.writeFileSync(f,JSON.stringify(p,null,2)+"\n")' "$NEW"
sed -i.bak "s/^  version: \".*\"$/  version: \"$NEW\"/" skills/zero-to-store/SKILL.md && rm skills/zero-to-store/SKILL.md.bak
NEW_NAME="$NEW" TODAY="$(date +%F)" perl -0pi -e '
  s{^## \[Unreleased\]\n(.*?)(?=^## \[|\z)}{
    my $body = $1;
    $body =~ s/^### [^\n]*\n(?=(?:[ \t]*\n)*(?:### |\z))//mg;
    "## [Unreleased]\n### Added\n### Changed\n### Fixed\n### Removed\n\n## [$ENV{NEW_NAME}] - $ENV{TODAY}\n$body"
  }mse' CHANGELOG.md
./scripts/validate.sh >/dev/null || die "validate.sh failed after bump"

git add .claude-plugin/plugin.json skills/zero-to-store/SKILL.md CHANGELOG.md
git commit -q -m "chore(release): v$NEW"
NOTES=$(bash skills/zero-to-store/assets/repo/scripts/release/changelog-section.sh CHANGELOG.md "$NEW")
git tag -a --cleanup=whitespace "v$NEW" -m "v$NEW" -m "$NOTES"
git push --atomic origin HEAD:main "refs/tags/v$NEW"
echo ">> v$NEW pushed. GitHub Release is being published: gh run watch"
