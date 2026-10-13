#!/usr/bin/env bash
# Local + CI checks for the zero-to-store repo. Run before every commit/release:
#   ./scripts/validate.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SKILL=skills/zero-to-store
fail=0
ok() { echo "  ✓ $*"; }
bad() { echo "  ✗ $*"; fail=1; }

echo "Syntax"
while IFS= read -r f; do python3 -m json.tool "$f" >/dev/null 2>&1 || bad "JSON $f"; done < <(find . -name "*.json" -not -path "./node_modules/*" -not -path "./.git/*")
while IFS= read -r f; do bash -n "$f" || bad "bash $f"; done < <(find . -name "*.sh" -not -path "./.git/*")
while IFS= read -r f; do node --check "$f" 2>/dev/null || bad "node $f"; done < <(find . \( -name "*.mjs" -o -name "*.js" \) -not -path "./node_modules/*" -not -path "./.git/*")
for f in "$SKILL/assets/templates/Fastfile.template" "$SKILL/assets/templates/fastlane-store-helpers.rb.template"; do
  ruby -c "$f" >/dev/null 2>&1 || bad "ruby $f"
done
while IFS= read -r f; do ruby -ryaml -e 'YAML.load_file(ARGV[0])' "$f" 2>/dev/null || bad "YAML $f"; done < <(find . \( -name "*.yml" -o -name "*.yaml" \) -not -path "./.git/*")
[[ $fail -eq 0 ]] && ok "json, bash, js, ruby, yaml"

echo "Skill"
node -e '
  const fs = require("fs");
  const s = fs.readFileSync(process.argv[1], "utf8");
  const fm = s.match(/^---\n([\s\S]*?)\n---/)[1];
  const keys = [...fm.matchAll(/^([a-z_-]+):/gm)].map((m) => m[1]);
  const allowed = ["name", "description", "license", "metadata", "compatibility", "allowed-tools"];
  const bad = keys.filter((k) => !allowed.includes(k));
  const name = fm.match(/^name: (.*)$/m)[1].trim();
  const desc = fm.match(/^description: (.*)$/m)[1].trim();
  const errs = [];
  if (bad.length) errs.push("frontmatter keys not portable: " + bad.join(", "));
  if (name !== "zero-to-store") errs.push("name must match folder");
  if (desc.length > 1024) errs.push("description > 1024 chars");
  if (s.split("\n").length > 500) errs.push("SKILL.md > 500 lines");
  if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
' "$SKILL/SKILL.md" && ok "SKILL.md frontmatter" || bad "SKILL.md"

echo "Versions"
PV=$(node -p 'require("./.claude-plugin/plugin.json").version')
SV=$(sed -n 's/^  version: "\(.*\)"$/\1/p' "$SKILL/SKILL.md")
CV=$(grep -m1 -oE '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | tr -d '#[] ')
[[ "$PV" == "$SV" && "$PV" == "$CV" ]] && ok "plugin.json = SKILL.md = CHANGELOG = $PV" || bad "versions differ: plugin.json $PV, SKILL.md $SV, CHANGELOG $CV"

echo "Language parity"
node scripts/check-parity.mjs | sed 's/^/  /' || fail=1

echo "Project Hub examples"
TMP=$(mktemp -d)
cp -R "$SKILL/assets/project-hub" "$TMP/hub"
mv "$TMP/hub/examples/needs" "$TMP/hub/needs"
if node "$TMP/hub/server.mjs" --status >"$TMP/out.txt" 2>&1; then ok "all example needs valid"; else bad "example needs"; sed 's/^/    /' "$TMP/out.txt" | grep '!' || true; fi
rm -rf "${TMP:?}"

echo
[[ $fail -eq 0 ]] && echo "All checks passed." || { echo "Checks FAILED."; exit 1; }
