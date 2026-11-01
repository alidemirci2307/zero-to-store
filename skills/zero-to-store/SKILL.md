---
name: zero-to-store
description: Kickoff standard that takes a mobile app idea from zero to the App Store and Google Play — Flutter app with your choice of backend (Supabase Cloud, self-hosted Supabase, Firebase or none), optional React admin panel and website, designed in Claude Design before it is coded — built in a monorepo through an adaptive kickoff interview, with strict architecture, ASO/SEO, store-policy, release-automation and session-memory rules. Use it whenever the user starts a new app or product ("new project", "kickoff", "let's build an app", "start a Flutter app", or in Turkish "yeni proje", "proje kur", "uygulama yapalım"), turns an app idea into a real project, or wants to apply this rule set / CLAUDE.md standard to an existing project.
license: MIT
metadata:
  version: "1.2.1"
  repository: "https://github.com/alidemirci2307/zero-to-store"
---

# zero-to-store

Starts a product project — Flutter mobile app plus the backend, admin panel
and web presence the user chooses — from scratch with strict rules, and sets
up a memory system that survives across sessions: CLAUDE.md, PLAN.md, TODO.md
and the live **Project Hub**.

## Language (locked for the whole project)

- Talk to the user in THEIR language in every message: questions and the
  option labels of the question tool, plans, summaries and status reports.
  These skill files, tool output and subagent reports are mostly English;
  never let that switch your language (Section 17.10).
- The language comes from the user's own words or the session's configured
  response language. If it is unclear (e.g. the command was run without any
  text), ask once in both languages.
- Turkish user or project → `references/rules.tr.md` + `assets/templates/tr/`;
  otherwise → `references/rules.md` + `assets/templates/`.
- Project docs (CLAUDE.md, docs/, PLAN, Needs Center records) are written in
  the user's language, and CLAUDE.md records "Conversation language: …" so
  later sessions keep it. `docs/RULES.md` is a verbatim copy of the chosen
  rules file.

## Single source of rules

All rules live in the chosen rules file (18 sections). The FIRST action when
this skill triggers is to read it end to end. This summary never replaces it;
if they conflict, the rules file wins. References look like "Section N.M".

## Flow (in the order of Section 17.0)

1. Read the rules file completely.
2. **Memory first.** `git init -b main`, `docs/RULES.md`, a short index
   `CLAUDE.md` (≤400 lines, from `CLAUDE.template.md`) and an empty
   `TODO.md`. Install the Project Hub: copy `assets/project-hub/` (without
   `examples/`) to `hub/`, write `hub/config.json`, start
   `node hub/server.mjs` in the background and give the user the link.
   Commit.
3. **Kickoff interview** (Sections 17.8–17.9). First extract everything the
   user already said, then ask in adaptive rounds with the question tool
   (≤4 questions per round, the best-practice option first and marked
   Recommended):
   - scope: platforms, backend (never assume Supabase), web presence,
     monetization;
   - details only for what was chosen: admin panel, hosting, region or
     server, accounts and guest mode, tablets, storage;
   - product: languages, markets and competitors, audience, push, brand;
   - design approach (Claude Design recommended), v1 scope, whether you may
     ask questions between phases, operations.

   Never ask about what the user ruled out (no website → no hosting or SEO
   questions). Never ask for keys, passwords or files in chat. Record the
   answers in `docs/PRODUCT.md` + `docs/DECISIONS.md`.
4. **Tool check for the chosen stack** (Section 17.0.1).
5. **Monorepo skeleton** (Section 15.4): copy `assets/repo/`, renaming
   `gitignore` → `.gitignore` and `gitattributes` → `.gitattributes`; keep
   only the chosen apps and their workflows (the Supabase keep-alive only for
   Supabase Cloud). Without a website, `apps/web` is the legal-only site
   (Section 6.5). Connect a private GitHub repo with the user's approval:
   `gh repo create --private --source . --push`.
6. **Research, then ONE approval round.** App name and package name after
   ASO research, with uniqueness checked in both stores (Sections 8.4,
   11.1); ASO keywords; the ad placement plan, push plan and SEO keywords
   only when relevant; detailed phases (Sections 17.3, 17.3.1, 17.11) with a
   dependency graph, PARALLEL GROUPS (Section 17.4.1) and a time estimate
   per phase. Settle every decision a phase could raise before presenting
   the plan (Section 17.11). With "no questions", the store accounts and the
   Claude Design canvas are approved in this round too, and you list what
   only the user can do before they leave (Section 17.7).
