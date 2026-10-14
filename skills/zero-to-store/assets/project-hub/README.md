# Project Hub (hub/) — usage guide for Claude

A local page the user opens in the browser. It has three screens:
- **Plan:** a live roadmap built from `PLAN.md` and `docs/plan/phase-XX-*.md`
- **Needs:** the keys, files and information Claude is waiting for from the user. Each
  need record has a step-by-step "where to find it" walkthrough and a submission form.
- **Operations:** after launch, what the daily routine saw and did (RULES.md Section 18):
  crash-free users against the SLO, store ratings, ASO ranks and the daily/weekly reports.

The user fills in the form and submits it. Values are written only under `hub/inbox/`,
and Claude processes them from there. Rules: RULES.md Section 16.6.

Need records are written in the user's language (the hub UI itself switches EN/TR
automatically).

## Running it
```bash
node hub/server.mjs --open    # start the server + open the browser (if already running, just opens it)
node hub/server.mjs --status  # plan + needs summary, record validation (Claude reads this)
```
- No dependencies; Node 18+ is enough. The port is 4777; if it is taken, the next free
  port is used. `hub/config.json`: `{ "project": "Name", "port": 4777 }`
- Claude starts the server in the background itself and gives the user the link.
- The page re-reads the files every 4 seconds. When you add a need record or tick a
  phase criterion, the user sees the change right away.

## Folder structure
```
hub/
├── server.mjs, lib/, public/     # the tool — DO NOT MODIFY (copied from the skill)
├── config.json                   # project name, port
├── needs/<id>.json               # need records — COMMITTED, CONTAIN NO VALUES
└── inbox/                        # user submissions — has its own .gitignore, never enters the repo
    ├── <id>.json                 # { submittedAt, values, files, note }
    └── files/<id>/<field>__<name> # uploaded files (mode 0600)
```

## Need record schema (`hub/needs/<id>.json`)
The file name and `id` are identical: lowercase letters, digits and hyphens
(`play-service-account`). Each record is a separate file, so parallel subagents never
edit the same file, but adding/updating records is still done by the **main session**.

| Field | Required | Description |
|---|---|---|
| `id`, `title` | ✔ | Identifier and short title |
| `summary` | ✔ | One sentence: exactly what is needed |
| `why` | ✔ | Why it is needed, what cannot be done without it |
| `steps` | ✔ | `[{ title, detail?, url?, urlLabel? }]` — where to find it, STEP BY STEP |
| `fields` | ✔ | Form fields (below) |
| `status` | ✔ | `pending` · `processed` · `rejected` · `cancelled` |
| `phases` | ✔* | Numbers of the phases waiting on this information: `["06","09"]` (*`[]` if unrelated to any phase) |
| `priority` | | `high` · `medium` · `low` (default `medium`) |
| `category`, `eta` | | Grouping label ("Apple", "Ads"), estimated time ("5 min") |
| `blocks` | | Pending work: `["Phase 09 — iOS release", "TODO: …"]` |
| `prerequisites` | | What is needed before starting (account, fee, permission) |
| `copy` | | `[{ label, value }]` — values the user pastes into a console (bundle id, SHA-1…) |
| `warnings` | | Cautions (one-time download, delayed permission activation…) |
| `createdAt` | | ISO date — used for sorting |
| `processedAt`, `processedNote` | | When processed: what was done (NEVER write values) |
| `rejectReason` | | When rejected: why, and how to fix it |
| `cancelReason` | | If it is no longer needed |

Field types (`fields[]`):
| `type` | Use | Extra properties |
|---|---|---|
| `text` | ID, host, username | `placeholder`, `example`, `pattern` + `patternHint` |
| `secret` | Password, token (with show/hide button) | `pattern` |
| `textarea` | Multi-line content | |
| `select` | Pick from options | `options: [{ value, label }]` |
| `file` | Key/certificate file (max 20 MB) | `accept: ".json"` |
| `confirm` | Have the user confirm an external step as "done" | `label` is the confirmation sentence |

All of them have `key`, `label`, `help` (formatted text), `required` (default `true`)
and `target`. `target` says where the value goes (e.g. `GitHub Secret
HOSTINGER_FTP_PASSWORD`, `fastlane/keys/`). It is not shown to the user; it guides
Claude during processing.

These formats can be used in text: `` `code` ``, `**bold**`, `*italic*`,
`[text](https://…)`. Do not write HTML; it is escaped and shown literally.

Example records live in the skill's `assets/project-hub/examples/needs/` folder.
Before writing a new record, look at one and match its level of detail.

## Need record writing quality (STRICT)
1. **Steps are written from scratch.** Assume the user has never opened that console.
   Each step is a single action; menu paths are written as `**A → B → C**`, and a
   `url` that links straight to the page is included. If you are unsure about the
   console UI, check the current documentation before writing.
2. **Prerequisites are written.** Things like a paid account, a required role or an
   approval wait time go into the `prerequisites` field.
3. **Values to paste into the console** (bundle id, package name, SHA-1, redirect URL)
   are provided via the `copy` field; the user should not have to look them up by hand.
4. **Every field with a known format gets a `pattern`.** Errors should be caught on the
   user's side, at submission time. `patternHint` describes the expected format in
   plain language.
5. **Pitfalls go into `warnings`.** For example, one-time downloads or permissions that
   activate with a delay.
6. **Every record is linked to the relevant phase via `phases`.** The Plan screen
   highlights open records of upcoming phases as "fill in now".
