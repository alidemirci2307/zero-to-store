# Changelog

All notable changes to zero-to-store are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).
The version in `.claude-plugin/plugin.json` is what users receive on update — `scripts/release.sh` bumps it.

## [Unreleased]
### Added
### Changed
### Fixed
### Removed

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
