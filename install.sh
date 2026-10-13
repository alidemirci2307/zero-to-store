#!/usr/bin/env bash
# Manual install of zero-to-store (for setups without the plugin marketplace).
# Recommended instead:  /plugin marketplace add alidemirci2307/zero-to-store
#                       /plugin install zero-to-store@zero-to-store
# Usage:
#   ./install.sh            -> personal install (~/.claude) — all projects
#   ./install.sh --project  -> current project only (./.claude), shareable via git
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "${1:-}" == "--project" ]]; then TARGET="$PWD/.claude"; else TARGET="$HOME/.claude"; fi
[[ -f "$SRC/skills/zero-to-store/SKILL.md" ]] || { echo "ERROR: run install.sh from the zero-to-store repo root." >&2; exit 1; }

SKILL_DIR="$TARGET/skills/zero-to-store"
rm -rf "$SKILL_DIR"
mkdir -p "$SKILL_DIR" "$TARGET/commands"
cp -R "$SRC/skills/zero-to-store/." "$SKILL_DIR/"
cp "$SRC/commands/kickoff.md" "$TARGET/commands/kickoff.md"

echo ">> Skill   : $SKILL_DIR"
echo ">> Command : $TARGET/commands/kickoff.md  (/kickoff)"
echo ">> Version : $(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$SRC/.claude-plugin/plugin.json" | head -1)"
echo "Open a new Claude Code session and type: /kickoff <your app idea>"
