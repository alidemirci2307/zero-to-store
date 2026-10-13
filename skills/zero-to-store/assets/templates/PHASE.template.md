# Phase {{NO}}: {{PHASE_NAME}}

> Status: [ ] · Depends: {{DEPENDS_ON}} · Blocks: {{BLOCKS}} ·
> Parallel group: {{GROUP}} · Estimate: {{ESTIMATE}} · Actual: —

## Goal and Scope
- In scope: ...
- Out of scope: ...

## Files / Folder Structure
- This phase works ONLY in these folders: `apps/mobile/lib/features/xxx/`, `apps/panel/src/features/xxx/`, ...
- Commit scope: `feat(mobile)`, `feat(panel)`, `feat(web)`, `feat(supabase)` — separate commit per app
- Need to touch shared files (router/DI/ARB/migration): ... —
  the main session merges them in the integration step.

## Base Structures, Components, Packages
- ...

## DB / API / Channels
- ...

## Cross-Cutting Concerns (RULES.md Section 17.3.1 — fill in all, write "none" if not applicable)
- **Analytics events:** event_name(parameters) — when
- **Crashlytics:** breadcrumb/non-fatal points
- **i18n:** text keys + languages
- **Back button:** per screen
- **Loading/empty/error/offline:** per screen
- **Ads:** format + placement + premium exemption / none
- **Notifications:** payload route + tap target / none
- **RLS/security:** affected tables / none
- **Admin panel sync:** required panel screen / none
- **Needed from the user:** Needs Center record ids (this phase in the `phases` field) / none
- **Docs update:** docs/ files to update at the end of the phase

## Done Criteria
<!-- Tick as the work progresses: the Project Hub shows progress live from these boxes. -->
- [ ] ...
- [ ] Verified on an Android emulator + iOS simulator
- [ ] Main session audit passed (rules + cross-cutting concerns present in code)
- [ ] Relevant docs/ files updated, PLAN.md index marked

## Dependencies
- Coming from previous phases: ...
- Handed over to the next phase: ...
