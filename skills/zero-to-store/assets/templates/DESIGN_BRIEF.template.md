# Design brief — {{PROJECT_NAME}}

> The single source for the app's design (RULES.md Section 3.6). Claude fills
> every {{…}} from `docs/PRODUCT.md`, `docs/ASO.md` and
> `docs/MONETIZATION.md`, then builds the Design System and the Design
> canvas from this file. Sections that do not apply say "none" (for example
> no ads). The approved links go to `docs/design/DESIGN.md`.

## 1. Product
- What it does, in one sentence: {{ONE_SENTENCE}}
- Who it is for and the job they hire it for: {{AUDIENCE_AND_JOB}}
- Markets and languages: {{COUNTRIES}} · {{LANGUAGES}} (longest: {{LONGEST_LANGUAGE}}; RTL: {{YES_NO}})
- Platforms: {{PLATFORMS}} · tablets: {{YES_NO}} · accounts: {{ACCOUNTS_AND_GUEST_MODE}}
- Monetization: {{MODEL}} (Section 8.11)

## 2. Brand and concept
- Name: {{APP_NAME}} · personality in three adjectives: {{ADJECTIVES}}
- Visual concept, named: {{CONCEPT_NAME}} — {{WHAT_IT_LOOKS_AND_FEELS_LIKE}}
- Existing assets (logo, colors, fonts): {{ASSETS_OR_NONE}}
- Competitors' visual language and how this app stands apart: {{DIFFERENCE}}

## 3. Quality bar (STRICT)
- Original: no template or stock-kit look; a custom illustration and icon style; confident typography.
- Rich motion: micro-interactions on every control, meaningful screen transitions, animated onboarding and success moments (Lottie or Rive), skeleton loaders. Motion tokens set durations and curves.
- Smooth and calm when asked: 60 fps on low-end Android; a calm alternative when the system "reduce motion" setting is on.
- Accessible: text contrast ≥ 4.5:1, touch targets ≥ 48 dp / 44 pt, text scaling to 200%, labels on icon-only controls.
- Complete: every screen in every state (loading, empty, error, offline, success), light and dark, the longest language, RTL if any, small (iPhone SE) and large phones, tablets if supported.

## 4. Design system (build it first)
- Tokens: semantic colors for light and dark (primary, surface, text, success, warning, error), type scale, spacing, radius, elevation, motion.
- Components: buttons, inputs, cards, list rows, sheets, dialogs, tabs, chips, toasts, empty-state block, skeletons, paywall plan cards, ad slot frames, pre-permission card.
- App icon direction, splash and the store screenshot frame style (Section 11.3).

## 5. Screen inventory (one phone artboard each, 390×844)
| Flow | Screens | States |
|---|---|---|
| Launch | splash, force update, update available, no connection | — |
| Onboarding | {{STEPS}}, personalization questions, pre-permission screens | — |
| Paywall | paywall, trial timeline, purchase success, restore result | loading, error |
| Auth | sign-in (Google + Apple), sign-in prompt from guest mode | loading, error |
| Core | {{CORE_SCREENS}} | loading, empty, error, offline, success |
| Settings | settings, language, premium and manage subscription, legal, delete account with confirmation | — |
| System moments | notification and ATT pre-prompts, review moment, celebration | — |
| Ads | {{SCREENS_WITH_AD_SLOTS}} with their slots | — |

## 6. Onboarding (Section 3.8)
- Steps and the value each one shows in action: {{STEPS_AND_VALUE}}
- Personalization questions and where their answers are used later: {{QUESTIONS_AND_USE}}
- Progress indicator; skip only where it does not break the flow.
- Ends on: {{PAYWALL_OR_FIRST_VALUE}}

## 7. Paywall and premium (Section 3.9)
- Plans and trial: {{PLANS_AND_TRIAL}} (prices come from the store; never hard-coded)
- MUST show: the billed amount and period as the most prominent price; trial length, renewal, price, date and how to cancel; Restore; Terms (EULA) and Privacy links; a visible close button.
- MUST NOT: a hidden or delayed close, fake countdowns or scarcity, a pre-selected costly plan hiding cheaper ones, "free" without the terms, confirmshaming, interrupting a core task.
- Conversion: benefits with icons, the recommended plan marked (with its saving), a trial timeline, one primary call to action, social proof only when real.

## 8. Ads (Section 3.10; "none" without ads)
- Placement plan, screen → format: {{PLACEMENTS}}
- No ads on onboarding, paywall, purchase, settings, account deletion or permission screens; no interstitial at launch or exit; rewarded ads are opt-in and state the reward first; native ads carry an "Ad" label; premium removes every ad.

## 9. Retention (Section 3.11)
- The next useful action on the home screen: {{NEXT_ACTION}}
- Empty states that lead to the first value moment: {{EMPTY_STATES}}
- Progress, streaks or achievements (only where they fit): {{HABIT_LOOP}}
- Celebration and review-request moments: {{MOMENTS}}

## 10. Deliverables and review
- First a "Design System" artifact, then one "Design" canvas: all artboards grouped per flow, with prototype links for onboarding → paywall → first value.
- The user reviews the links in Claude and comments; Claude revises until the user approves.
- After approval: the artifact links and the approval date go to `docs/design/DESIGN.md`, and the tokens become the Flutter theme and the Tailwind config.