7. **Write the plan, then do it yourself first.** Write `PLAN.md` (from
   `PLAN.template.md`) and one `docs/plan/phase-XX-<slug>.md` per phase (from
   `PHASE.template.md`). Then handle the external setup yourself (Section
   16.7):
   - CLIs, MCPs and Chrome MCP in the user's signed-in browser, with ONE
     batched confirmation for anything that creates or changes something in
     their accounts.
   - Secrets never pass through the chat: downloaded key files and values
     copied with a console's Copy button go straight into `hub/inbox/`.
   - Only what Claude cannot do (sign-ins, payments, verifications…) becomes
     a `hub/needs/` record; follow `assets/project-hub/README.md` and
     `examples/needs/`. The first is always `store-accounts` (Section
     12.8), which Claude fills from the consoles when it can.

   Commit.
8. **Design** (Claude Design, Section 3.6): write `docs/design/BRIEF.md`
   from `DESIGN_BRIEF.template.md`, create the Design System and the Design
   canvas with the Artifact tool, and wait for the user's approval before
   any UI phase. Non-UI phases run in the meantime. With "no questions",
   this happens before the approval round of step 6.
9. **Build.** Run phases with Sonnet subagents. Phases in the same parallel
   group run AT THE SAME TIME; each group ends with integration + review.
   Ask between phases only if the user chose that in the interview (the
   note in CLAUDE.md says which mode applies). Otherwise never ask after
   the approval: decide what comes up yourself with best practices, never
   alone on money, legal or irreversible steps (Section 17.12), write each
   decision to `docs/DECISIONS.md` and list it in the phase summary.
   - Tick phase done criteria as work progresses (the hub shows it live).
   - After each phase: update PLAN.md, process submitted needs
     (`node hub/server.mjs --status`) and give a short status (Section
     17.3.4).
10. **Release.** Use the root `./release.sh`. Every release is an annotated
   tag `<app>/vX.Y.Z` plus a GitHub Release backup (Sections 12, 15).
11. **Operate (optional, after the first production release).** If the user
   enabled post-launch operations (Section 18), write `ops/config.json` (from
   `ops-config.json.template`) and `docs/OPS.md`, then help the user create a
   LOCAL scheduled task from `DAILY_OPS.template.md` (EN or `tr/`). The
   default autonomy is `fix-to-testing`: fixes go to the test tracks only,
   production stays staged (`./release.sh rollout`, `./release.sh halt`).

## Assets

| Path | Goes to | Purpose |
|---|---|---|
| `assets/repo/` | project root | Monorepo skeleton: `release.sh` (single entry), `scripts/release/` (mobile/web release, version diff), `.github/workflows/` (CI on changed apps, tag-triggered deploys, Supabase keep-alive), pnpm workspace, `.gitignore`/`.gitattributes` |
| `assets/project-hub/` | `hub/` | Dependency-free local web app (Node 18+). **Plan**: live roadmap from PLAN.md + phase files. **Needs Center**: step-by-step "where to find it" + submit form; values go only to `hub/inbox/` (never committed); records Claude completed itself show as done by Claude. **Operations**: SLO tiles, crash-free and rating trends, ASO ranks and daily reports from `ops/`. Guide: its `README.md` |
| `assets/store-screenshots/` | `apps/mobile/tool/store_screenshots/` | Captures raw screens per language × device in DEMO_MODE and renders modern framed store images at exact store sizes into fastlane folders (Node + Chrome) |
| `assets/templates/` (`tr/` for Turkish) | various | `CLAUDE`, `PLAN`, `PHASE`, `TODO`, `CHANGELOG` templates; `DESIGN_BRIEF` (Claude Design brief → `docs/design/BRIEF.md`); `DAILY_OPS` (post-launch routine prompt) + `ops-config.json.template` → `ops/config.json` |
| `assets/templates/Fastfile.template` + `fastlane-store-helpers.rb.template` | `apps/mobile/fastlane/` | Play internal + closed testing, TestFlight "testers" group, promote (same build to production), metadata/ASO validation for every locale, wrong-account guard |
| `assets/templates/` other | as named | `Gemfile`, `testers.txt`, `beta_review_info.json`, `htaccess-spa` |

Keep the secret names used in the workflow templates. Set the values with
`gh secret set` from files Claude prepared itself; open a Needs Center record
only for values the user must create.

## When this skill is done

The kickoff is complete when CLAUDE.md, TODO.md, hub/ and the skeleton of the
chosen apps are set up, the interview and the approval round are answered,
the phases are planned, Claude has done the external setup it can do itself
and the rest is open in the Needs Center. Later sessions run from the
project's own CLAUDE.md. Come back to the rules file only when the user wants
to change the rules themselves.
