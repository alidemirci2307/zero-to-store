# Changelog

All notable changes to zero-to-store are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).
The version in `.claude-plugin/plugin.json` is what users receive on update — `scripts/release.sh` bumps it.

## [Unreleased]
### Added
- Kickoff question: may Claude ask questions between phases (rules Sections 17.7–17.8, EN + TR)? With "no questions", the default, CLAUDE.md and `docs/DECISIONS.md` note that all questions are asked at the start, during planning, and Claude moves every foreseeable preference decision into the approval round. With "ask at phase transitions", Claude asks in one batch after each phase or parallel group; dependent phases wait, independent ones continue.
### Changed
### Fixed
### Removed

## [1.2.0] - 2026-11-01
### Added
- Adaptive kickoff interview (rules Sections 17.8–17.9, EN + TR): decisions are asked in up to four rounds with the question tool, each option with a recommended best-practice default; answers the user already gave are never asked again, and questions made irrelevant by earlier answers are skipped (no website → no hosting or SEO questions). Answers go to `docs/PRODUCT.md` and `docs/DECISIONS.md`.
- Backend choice (Sections 1, 13.11): Supabase Cloud (default), self-hosted Supabase on your own server (with the hardening checklist: public URLs, SMTP, closed database ports, off-site backups), Firebase, no backend or your own API. Supabase is no longer assumed.
- Claude Design flow (Sections 3.5–3.11) and the `DESIGN_BRIEF` template (EN + TR): a Design System and a Design canvas created in Claude with the Artifact tool, reviewed and approved by the user before any UI is coded; quality bar for originality, rich motion, complete states, onboarding, a store-compliant paywall, ad placements and retention.
- "Claude does it first" (Section 16.7): console work through CLIs, MCPs and Chrome MCP with one batched confirmation; secrets go from downloads or the clipboard straight into `hub/inbox/`, never through the chat. The Needs Center keeps only what needs the user (sign-ins, payments, verifications).
- Project Hub: records Claude completed itself (`processedBy: "claude"`) show a "Done by Claude" badge.
- Legal-only website mode (Section 6.5): without a website, privacy, terms, support and account-deletion pages are still published, on Firebase Hosting by default.
- New rules: accessibility (4.7), platform requirements such as target API level and 16 KB pages (4.8), guest mode and Apple 5.1.1(v) (5.7), Sign in with Apple token revocation on account deletion (5.5), monetization model (8.11), children and family policies (8.12), growth experiments and retention cohorts (14.10), right-to-left languages (2.5) and a plan completeness checklist (17.11).
### Changed
- Conversation language is locked to the user's language for every message, question option and report (Section 17.10, SKILL.md, the kickoff command) and recorded in CLAUDE.md.
- Kickoff order: the interview now comes before the monorepo skeleton, so only the chosen apps are created, and the tool check covers the chosen stack.
- The admin panel is a kickoff decision (recommended with a backend) instead of always required; web and panel hosting can be Hostinger, Firebase Hosting, Cloudflare Pages or your own server.
- Firebase Analytics and Crashlytics are set up by Claude itself with the Firebase and FlutterFire CLIs in the base phase, including symbol upload, whatever backend is chosen.

## [1.1.0] - 2026-10-14
### Added
- Post-launch operations (rules Section 18, EN + TR): optional daily routine with three autonomy levels (`observe`, `fix-to-testing` default, `full-auto`), release gates (test tracks first, soak period, staged rollout, automatic halt on crash spikes), crash SLO, review and ASO-experiment discipline, hard limits, lock file and daily/weekly reports.
- `DAILY_OPS.template.md` (EN + TR) routine prompt and `ops-config.json.template`, so project IDs and thresholds live in `ops/config.json` instead of the prompt.
- Project Hub **Operations** tab: crash-free users against the SLO, store ratings, open crash issues, latest release, crash-free and rating trend charts, ASO rank table and daily/weekly reports.
- Rollout control: `./release.sh rollout <fraction>`, `./release.sh halt` (halts Play and pauses the iOS phased release), `./release.sh resume-ios`; App Store releases now use the 7-day phased release.

## [1.0.0] - 2026-10-13
### Added
- Kickoff skill with 17-section rule set in English and Turkish (kept in sync by a CI parity check).
- Monorepo skeleton (`apps/mobile`, `apps/panel`, `apps/web`, shared `supabase/`) with per-app SemVer, CHANGELOG and annotated tags (`mobile/v1.2.0`), GitHub Release backups and `./release.sh changes` version diffs.
- Fully automated mobile releases: Play internal + closed testing, TestFlight "testers" group, build-once-promote to production, metadata/ASO validation for every locale, wrong-store-account guard.
- Tag-triggered web/admin deploys (Hostinger FTPS, Firebase Hosting) with rollback by tag.
- Project Hub: live local roadmap from PLAN.md and the Needs Center (step-by-step instructions + secure local submission), EN/TR UI.
- Store screenshot pipeline: Flutter integration-test capture per locale × device and modern framed renders at exact store sizes.
