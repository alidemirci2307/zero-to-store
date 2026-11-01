---
description: Starts the project kickoff procedure (zero-to-store skill)
---

LANGUAGE FIRST: reply in the user's language in every message (Turkish if
they write Turkish), including every question and option label, even though
this command and the skill files are in English. If you cannot tell the
language (no text below and no configured response language), ask once:
"Türkçe mi, English?"

Apply the zero-to-store skill:

1. Read the skill's rules file FROM START TO FINISH: `references/rules.tr.md`
   for Turkish users, `references/rules.md` otherwise (templates:
   `assets/templates/tr/` or `assets/templates/`).
2. Follow the STRICT order in Section 17.0:
   1) `git init -b main` + docs/RULES.md (a verbatim copy of the rules file)
      + the index CLAUDE.md (≤400 lines) + an empty TODO.md + `hub/` (a copy
      of `assets/project-hub/` without examples/); start the server, give
      the user the link, commit
   2) Kickoff interview (Sections 17.8–17.9): adaptive rounds with the
      question tool, the best-practice option first and marked Recommended;
      never ask what the user already said or what earlier answers ruled
      out; never assume the backend; answers → docs/PRODUCT.md +
      docs/DECISIONS.md
   3) Tool check for the chosen stack (Section 17.0.1)
   4) Monorepo skeleton with the chosen apps only + a private GitHub repo
      (Sections 15.4, 15.10)
   5) Research, then ONE approval round: name and package name, ASO
      keywords, ad/push plans and SEO keywords when relevant, and the phase
      plan with its dependency graph, parallel groups and time estimates
   6) Write PLAN.md + docs/plan/phase-XX files; do everything you can do
      yourself (CLI, MCP, Chrome MCP — Section 16.7) and open only the rest
      as Needs Center records; commit
   7) With Claude Design: brief → Design System → Design canvas → the
      user's approval before the UI phases (Section 3.6). Implement the
      phases with Sonnet subagents, parallel groups at the same time.
      Ask questions between phases only if the user chose that in the
      interview; otherwise none except the two gates of Section 17.7

Do not write a single line of project code until CLAUDE.md has been created.

If the user gave extra details along with this command (project idea,
features), take them as the project's definition and do not ask again what
they already answer: $ARGUMENTS
