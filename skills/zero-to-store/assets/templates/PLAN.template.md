# PLAN — {{PROJECT_NAME}} Roadmap (INDEX)

> This file is an index (≤200 lines). Phase details live in
> `docs/plan/phase-XX-*.md` files. Finished phases are MARKED, not deleted.
> Subagent tasks are issued from the definitions in the phase files.
> Status: [ ] pending · [~] what is in progress · [x] YYYY-MM-DD · [cancelled] reason
> The Project Hub reads this file live: do NOT change the table columns;
> durations use the form `2h`, `1.5h`, `1h30m`, `45m` (h=hours, m=minutes).

## Dependency Graph
```
P01 (core) ─┬─> P02 auth ──┐
            ├─> P03 onboarding ─┼─> P06 main feature A ──> P08 integration
            ├─> P04 panel skeleton ┘
            └─> P05 landing
```
Parallel groups: G1 = {P01} · G2 = {P02, P03, P04, P05} · G3 = {P06, P07} ...

## Phase Index
| # | Phase | Status | Depends | Group | Estimate | Start | End | Duration | File |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Core infrastructure | [ ] | — | G1 | 2h | | | | [phase-01](docs/plan/phase-01-core.md) |
| 02 | Auth | [ ] | 01 | G2 | 1.5h | | | | [phase-02](docs/plan/phase-02-auth.md) |

## Statistics
- Completed: 0 / N phases (0%)
- Total elapsed time: — · Average phase duration: —
- Estimated remaining time: — (accounting for parallel groups)
- Last updated: —

## Phase Completion Log
<!-- Each line starts with "- ". Example:
- [x] P01 — 2026-09-01 10:00 → 12:10 (2h10m; subagent 1h40m, audit 30m). TODO +1, needs +0 -->
