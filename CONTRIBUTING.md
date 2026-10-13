# Contributing to zero-to-store

Thanks for helping! zero-to-store is a set of rules plus small, dependency-free tools.
Changes are easy to make — and easy to break — so please follow the checks below.

## Repo layout

```
.claude-plugin/            plugin.json (version!) + marketplace.json
commands/kickoff.md        /zero-to-store:kickoff
skills/zero-to-store/
  SKILL.md                 entry point Claude reads first
  references/rules.md      the rules (English)   ─┐ must stay structurally identical
  references/rules.tr.md   the rules (Turkish)   ─┘ (scripts/check-parity.mjs)
  assets/repo/             monorepo skeleton copied into new projects
  assets/project-hub/      local Project Hub (Node, no deps) + example need records
  assets/store-screenshots/  capture + render pipeline for store images
  assets/templates/        project templates (EN) and templates/tr/ (TR)
scripts/                   validate.sh, check-parity.mjs, release.sh
docs/images/               README images
```

## Before you open a PR

```bash
./scripts/validate.sh
```

It checks JSON/bash/JS/Ruby/YAML syntax, SKILL.md frontmatter, that the version is the
same in `plugin.json`, `SKILL.md` and `CHANGELOG.md`, EN/TR parity and the example need
records.

- **Rules and templates are bilingual.** Change `rules.md` *and* `rules.tr.md` (and
  `templates/X` *and* `templates/tr/X`) in the same PR. Keep the same sections and numbered
  items; the parity check fails otherwise. If you can't write one language, open the PR
  anyway and say so — a maintainer will add it.
- **References** use `Section N.M`. Renumbering items breaks references; prefer
  appending new items.
- **Tools stay dependency-free** (Node built-ins, bash, Ruby/fastlane). Keep every file
  under 300 lines (the rule set's own limit).
- **Test tool changes in a sample project.** Examples: run the Project Hub against a
  sample `PLAN.md`, run `release.sh` against a throwaway git repo with a fake `bundle`/`gh`
  on `PATH`, render store screenshots with `--lang en`.
- **Never commit secrets**, real account IDs or personal data in examples.
- Add a line under `## [Unreleased]` in `CHANGELOG.md` for anything users will notice.
- Commits follow Conventional Commits in English (`feat(hub): …`, `fix(release): …`,
  `docs(rules): …`).

## Releasing (maintainers)

```bash
./scripts/release.sh minor   # patch | minor | major
```

The script validates, bumps the version, turns `[Unreleased]` into the new version,
tags `vX.Y.Z` and pushes. `.github/workflows/release.yml` then publishes the GitHub
Release (notes + skill zip). Users get the update with
`claude plugin update zero-to-store@zero-to-store` (or auto-update).