7. **The first record is `store-accounts`.** No store action is taken until this record
   settles which Play and Apple accounts the app will be published from (RULES.md
   Section 12.8). Every record related to a store console reminds the user, with a
   `warnings` item, to work in the correct account.
8. **Records are opened ahead of time.** When the plan is approved, ALL foreseeable
   external needs of the phases (store accounts, API keys, console settings) are
   opened as records immediately, so the user can prepare before a phase arrives; do
   not wait until the need arises.
9. After adding a record, run `node hub/server.mjs --status` and leave no errors.
   Then announce it to the user in a single line:
   `Added to Needs Center: <title> — http://127.0.0.1:<port>/#/needs/<id>`

## Processing submissions (at every phase transition and at session start)
1. Run `node hub/server.mjs --status`. For each record in the **SUBMITTED** list:
2. Read `hub/inbox/<id>.json`. Files are at `files.<field>.path`; the user's note is in
   the `note` field.
3. **Validate.** Does the JSON file open, does it contain the expected fields? Does the
   key work? If possible, actually try it (e.g. an FTP connection, an API call).
4. **Move it to its target.** The value goes where the field's `target` says: `.env`,
   GitHub Secrets (`gh secret set`), `fastlane/keys/`, etc. During this, NEVER write
   the value to the chat, a commit message, a log or the record file.
5. **Update the record.**
   - On success: set `status: "processed"`, `processedAt`, and a `processedNote` with
     no values in it (e.g. "moved to fastlane/keys/, connection tested").
   - On failure: set `status: "rejected"` and write `rejectReason`. Explain concretely
     what is wrong and how to fix it. The record returns to the user as "Needs retry".
6. **Clean the inbox.** `hub/inbox/<id>.json` and `hub/inbox/files/<id>/` are deleted in
   both cases; the inbox is not permanent storage.
7. Complete the pending work retroactively, close the related TODO.md item, and commit
   the record update.
8. If a need is no longer required, do not delete the record; set `status: "cancelled"`
   and write `cancelReason`.

## Keeping the plan live (PLAN.md format)
The Plan screen reads the format used in the templates. Follow these rules. English
forms are primary; the Turkish equivalents are also accepted.
- Do not change the column headers of the phase index table:
  `| # | Phase | Status | Depends | Group | Estimate | Start | End | Duration | File |`
  (TR: `| # | Faz | Durum | Bağlı | Grup | Tahmin | Başlangıç | Bitiş | Süre | Dosya |`)
- The status cell starts with a marker, optionally followed by a note:
  `[ ]` · `[~] what is in progress` · `[x] 2026-10-13` · `[cancelled] reason`
  (TR: `[iptal]` for cancelled)
- Durations use `h` (hours) and `m` (minutes): `2h`, `1.5h`, `1h30m`, `45m`.
  (TR: `s` = saat, `d` = dakika: `2s`, `1.5s`, `1s30d`, `45d`.)
- The `Depends` cell separates phase numbers with commas (`02, 03`); write `—` if there
  are none. The `Group` cell holds `G1`, `G2`…
- The `File` cell has the form `[phase-05](docs/plan/phase-05-slug.md)`.
- Phase progress is computed from the `- [ ]`/`- [x]` boxes under `## Done Criteria` in
  the phase file (TR: `## Bitti Kriterleri`). Tick the boxes as the work progresses; do
  not tick them all at once when the phase ends. That way the progress bar moves live.
- The scope bullet in a phase file is `- In scope:` (TR: `- Yapılacak:`).
- Every line of the completion log starts with `- ` and sits under
  `## Phase Completion Log` (TR: `## Faz Tamamlanma Günlüğü`). The statistics section is
  `## Statistics` (TR: `## İstatistik`).

## Operations tab (post-launch, RULES.md Section 18)
The tab reads these files on every refresh; the daily routine
(`DAILY_OPS.template.md`) writes them. Without `ops/config.json` the tab shows how to
turn operations on.

| File | Written by | Purpose |
|---|---|---|
| `ops/config.json` | kickoff / enabling ops | autonomy, `soakHours`, `slo`, store and analytics IDs, ASO keywords, notify channel (template: `ops-config.json.template`) |
| `ops/metrics.jsonl` | daily routine, one line per day | trends and tiles |
| `docs/ops/daily/YYYY-MM-DD.md` | daily routine | daily report (fixed sections) |
| `docs/ops/weekly-YYYY-MM-DD.md` | Monday run | weekly review |
| `ops/.lock` | daily routine while running | shown as "a run is in progress" |

One `ops/metrics.jsonl` line (all fields optional except `date`; unknown fields are
ignored; unreadable lines are skipped and counted in `--status`):
```json
{"date":"2026-10-13","humans":{"android":300,"ios":210},
 "crashFreeUsersPct":{"android":99.74,"ios":99.88},"playCrashRatePct":0.21,"playAnrRatePct":0.11,
 "openIssues":1,"rating":{"android":4.5,"ios":4.7},"reviews":{"new":3,"replied":3},
 "aso":{"ios|us|meal planner":13,"android|us|meal planner":18},
 "release":"1.3.1+19","mode":"single"}
```
- `aso` keys are `store|country|keyword`; a lower rank is better, and the tab compares
  each rank with the line closest to 7 days earlier.
- `release` is set only on the day a build reached a store; `mode` is `single` or
  `multi` (which agent mode the run used).
- Write numbers, not strings. Never put values from `hub/inbox/` into metrics.
- API: `GET /api/state` includes `ops`; `GET /api/ops/report/<id>` returns one report
  (`<id>` is `YYYY-MM-DD` or `weekly-YYYY-MM-DD`).
