# CLAUDE.md — {{PROJECT_NAME}}

> This file is an INDEX (≤400 lines). It carries no detail; it points to the
> relevant docs/ file for each topic. Every session reads this file, then opens
> only the documents its task needs.

## 0. Session Start Procedure
1. Read this file.
2. Read the `PLAN.md` index; summarize for the user the finished phases, the
   next phase, and the estimated remaining time. Open only the file of the
   phase being worked on.
3. Read `TODO.md`; remind the user of pending items in priority order.
4. Start the Project Hub (`node hub/server.mjs`, in the background) and run
   `node hub/server.mjs --status`; process submitted needs following the
   `hub/README.md` flow, and summarize the pending ones with their links as
   "what I am waiting on from you".
5. Check tool status (Section 2); remind the user of anything missing.
6. Only then start the work.

## 1. Project Summary
- **Project name:** {{PROJECT_NAME}} — **What it does:** {{SHORT_DESCRIPTION}}
- **Bundle ID:** {{BUNDLE_ID}} (CANNOT BE CHANGED)
- **Languages:** {{LANGUAGES}} | Default: {{DEFAULT_LANGUAGE}}
- **Web presence:** {{WEB_PRESENCE}} — **Panel deploy:** {{TARGET}}
- **Stack:** Flutter (Riverpod, go_router) · React panel · Supabase ·
  Firebase (FCM/Crashlytics/Analytics) · AdMob · RevenueCat · R2
- **Repo:** monorepo — `apps/mobile` · `apps/panel` · `apps/web` · shared `supabase/`
  (each app has its own version/CHANGELOG/tag: `mobile/vX.Y.Z` — RULES Section 15)
- **Release:** `./release.sh mobile all internal` → after testing,
  `./release.sh mobile all promote` · `./release.sh web` · `./release.sh panel` ·
  version diff: `./release.sh changes <app>` (details: `docs/RELEASE.md`)

## 2. Tool (MCP/CLI) Status
| Tool | Status | Note |
|---|---|---|
| Supabase MCP | {{CONNECTED/MISSING}} | |
| Firebase CLI | {{CONNECTED/MISSING}} | |
| Chrome MCP | {{CONNECTED/MISSING}} | |
| RevenueCat MCP | {{CONNECTED/MISSING}} | |

## 3. RULES — STRICT
All project rules live in **`docs/RULES.md`** and are STRICT.
Read the relevant section before doing any work. Summary reminder:
- SOLID + Clean Architecture, feature-first; no file exceeds 300 lines
- All text goes through i18n (ARB); no hardcoded strings
- Every screen: loading/empty/error/offline + back button behavior
- Every feature ships with analytics events + Crashlytics breadcrumbs
- No feature is done until tested on an Android emulator + iOS simulator
- Sign-in is Google + Apple only; no email
- Ads via AdMob (not shown to premium users), IAP via RevenueCat
- Phases run via subagents (Sonnet), independent ones in PARALLEL; no questions between phases
- Everything needed from the user goes to the Needs Center (hub/needs/) — never ask for keys in chat
- Store operations only on the CORRECT account listed in docs/RELEASE.md; with multiple accounts, ASK first (Section 12.8)
- Store texts/visuals in EVERY supported language; run `fastlane check_metadata` before release
- Detailed information is written under docs/; only a reference goes here

## 4. Document Map (read for detail)
| Topic | File |
|---|---|
| Architecture, folder structure, base structures, component list | `docs/ARCHITECTURE.md` |
| DB schema (dump), RLS, indexes | `docs/DB_SCHEMA.md` |
| Auth flows, provider settings, account deletion | `docs/AUTH.md` |
| Push: payload schema, route list, device_tokens | `docs/PUSH.md` |
| Ad placement plan, ad units, RevenueCat products/entitlements | `docs/MONETIZATION.md` |
| Analytics event table, user properties | `docs/ANALYTICS.md` |
| Release process, fastlane, key paths, changelog flow, CORRECT store accounts, test links | `docs/RELEASE.md` |
| Post-launch operations: autonomy level, schedule, SLO, reports (`docs/ops/`), metrics (`ops/`) | `docs/OPS.md` |
| ASO: name/package name decision, keyword tables, store texts, visual messages, experiments | `docs/ASO.md` |
| SEO: keyword-page mapping, Lighthouse results, Search Console | `docs/SEO.md` |
| Store visuals production (capture + render) | `tool/store_screenshots/README.md` |
| Web CI/CD workflows, secret names | `docs/CICD.md` |
| Admin panel structure and managed fields | `docs/ADMIN_PANEL.md` |
| Decision log (date — decision — rationale) | `docs/DECISIONS.md` |
| Phase details | `docs/plan/phase-XX-*.md` |
| Project Hub: need record schema, processing flow, PLAN.md format | `hub/README.md` |

## 5. Working Files
- **`PLAN.md`** — phase index, statuses, durations, statistics (finished items are marked)
- **`TODO.md`** — out-of-plan/deferred work (removed when done)
- **Project Hub** — `node hub/server.mjs --open` → http://127.0.0.1:{{PORT}}
  live plan + Needs Center (keys/files/info expected from the user)
- **`CHANGELOG.md`** — released versions
