# Daily operations — {{PROJECT_NAME}}

> Prompt for a LOCAL scheduled task (RULES.md Section 18), e.g. every day at
> 09:00. IDs, thresholds and the autonomy level come from `ops/config.json`;
> never hard-code them here. Write reports in {{REPORT_LANGUAGE}}.
> Subagents get `model: "sonnet"`; build, test and analyze run in the main
> session only.

## 0. Guard
1. Go to the project root and read `ops/config.json`, `docs/OPS.md`, the
   latest `docs/ops/daily/*.md` (its "Tomorrow" section) and, on Mondays,
   the latest `docs/ops/weekly-*.md`.
2. Lock: if `ops/.lock` exists and is younger than 6 hours, stop and notify
   "previous run still active". If it is older, report it as stale and
   replace it. Write the lock now and remove it at the end, also on failure.
3. If `git status --porcelain` is not empty, switch to data-and-report-only
   mode. Otherwise run `git checkout main && git pull --rebase origin main`.
4. Never close an emulator or simulator you did not start.

## 1. Collect (read-only)
- Release status of both stores (versions in review, staged rollout
  percentages, phased release state).
- Crashlytics per platform: top issues and top versions for 7 and 90 days,
  fatal, non-fatal and ANR separately; look for regressed or fresh issues.
- Play Android vitals: user-perceived crash and ANR rates for the latest
  version.
- Analytics: the funnels and errors listed in `docs/ANALYTICS.md`, last 7
  days vs the previous 7.
- Reviews and ratings from both stores; mark the ones not in yesterday's
  report as new.
- ASO ranks for the keywords and countries in `ops/config.json`.
- Use project scripts under `ops/scripts/` when present; otherwise use the
  connected MCP tools, or Chrome MCP read-only after the account check
  (Section 12.8).
- Exclude robot traffic and count human users separately. Below
  `minHumansForRatios` humans, do not interpret ratios or funnels; say so.

## 2. Crashes
- Regressions first, then new issues that affect humans.
- For each issue you look at: stack trace, custom keys and logs → root
  cause in code → affected versions and devices (robot or human).
- List existing notes, then add one note per issue per day: "Reviewed
  <date> (daily ops): <root cause> → <action>".
- If none: write "0 issues".

## 3. Decide
1. Regression in the newest version, or crash-free users below the SLO →
   if a staged rollout is running, run `./release.sh halt` now.
2. A concrete bug from reviews (1-2 stars first) → reproduce it in code.
3. A data-proven behaviour problem from analytics (humans only).
4. Yesterday's "Tomorrow" items and the next roadmap item.
5. ASO: rank drops, rating changes, review themes; at most one experiment
   per field and language group per week (Section 18.9).

Release only for a user-affecting, data-proven fix or a measurable
improvement; at most one release per day. "No release today" is a normal
outcome.

## 4. Develop (autonomy `fix-to-testing` or higher)
- Keep the day's change small; split anything above ~600 lines.
- Add a test that reproduces the bug; `flutter analyze` must report zero
  issues and `flutter test` must pass.
- Review the diff with at least two independent subagents (correctness and
  regression; platform and i18n) that try to refute it; fix what they
  confirm.
- Follow the project rules: every user-facing string in all ARB files,
  analytics only through the analytics service, no new data types.
- Anything on the hard-limit list (Section 18.8) becomes a Needs Center
  record instead.

## 5. Release
- `./release.sh mobile all internal` (CHANGELOG `[Unreleased]` and the
  release-note translations first).
- Promote only an older build that passed the soak period (`soakHours`) with
  no new crash cluster: `./release.sh mobile all promote`. Autonomy
  `fix-to-testing` lists the promotion for the user instead.
- Widen a healthy staged rollout step by step: `./release.sh rollout 0.5`,
  then `1`.
- If a step fails, retry once; then stop and put the full error in the
  report. On days without a release, push nothing that starts a store build.

## 6. Reviews
- Reply in the review's language: short, calm, thankful. Never promise
  unreleased work, never ask for personal data, never argue, reply once.
- Mention a fix only when it is live, with its version.
- 1-2 star replies are sent only at `full-auto`; otherwise draft them in the
  report for the user.
- Record every sent reply in the report.

## 7. Weekly review (Mondays)
- Use 28 days of data: this week vs last week.
- At most five actions, each with why (which number), how it is measured
  (which event) and which file.
- Check last week's actions and the running ASO experiment against its
  baseline; list missing logging.
- Write `docs/ops/weekly-YYYY-MM-DD.md`.

## 8. Report and notify
- Append one line to `ops/metrics.jsonl` (format in `hub/README.md`).
- Write `docs/ops/daily/YYYY-MM-DD.md` with these sections: Summary,
  Numbers (7 days vs previous 7), Crashes, Reviews, ASO, Development,
  Release, Needs from the user, Tomorrow. Note which mode ran (single
  agent or multi-agent).
- Open a Needs Center record for everything only the user can do.
- Send a three-line summary notification (push or the configured channel).
- Commit the report with `[ci skip]` unless today is a release day.

## 9. Finish
- Remove `ops/.lock`.
- Final message: report path, summary, what you did (notes, release,
  replies, ASO) and what the user must do.
