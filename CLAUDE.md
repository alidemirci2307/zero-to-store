# CLAUDE.md — zero-to-store (maintainer guide)

> Read this at the start of every session in this repo. It explains what the
> project is, why it is built this way, how to change, test and release it,
> and where things stand right now.
> Talk to the maintainer (Ali) in **Turkish**. Write repo content (code,
> comments, docs, commits) in **English**, except the Turkish copies listed
> below.
> This file is NOT loaded for plugin users (Claude Code ignores a CLAUDE.md at
> the plugin root).

## 1. What this is
`zero-to-store` is a public Claude Code plugin + skill. It takes a mobile app
idea to the App Store and Google Play: Flutter app + React admin panel +
Supabase backend + landing page in a monorepo. It enforces a strict rule set
(architecture, i18n, store policy, ASO/SEO, push, ads/IAP, monitoring) and
ships fully automated multi-language releases. A local **Project Hub** (live
roadmap + Needs Center) shows the user everything.

- Repo: https://github.com/alidemirci2307/zero-to-store · owner `alidemirci2307` (gh CLI logged in)
- Plugin/marketplace/skill name: `zero-to-store` · command `/zero-to-store:kickoff`
- License MIT · version source of truth: `.claude-plugin/plugin.json`
- Origin: started as the Turkish personal skill `proje-kickoff`. The old copy
  still lives at `~/.claude/skills/proje-kickoff` and
  `~/.claude/commands/kickoff.md`. Not removed yet; the maintainer should
  remove it after switching to the plugin. Don't touch it unless asked.

## 2. Repo map
```
.claude-plugin/plugin.json        name, version (users update only when this changes), keywords
.claude-plugin/marketplace.json   single-repo marketplace, plugin "source": "./"
commands/kickoff.md               /zero-to-store:kickoff (routes EN/TR, passes $ARGUMENTS)
skills/zero-to-store/SKILL.md     entry point; portable frontmatter only (name, description, license, metadata)
  references/rules.md | rules.tr.md     17-section rule set, EN + TR, structurally identical
  assets/repo/                    monorepo skeleton copied into user projects (release.sh, scripts/release/, workflows, pnpm, gitignore/gitattributes without dot)
  assets/project-hub/             server.mjs + lib/{needs,plan}.mjs + public/ (vanilla JS, i18n.js EN/TR) + README.md + examples/needs/*.json
  assets/store-screenshots/       capture.sh (flutter drive) + render.mjs/frame.css (headless Chrome) + Dart templates + config
  assets/templates/               Fastfile, fastlane-store-helpers.rb, Gemfile, testers.txt, beta_review_info.json, htaccess-spa, CHANGELOG
  assets/templates/*.template.md + tr/   CLAUDE/PLAN/PHASE/TODO in EN and TR
scripts/validate.sh               all checks (run before every commit)
scripts/check-parity.mjs          EN/TR structure check (rules, templates, README)
scripts/release.sh                release THIS repo (bump, changelog, tag vX.Y.Z, push)
.github/workflows/ci.yml          validate.sh + `claude plugin validate .`
.github/workflows/release.yml     on tag v*: GitHub Release with CHANGELOG notes + skill zip
docs/images/                      README images (banner = social preview, hub screenshots, store showcase)
README.md | README.tr.md          bilingual, structurally identical (parity-checked)
install.sh                        manual install (non-plugin)
```

## 3. Key decisions (don't undo without asking)
| Decision | Why |
|---|---|
| Two full language copies (EN + TR) of rules, project templates, README. Hub UI EN/TR via i18n.js. Tool output and Claude-facing guides (hub README, store-screenshots README, scripts) are English only | Maintainer's choice. Drift is prevented by `check-parity.mjs` in CI |
| User projects are a **monorepo** with per-app SemVer, CHANGELOG and annotated tags `mobile/vX.Y.Z`, `panel/vX.Y.Z`, `web/vX.Y.Z` | Chosen over polyrepo: shared Supabase schema, one PLAN/hub/CLAUDE.md, atomic changes, clean per-app diffs |
| Tags are created only by `release.sh`, after a successful upload/build. They are immutable and pushed atomically with main | Versions = backups; `./release.sh changes <app>` diffs them |
| Every tag → GitHub Release (mobile: AAB/IPA; web/panel: dist.zip from CI) | Binary backup of what shipped |
| Web/panel deploy on **tag**, not on every main push; main push runs CI only; rollback = re-run deploy workflow with an old tag | Versioned, reversible deploys |
| Mobile: `internal` (Play internal + closed testing "testers", TestFlight external group "testers" auto-created) → `promote` (same build to production, no rebuild) → `production` only for hotfix | Build once, promote |
| Store account safety: `store-accounts` need record first. Claude stops and asks if a console shows multiple accounts (the ONE exception to "no questions between phases"). `fastlane verify_accounts` aborts release if keys belong to another account | Wrong-account publishing is irreversible |
| Secrets never asked in chat → Needs Center (`hub/needs/<id>.json` without values; values go to gitignored `hub/inbox/`, deleted after processing) | Security + UX |
| App name + package name chosen after ASO research and a uniqueness check in both stores; package = brand-consistent `com.<domain>.<brand>`, not keyword-stuffed | Package can never change; store name can |
| Store screenshots fully automated per locale (capture → framed render → fastlane folders); `fastlane check_metadata` validates limits/policy per locale before release | "Everything automatic", ASO quality |
| Tools are dependency-free (Node built-ins, bash, Ruby/fastlane); every file ≤ 300 lines | The rule set's own constraint; easy to install |
| SKILL.md frontmatter limited to spec-portable keys | Works in Claude Code, skills.sh and claude.ai uploads |
| Version only in plugin.json (+ mirrored in SKILL.md `metadata.version` + top CHANGELOG entry; validate.sh enforces equality) | Users get updates only when plugin.json version changes |

