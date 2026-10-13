# scripts/release/common.sh — shared functions for the release scripts (sourced)
# Versioning (RULES.md Section 15): each app has its own SemVer, CHANGELOG and
# annotated tag: <app>/vX.Y.Z. Tags are NEVER moved or deleted.
ROOT="$(git rev-parse --show-toplevel)"
SCRIPTS="$ROOT/scripts/release"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo ">> $*"; }
has_origin() { git -C "$ROOT" remote get-url origin >/dev/null 2>&1; }
# GitHub Release is only created if origin is on GitHub and a gh session is open
gh_ready() {
  has_origin && git -C "$ROOT" remote get-url origin | grep -q "github.com" &&
    command -v gh >/dev/null && gh auth status >/dev/null 2>&1
}
tag_exists() { git -C "$ROOT" rev-parse -q --verify "refs/tags/$1" >/dev/null; }

# bump_semver 1.2.3 <patch|minor|major|none>
bump_semver() {
  local a b c
  IFS=. read -r a b c <<<"$1"
  case "$2" in
    major) echo "$((a + 1)).0.0" ;;
    minor) echo "$a.$((b + 1)).0" ;;
    patch) echo "$a.$b.$((c + 1))" ;;
    none) echo "$1" ;;
    *) die "bump: patch|minor|major|none" ;;
  esac
}

# Releases are only cut from main, with a clean working tree and a HEAD that contains origin/main
require_clean_main() {
  local branch
  branch=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)
  [[ "$branch" == "main" ]] || die "releases can only be cut from main (currently on: $branch)"
  [[ -z "$(git -C "$ROOT" status --porcelain)" ]] || die "uncommitted changes found; commit them first"
  if has_origin; then
    git -C "$ROOT" fetch -q origin main 2>/dev/null || die "cannot reach origin"
    git -C "$ROOT" merge-base --is-ancestor origin/main HEAD || die "main is behind origin/main: run git pull --rebase first"
  fi
}

# Items under CHANGELOG [Unreleased] (### headings do not count)
unreleased_items() { awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' "$1" | grep -E '^\s*[-*] ' || true; }

# [Unreleased] -> [version] - date (empty ### headings are dropped), new empty [Unreleased] on top
changelog_release() {
  NEW_NAME="$2" TODAY="$(date +%F)" perl -0pi -e '
    s{^## \[Unreleased\]\n(.*?)(?=^## \[|\z)}{
      my $body = $1;
      $body =~ s/^### [^\n]*\n(?=(?:[ \t]*\n)*(?:### |\z))//mg;
      "## [Unreleased]\n### Added\n### Changed\n### Fixed\n### Removed\n\n## [$ENV{NEW_NAME}] - $ENV{TODAY}\n$body"
    }mse' "$1"
}

# Annotated tag; message = CHANGELOG section (git show <tag> displays the notes)
create_tag() {
  local tag=$1 changelog=$2 version=$3
  if tag_exists "$tag"; then info "tag already exists: $tag"; return 0; fi
  # --cleanup=whitespace: keep lines like "### Added" from being treated as comments and stripped
  git -C "$ROOT" tag -a --cleanup=whitespace "$tag" -m "$tag" -m "$("$SCRIPTS/changelog-section.sh" "$changelog" "$version")"
  info "tag: $tag"
}

# main + tag in a single atomic push (backup + CI trigger). Warns if there is no origin.
push_release() {
  local tag=$1
  if ! has_origin; then
    info "WARNING: no origin — $tag exists only locally. Once the repo is connected: git push --atomic origin main $tag"
    return 0
  fi
  git -C "$ROOT" push --atomic origin HEAD:main "refs/tags/$tag" || die "push failed — run manually: git push --atomic origin main $tag"
  info "push: main + $tag"
}

# Create/update a GitHub Release + attach files (backup). Warns and skips if gh is unavailable.
# github_release <tag> <title> <changelog> <version> <prerelease:true|false> [file...]
github_release() {
  local tag=$1 title=$2 changelog=$3 version=$4 pre=$5
  shift 5
  local assets=() f
  for f in "$@"; do [[ -f "$f" ]] && assets+=("$f"); done
  if ! gh_ready; then
    info "WARNING: GitHub Release skipped (origin is not GitHub or no gh session): $tag"
    return 0
  fi
  local notes
  notes=$(mktemp)
  "$SCRIPTS/changelog-section.sh" "$changelog" "$version" >"$notes"
  if gh release view "$tag" >/dev/null 2>&1; then
    [[ ${#assets[@]} -gt 0 ]] && { gh release upload "$tag" "${assets[@]}" --clobber || info "WARNING: could not upload files"; }
  else
    local flags=(--title "$title" --notes-file "$notes" --verify-tag)
    [[ "$pre" == "true" ]] && flags+=(--prerelease) || flags+=(--latest)
    # If the release is not created, tag/push are already done; warn and continue (manually: gh release create)
    gh release create "$tag" "${flags[@]}" ${assets[@]+"${assets[@]}"} || info "WARNING: could not create GitHub Release: $tag"
  fi
  rm -f "$notes"
  info "GitHub Release: $tag (${#assets[@]} files)"
}
