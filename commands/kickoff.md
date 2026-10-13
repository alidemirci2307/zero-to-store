---
description: Starts the project kickoff procedure (zero-to-store skill)
---

Apply the zero-to-store skill:

1. Read the skill's `references/rules.md` file FROM START TO FINISH.
2. Follow the STRICT order in rules.md Section 17.0:
   1) Create docs/RULES.md (a verbatim copy of rules.md) + the index CLAUDE.md
      (≤400 lines) + an empty TODO.md; copy the skill's `assets/project-hub/`
      folder (except examples/) as `hub/`, start the server and give the
      user the link; commit (templates: `assets/templates/`)
   2) Check the tooling: Supabase MCP, Firebase CLI, Chrome MCP,
      RevenueCat MCP — report their status, ask for whatever is missing
      (Section 17.0.1)
   3) Ask ALL the questions in Section 17.8 in one go, write the answers into
      the relevant docs/ files, reference them from CLAUDE.md
   4) Break the project into detailed phases (in the format of Section 17.3 +
      17.3.1), produce the dependency graph + parallel groups (Section 17.4.1),
      write a time estimate for each phase, present the plan, get approval
   5) Write the approved plan as a PLAN.md index + `docs/plan/phase-XX-<slug>.md`
      files; immediately open the phases' external needs as `hub/needs/`
      records (Section 16.6); commit
   6) Implement the phases with Sonnet-model subagents: those in a parallel
      group run at the same time, with integration + audit at the end of each
      group; do not ask questions between phases, write needs into the Needs
      Center (Sections 16.6, 17.4–17.7)

Do not write a single line of project code until CLAUDE.md has been created.

If the user gave extra details along with this command (project idea,
features), take them as the project's definition: $ARGUMENTS

Communicate with the user in their language (e.g. Turkish if they write Turkish); use references/rules.tr.md and assets/templates/tr/ for Turkish projects, references/rules.md and assets/templates/ otherwise.