## 4. How to change things
- **Rules:** edit `rules.md` AND `rules.tr.md` in the same change. Keep the same
  `##` sections and numbered items. Append new items; don't renumber (other
  text refers to items as `Section N.M`). Same for `templates/X` ↔
  `templates/tr/X` and `README.md` ↔ `README.tr.md`.
- **Parsed formats:** the hub parser (`lib/plan.mjs`) reads PLAN.md/phase
  files in both languages:
  - table header `# | Phase|Faz | Status|Durum | …`
  - status `[ ] [~] [x] [cancelled]|[iptal]`
  - durations `2h/1h30m/45m` or `2s/1s30d/45d`
  - headings `Done Criteria|Bitti Kriterleri`, `In scope:|Yapılacak:`, `Statistics|İstatistik`, `Phase Completion Log|Faz Tamamlanma Günlüğü`

  Change templates and the parser together.
- **Hub UI strings:** add to both `en` and `tr` in `public/i18n.js`. The page
  CSP is strict (`style-src 'self'`): no inline `style=` attributes. Set
  styles via CSSOM or classes.
- **Fastlane:** `fastlane/helpers/store.rb` (template) has the pure logic.
  Fastfile lanes: `check_notes`, `check_metadata`, `verify_accounts`,
  `android|ios release`, `android|ios promote`. The Turkish words in
  PROMO_WORDS are intentional (they detect Turkish promo terms).
- Commits: Conventional Commits, English. Add user-visible changes under
  `## [Unreleased]` in CHANGELOG.md.

## 5. How to test (what was actually done — reuse these)
- **Always:** `./scripts/validate.sh` checks syntax (json/bash/js/ruby/yaml),
  SKILL frontmatter, version equality, EN/TR parity and example needs via
  `hub/server.mjs --status`.
- **Plugin install, isolated:**
  `CLAUDE_CONFIG_DIR=<tmp> claude plugin marketplace add ./ && CLAUDE_CONFIG_DIR=<tmp> claude plugin install zero-to-store@zero-to-store && CLAUDE_CONFIG_DIR=<tmp> claude plugin details zero-to-store@zero-to-store`.
  Never touch the maintainer's real config for tests.
  `claude plugin validate .` (CLI 2.1.285) validates only marketplace.json;
  validate `.claude-plugin/plugin.json` and `commands` separately.
- **Project Hub:** copy `assets/project-hub` to `<tmp>/hub`, write sample
  PLAN.md + docs/plan, copy examples to `hub/needs`, then run
  `node hub/server.mjs`. Check it in the browser pane or capture with headless
  Chrome (`--force-dark-mode --virtual-time-budget=6000`). Deep links:
  `#/plan/7`, `#/needs/<id>`, `?lang=en|tr`.
- **release.sh (user projects):** build a throwaway monorepo with a local bare
  remote whose path contains `github.com`. Put a fake `bundle` (logs args,
  creates fake AAB/IPA, `exit 0`) and a fake `gh` (logs to `$GH_LOG`) on
  PATH. Scenarios already covered: internal, promote, web minor, second
  version, `changes`, partial failure + `none` retry, rollback, dirty tree,
  non-main branch, wrong account.
- **Fastfile:** in a temp project with `fastlane/helpers/store.rb`, run
  `CI=1 FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_OPT_OUT_USAGE=1 fastlane check_metadata strict:true|false`,
  `check_notes version:x.y.z` and `fastlane lanes` (real fastlane 2.238 is
  installed).
