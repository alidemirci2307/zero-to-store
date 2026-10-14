---
name: zero-to-store
description: Kickoff standard that takes a mobile app idea from zero to the App Store and Google Play — Flutter app + React admin panel + Supabase backend + landing page, built in a monorepo with strict architecture, ASO/SEO, store-policy, release-automation and session-memory rules. Use it whenever the user starts a new app or product ("new project", "kickoff", "let's build an app", "start a Flutter app", or in Turkish "yeni proje", "proje kur", "uygulama yapalım"), turns an app idea into a real project, or wants to apply this rule set / CLAUDE.md standard to an existing project.
license: MIT
metadata:
  version: "1.1.0"
  repository: "https://github.com/alidemirci2307/zero-to-store"
---

# zero-to-store

Starts a product project — Flutter mobile app, React admin panel, Supabase
backend and web presence — from scratch with strict rules, and sets up a
memory system that survives across sessions: CLAUDE.md, PLAN.md, TODO.md and
the live **Project Hub**.

## Language (pick once, at the start)

The rules exist in two synchronized copies:
- Turkish user or project → `references/rules.tr.md` + `assets/templates/tr/`
- Otherwise → `references/rules.md` + `assets/templates/`

Always talk to the user in their own language. Write the project docs in the
project language (CLAUDE.md, docs/, PLAN, Needs Center records).
`docs/RULES.md` is a verbatim copy of the chosen rules file.

## Single source of rules

All rules live in the chosen rules file (18 sections). The FIRST action when
this skill triggers is to read it end to end. This summary never replaces it;
if they conflict, the rules file wins. References look like "Section N.M".

## Flow (in the order of Section 17.0)

1. Read the rules file completely.
2. **Monorepo skeleton** (Section 15.4).
   - Run `git init -b main` and copy `assets/repo/` to the project root,
     renaming `gitignore` → `.gitignore` and `gitattributes` →
     `.gitattributes`.
   - Keep only the apps the user wants (`apps/mobile`, `apps/panel`,
     `apps/web`) and their workflows.
   - Create `docs/RULES.md`, a short index `CLAUDE.md` (≤400 lines, from
     `CLAUDE.template.md`) and an empty `TODO.md`.
   - Install the Project Hub: copy `assets/project-hub/` (without
     `examples/`) to `hub/`, write `hub/config.json`, start
     `node hub/server.mjs` in the background and give the user the link.
   - Commit, then connect a private GitHub repo with the user's approval:
     `gh repo create --private --source . --push`.
3. **Tool check**: Supabase MCP, Firebase CLI, Chrome MCP, RevenueCat MCP.
   Report what is connected and ask for what is missing (Section 17.0.1).
4. **Ask ALL kickoff questions at once** (Section 17.8).
   - Never ask for keys, passwords or files in chat; open a Needs Center
     record instead. The first record is always `store-accounts`: which Play
     and Apple account to publish from (Section 12.8).
   - App name and package name are proposed only after ASO research, with
     uniqueness checked in both stores (Sections 8.4, 11.1).
5. **Plan.** Split the project into detailed phases (Sections 17.3, 17.3.1)
   with a dependency graph and PARALLEL GROUPS (Section 17.4.1) and a time
   estimate per phase. Present the plan and get approval.
   - Write `PLAN.md` (from `PLAN.template.md`) and one
     `docs/plan/phase-XX-<slug>.md` per phase (from `PHASE.template.md`),
     then commit.
   - Open every foreseeable external need right away as a `hub/needs/`
     record linked to its phases. Follow `assets/project-hub/README.md` and
     the examples in `assets/project-hub/examples/needs/`.
6. **Build.** Run phases with Sonnet subagents. Phases in the same parallel
   group run AT THE SAME TIME; each group ends with integration + review.
   Don't ask questions between phases, go to the end (Sections 17.4–17.7).
   - Tick phase done criteria as work progresses (the hub shows it live).
   - After each phase: update PLAN.md, process submitted needs
     (`node hub/server.mjs --status`) and give a short status (Section
     17.3.4).
7. **Release.** Use the root `./release.sh`. Every release is an annotated
   tag `<app>/vX.Y.Z` plus a GitHub Release backup (Sections 12, 15).
8. **Operate (optional, after the first production release).** If the user
   enabled post-launch operations (Section 18), write `ops/config.json` (from
   `ops-config.json.template`) and `docs/OPS.md`, then help the user create a
   LOCAL scheduled task from `DAILY_OPS.template.md` (EN or `tr/`). The
   default autonomy is `fix-to-testing`: fixes go to the test tracks only,
   production stays staged (`./release.sh rollout`, `./release.sh halt`).

## Assets

| Path | Goes to | Purpose |
|---|---|---|
| `assets/repo/` | project root | Monorepo skeleton: `release.sh` (single entry), `scripts/release/` (mobile/web release, version diff), `.github/workflows/` (CI on changed apps, tag-triggered deploys, Supabase keep-alive), pnpm workspace, `.gitignore`/`.gitattributes` |
| `assets/project-hub/` | `hub/` | Dependency-free local web app (Node 18+). **Plan**: live roadmap from PLAN.md + phase files. **Needs Center**: step-by-step "where to find it" + submit form; values go only to `hub/inbox/` (never committed). **Operations**: SLO tiles, crash-free and rating trends, ASO ranks and daily reports from `ops/`. Guide: its `README.md` |
| `assets/store-screenshots/` | `apps/mobile/tool/store_screenshots/` | Captures raw screens per language × device in DEMO_MODE and renders modern framed store images at exact store sizes into fastlane folders (Node + Chrome) |
| `assets/templates/` (`tr/` for Turkish) | various | `CLAUDE`, `PLAN`, `PHASE`, `TODO`, `CHANGELOG` templates; `DAILY_OPS` (post-launch routine prompt) + `ops-config.json.template` → `ops/config.json` |
| `assets/templates/Fastfile.template` + `fastlane-store-helpers.rb.template` | `apps/mobile/fastlane/` | Play internal + closed testing, TestFlight "testers" group, promote (same build to production), metadata/ASO validation for every locale, wrong-account guard |
| `assets/templates/` other | as named | `Gemfile`, `testers.txt`, `beta_review_info.json`, `htaccess-spa` |

Keep the secret names used in the workflow templates, and remind the user to
add the values to GitHub Actions Secrets (via a Needs Center record).

## When this skill is done

The kickoff is complete when the skeleton, CLAUDE.md, TODO.md and hub/ are
set up, the questions are answered, the phases are planned and the needs are
opened. Later sessions run from the project's own CLAUDE.md. Come back to the
rules file only when the user wants to change the rules themselves.
