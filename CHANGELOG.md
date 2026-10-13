# Changelog

All notable changes to zero-to-store are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).
The version in `.claude-plugin/plugin.json` is what users receive on update — `scripts/release.sh` bumps it.

## [Unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0] - 2026-10-13
### Added
- Kickoff skill with 17-section rule set in English and Turkish (kept in sync by a CI parity check).
- Monorepo skeleton (`apps/mobile`, `apps/panel`, `apps/web`, shared `supabase/`) with per-app SemVer, CHANGELOG and annotated tags (`mobile/v1.2.0`), GitHub Release backups and `./release.sh changes` version diffs.
- Fully automated mobile releases: Play internal + closed testing, TestFlight "testers" group, build-once-promote to production, metadata/ASO validation for every locale, wrong-store-account guard.
- Tag-triggered web/admin deploys (Hostinger FTPS, Firebase Hosting) with rollback by tag.
- Project Hub: live local roadmap from PLAN.md and the Needs Center (step-by-step instructions + secure local submission), EN/TR UI.
- Store screenshot pipeline: Flutter integration-test capture per locale × device and modern framed renders at exact store sizes.