- **Store screenshots:** render with
  `STORE_SHOTS_ROOT=<tmp> node render.mjs`, using mock raw PNGs made by
  headless Chrome. Real capture was verified once with `flutter create` +
  `capture.sh en iphone` on the "iPhone 17 Pro Max" simulator (set
  `IPHONEOS_DEPLOYMENT_TARGET=15.0` in fresh Flutter projects for current
  Xcode).
- **This repo's release:** run `scripts/release.sh` in a copy with a bare
  remote (verified: bumps plugin.json + SKILL.md + CHANGELOG, annotated tag,
  atomic push).
- **Never verified live** (no store/GitHub credentials in tests):
  - Play upload and promote, TestFlight group creation and distribution,
    `verify_accounts` against real accounts. API signatures were checked
    against the fastlane 2.238 source.
  - GitHub Actions deploy workflows in user projects.
  - This repo's `release.yml` (blocked, see §7).

## 6. Releasing this repo
```bash
# 1) changes + "## [Unreleased]" entries committed on main
./scripts/release.sh minor        # patch | minor | major
```
The script refuses unless main is clean, not behind origin, `[Unreleased]` is
not empty and validate.sh passes. It then:
1. bumps the version in plugin.json and SKILL.md,
2. turns `[Unreleased]` into the new version in CHANGELOG,
3. commits and creates the annotated tag `vX.Y.Z`,
4. pushes main + tag atomically.

`release.yml` then publishes the GitHub Release (notes + `zero-to-store-skill.zip`).
Users update with `claude plugin update zero-to-store@zero-to-store` or by
turning on auto-update.

## 7. Current status (2026-10-14) and next steps
- [x] **Public** repo with description, 15 topics and Discussions enabled.
  Commits use `Ali Demirci <alidemirci2307@gmail.com>`; this is set in the
  repo-local git config (the global config has a different address). History
  was rewritten once, before going public.
- [x] **v1.0.0 released** by `release.yml` (tag push): GitHub Release with
  CHANGELOG notes and `zero-to-store-skill.zip`. CI is green on GitHub.
  `claude plugin validate .` has one expected warning: the root CLAUDE.md is
  not loaded for users.
- [x] Verified: anonymous public install (`/plugin marketplace add
  alidemirci2307/zero-to-store`) works from a clean config.
- [x] The maintainer's own Claude Code has the plugin installed from GitHub
  (user scope). The legacy `proje-kickoff` skill and `/kickoff` command were
  deleted at the maintainer's request.
- [ ] Next versions: `./scripts/release.sh patch|minor|major` (fully automated
  now).
- [ ] Maintainer (manual, no API): upload `docs/images/banner.png` under
  Settings → General → Social preview.
- [ ] Deferred by the maintainer: dogfood the skill end to end on a small real
  app (and consider a "beta" label until then). Also from the self-review:
  split rules into on-demand sections (context cost), enforce key rules with
  lint/hooks + `claude plugin eval`, optional modules (email auth, no ads,
  other hosting), a dated "store facts" file, and revisit committing
  keystores.
- [ ] Promotion (offer to draft English posts):
  - submit to Anthropic's plugin directory
  - PRs to awesome-claude-code lists
  - r/ClaudeAI, r/FlutterDev, Show HN, X/LinkedIn demo video
- [ ] Note: GitHub's `ubuntu-latest` moves to Ubuntu 26 from 2026-10-19. If CI
  breaks after that, pin `ubuntu-24.04`.

## 8. Gotchas learned the hard way
- The Bash tool shell is **zsh**: `$args` does not word-split. Write commands
  explicitly or use arrays.
- macOS `/bin/bash` is 3.2: an empty `"${arr[@]}"` errors under `set -u`.
  Use `${arr[@]+"${arr[@]}"}`.
- `git tag -m` strips lines starting with `#` (e.g. `### Added`). Use
  `--cleanup=whitespace`.
- fastlane runs Fastfile Ruby and `sh()` in `fastlane/`, but actions from the
  project root. The templates use absolute paths from `ROOT`. If
  `localized_build_info` is given, pilot ignores `changelog`. Groups must
  exist for TestFlight distribution (`ensure_testflight_group`).
- Play promote: a second `upload_to_play_store` with `track_promote_to`,
  `version_code` and `skip_upload_aab: true`. "draft app" errors are retried
  with status draft.
- Headless Chrome (`--headless=new --screenshot=x.jpg --window-size=W,H`)
  outputs exact-size, alpha-free JPEG/PNG; no sips needed.
- Hub cards: re-appending DOM nodes restarts CSS animations (flicker). Only
  move a node when its order changed.
- The safety check blocks `rm` with unguarded variables. Use
  `rm -f "${DIR:?}/${f:?}"`.
- Subagents: always pass `model: "sonnet"` (maintainer's global rule).
