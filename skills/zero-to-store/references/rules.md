# ZERO-TO-STORE — RULES AND INFRASTRUCTURE

> YOUR FIRST TASK, before anything else: write all of these rules to
> docs/RULES.md, then set up a SHORT CLAUDE.md that references it (an index,
> ≤400 lines), an empty TODO.md, and the Project Hub (hub/) (see Section 17.0
> and 16 — the order and file structure are defined there authoritatively).
> Then ask the user the questions in the "Way of Working" section and set up
> the project skeleton.
> In every later session: first read CLAUDE.md, PLAN.md and TODO.md, run
> `node hub/server.mjs --status`; remind the user of the completed phases, the
> next phase, the pending tasks and what is expected from the user (with the
> Project Hub link), then start working.
>
> REFERENCE FORMAT: In this document and in every file derived from it
> (CLAUDE.md, phase files, docs/), a rule reference is always written as
> "Section N.M": N = the section number, M = the item within that section
> (e.g. Section 17.3.1 = section 17, item 3.1). "Item X" is never written
> without a section number.

---

## 1. Technology Stack

- **Mobile:** Flutter (Dart). State management: Riverpod. Routing: go_router.
- **Backend:** Supabase (Auth, Postgres DB, Edge Functions).
  RLS (Row Level Security) is designed in from the start.
- **Storage:** If file/media storage is needed, Cloudflare R2 is used
  (S3-compatible API; free egress). Supabase Storage is considered only for
  very small and simple needs; the choice is presented to the user with its
  rationale.
- **Realtime (socket):** Supabase Realtime is used for real-time needs; no
  separate socket server or third-party service (Socket.IO, Pusher, Ably,
  etc.) is added.
- **Firebase:** Used ONLY for FCM (push), Crashlytics and Analytics.
  Backend data is not written to Firebase. (firebase-cli is available.)
- **Admin Panel:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
- **Web:** Landing/static pages are deployed to Hostinger shared hosting
  (Node does not run; static/PHP only). Deep link files
  (`.well-known/assetlinks.json`, `apple-app-site-association`) are placed
  there.
- **Repo:** A SINGLE private GitHub repo (monorepo); each app has its OWN
  version, CHANGELOG, tag and CI: `apps/mobile` (Flutter),
  `apps/panel` (React), `apps/web` (landing/site), plus the shared `supabase/`,
  `packages/`, `hub/`, `docs/`. The structure, versioning and tag rules are in
  Section 15. The mobile paths mentioned in this document (`lib/`, `android/`,
  `ios/`, `fastlane/`, `integration_test/`, `tool/`, `pubspec.yaml`) are
  relative to the `apps/mobile/` root; the admin panel and web paths are
  relative to their own `apps/<app>/` root.
  Secrets are never embedded in code; `--dart-define`, `.env` (gitignored) or
  GitHub Actions Secrets are used. (Exception: the store credential files in
  the Release section — see Section 12.5.)

## 2. Architecture Rules (MANDATORY)

1. All code is written in accordance with SOLID principles and Clean
   Architecture (presentation / domain / data layers, feature-first folder
   structure). This rule applies to both the Flutter and the React (admin
   panel) side.
2. No file may exceed 300 lines. If exceeding it is unavoidable, the user MUST
   be notified, with the reason, at the end of the task.
3. Base structures are set up: BaseRepository, BaseUseCase, BaseNotifier/State,
   BaseWidget, a shared error/failure model, a shared network layer.
   On the React side: BaseService, a shared ApiClient, shared hooks.
4. UI components are written as a project-specific shared component library
   (AppButton, AppTextField, AppCard, etc.) and are reusable.
   Screens use these components instead of raw Material/HTML widgets.
5. Multi-language (i18n) architecture is set up FROM THE START:
   - In Flutter, `flutter_localizations` + ARB files are used
     (`lib/l10n/app_en.arb`, `app_tr.arb` ...). There is an ARB file for
     every language the app supports.
   - No user-facing text is HARDCODED in code; all texts come from locale
     files. This includes onboarding, splash, error messages, button labels
     and paywall texts.
   - When a new feature is added, its texts are added to ALL supported
     languages at the same time; they are never left in a single language.
   - The admin panel is likewise set up with a multi-language infrastructure
     (react-i18next or equivalent); the panel languages include at least
     English.
   - If the device language is not supported, the default language is English
     (if the project is local, the user is asked). The language structure is
     recorded in CLAUDE.md.

## 3. Design Rules (MANDATORY)

1. If the user provided a design file (Claude Design, etc.), it is followed
   exactly.
2. If no design was provided: a high-quality design is created that is modern,
   animated and based on a theme system (color/typography tokens).
3. If the design has no onboarding: an animated, on-theme onboarding that
   explains the app's main features is added (shown once on first launch and
   never shown again).
4. Splash screen: modern, animated and on-theme, and shows the version name
   (package_info_plus).

## 4. Mobile Behavior Rules (MANDATORY)

1. The Android back button is considered for every screen (with PopScope):
   - Going back is blocked on onboarding/splash.
   - Form screens show an unsaved-changes warning.
   - The main screen applies the "press again to exit" behavior.
2. Every screen is designed with loading, empty and error states.
3. Offline behavior is considered:
   - The app NEVER crashes when there is no internet; connection status is
     monitored (connectivity_plus) and a meaningful "no connection" state is
     shown (full screen or banner, on-theme) + a "retry" action is offered.
   - When the connection returns, pending screens refresh automatically.
   - Network errors are shown to the user not with technical messages but
     with understandable, translated texts. (This is a scenario tested in
     store review.)
4. A force update (mandatory update) mechanism is SET UP:
   - `min_supported_version` (and optionally `latest_version`,
     `update_message`) is kept in the `app_config` table in Supabase.
   - On every launch the app compares its own version against this value:
     * Version < min_supported_version → an on-theme "Update Required" screen
       that cannot be dismissed is shown; the only action is a button that
       redirects to the relevant store. It cannot be bypassed with the back
       button.
     * Version < latest_version → a dismissible "New version available"
       suggestion, shown once, is displayed (soft update).
   - These values are managed from the admin panel's "App Settings" section;
     they can be updated from the admin panel when a new version is published.
   - If the config check fails at launch (no network, etc.) the user is NOT
     blocked; the app opens normally and the check is deferred to the next
     launch.
   - The structure (table, fields, flow) is recorded in CLAUDE.md.
5. Mobile performance rules:
   - Images coming from the network are cached with cached_network_image; list
     images are loaded at a resized size.
   - Long lists MUST be built lazily (ListView.builder /
     SliverList); the whole list is never built at once.
   - Unnecessary rebuilds are prevented: const constructors, select /
     fine-grained provider usage in Riverpod, isolating heavy widgets.
   - Animations target 60fps; an animation that causes jank is not left
     unfixed. Heavy work (parsing, image processing) is moved to
     isolate/compute.
   - App startup time is watched: no blocking synchronous work is done on the
     splash; initialization tasks run in parallel/deferred.
6. EVERY feature developed MUST be tested on both the Android emulator and the
   iOS simulator. A feature is not considered "done" until it is verified to
   work on both platforms; platform-specific differences (permissions, safe
   area, back behavior, Apple/Google sign-in flows) are checked on both sides.
   If something cannot be tested (e.g. a feature requiring a real device), the
   user is notified.

## 5. Authentication Rules (MANDATORY)

1. Sign-in is ONLY with Google and Apple (via Supabase Auth).
2. Email/password sign-in is NEVER added; an email sign-in form, "forgot
   password" and similar flows appear on no screen.
3. Sign in with Apple is mandatory on iOS (App Store rule: if third-party
   sign-in exists, Apple sign-in must also be offered). On both platforms,
   Google + Apple are offered together.
4. Admin panel sign-in is separate from this: it is protected with Supabase
   Auth + role checks; the sign-in method is asked of the user when the admin
   panel is planned.
5. An account deletion flow from WITHIN the app is MANDATORY (Apple and Google
   policy: if account creation exists, in-app deletion must also be offered):
   - A clearly accessible "Delete Account" option is in the Settings screen;
     it includes a confirmation step (irreversible warning).
   - The deletion is ACTUALLY carried out in Supabase: the auth record and the
     user's data are deleted/anonymized, the files in R2 are cleaned up,
     device tokens are removed. The operation is performed via an Edge
     Function with the service role (the client MUST NOT see the service
     role).
   - A user with an active subscription is shown a notice that they must
     cancel their subscription through the store before deleting.
   - The account deletion page on the web also describes this flow (store
     requirement). The flow is recorded in CLAUDE.md.
6. The auth flows (first sign-in, session refresh, sign-out, account deletion)
   and provider configuration details are recorded in CLAUDE.md.

## 6. Web Presence Rules (MANDATORY)

1. Before starting the project, the user MUST BE ASKED: what is wanted
   alongside the mobile app?
   - Landing page only (features, screenshots, store links, contact)
   - Full website (a web version of the app / a multi-page site)
   - Both
   No plan or code is written for the web side until an answer is received.
2. Landing page: static (HTML/CSS/JS or a React static build), modern,
   animated, on-theme, and deployed to Hostinger. The privacy policy,
   KVKK/GDPR/Privacy page, account deletion page and deep link files are also
   hosted here.
3. If a full website is requested, its scope and technology are clarified
   separately and a plan is presented; it is coded after approval.
4. The decision made is recorded in CLAUDE.md.

## 7. Admin Panel Rules (MANDATORY)

1. The project MUST have an admin panel. Technology: React + Vite +
   TypeScript + Tailwind + shadcn/ui. TanStack Table for tables,
   Recharts for charts, the Supabase JS SDK for the backend.
2. The admin panel is also subject to the architecture rules in Section 2
   (SOLID, Clean Arch, 300-line limit, base structures, shared components).
3. The deploy target is ASKED OF THE USER before work begins:
   - If the user provided Hostinger details (FTP/panel access), it is deployed
     there (static build + `.htaccess` rewrite for SPA routing).
   - If not, Firebase Hosting is used.
   No admin panel deploy plan is made until a decision is reached.
4. The admin panel is complete — the app MUST be FULLY manageable from the
   admin panel:
   - Dashboard: key metrics and summary statistics
   - CRUD management of all data tables (listing, search, filtering,
     sorting, pagination, create, edit, delete)
   - User management: listing, detail, block/activate, role assignment
   - Content/media management (via the project's storage choice —
     Cloudflare R2 by default; see Section 1 and 13.8)
   - Sending push notifications (with the Section 9 infrastructure;
     single/bulk, target screen selection, per-language text, scheduling)
   - App settings (remotely manageable config values)
   - Logs / recent activity view
5. Admin panel sign-in is done with Supabase Auth; admin authorization is
   protected with RLS + a role table. Mobile users can never access the admin
   panel.
6. When a new feature is added to the app, the corresponding management screen
   on the admin panel side is added as well; this sync rule stays permanently
   in CLAUDE.md.

## 8. Store Policies and Revenue Model Rules (MANDATORY)

1. The mobile app is planned and coded in FULL COMPLIANCE with the Apple App
   Review Guidelines and Google Play Policy. A policy check is performed when
   planning every feature; if there is a risky situation, the user is notified
   before coding.
2. Ads are managed with AdMob and AdMob policies are strictly followed (no
   forcing accidental clicks, no hiding the close button, no
   out-of-policy placements).
3. Ad permission/consent flows are MANDATORY and are set up from the start:
   - iOS — ATT (App Tracking Transparency): the ATT permission is requested
     before accessing the advertising identifier; the
     `NSUserTrackingUsageDescription` text is added to Info.plist and is
     written honestly and in line with Apple's rules. The `SKAdNetworkItems`
     definitions (AdMob's current list) are added to Info.plist. Even if the
     ATT permission is DENIED, the app works fully; only non-personalized ads
     are shown.
   - GDPR/UK — Google UMP SDK: a consent form is shown to users in
     Europe/the United Kingdom on first launch; ads are NOT LOADED without
     consent. The user is reminded that the GDPR message needs to be
     configured in the AdMob panel. The personalized /
     non-personalized ads distinction is managed automatically according to
     the consent state.
   - The order of these flows is set up correctly: UMP consent → ATT
     permission → ad SDK initialization. The flow is recorded in CLAUDE.md.
4. The app name and Bundle ID / package name are determined AFTER the ASO
   analysis, presented to the user before the skeleton is set up, and the
   user's approval is obtained. Claude never proceeds by deciding a name or id
   on its own.
   - Name: at the end of the ASO research (Section 11.1), at least 3
     candidates in the "Brand – main keyword" structure (≤30 characters) are
     suggested. The rationale for each candidate is written (keyword value,
     memorability, pronunciation, no negative meaning in the target
     languages).
   - A uniqueness check is MANDATORY. Each candidate brand name is searched
     on both stores for every targeted country:
     on the App Store with the iTunes Search API
     (`https://itunes.apple.com/search?term=<name>&entity=software&country=<country>`),
     on Google Play with the store search
     (`https://play.google.com/store/search?q=<name>&c=apps`).
     If an app with the same name or one similar enough to be confused with it
     exists, the candidate is eliminated. On the App Store, the app name must
     be unique.
   - For brand conflicts, a quick search is run on TÜRKPATENT / EUIPO / USPTO
     and the risk is reported to the user.
   - Package name: in the form `com.<domain-or-company>.<brand>`; it contains
     only lowercase letters, digits and dots. It is IDENTICAL on iOS and
     Android. It is not stuffed with keywords; it carries the brand name. The
     store name and texts can change later (ASO iteration), but the package
     name can NEVER change; so it is chosen to be exactly consistent with the
     brand. The company part is consistent with the domain name the user owns.
   - The package name is checked to be available:
     `https://play.google.com/store/apps/details?id=<package>` must not show a
     published app. The definitive check is made when the app is created in
     Play Console and the Identifier is created in Apple Developer.
   - The approved name is reserved EARLY: the app record is created in App
     Store Connect and the app is created in Play Console (with a Needs
     Center entry, on the correct account — Section 12.8).
   - Once it has gone to the store, the package name CANNOT BE CHANGED. The
     approved name and id are written to `docs/ASO.md` and referenced from
     CLAUDE.md.
5. The ads strategy is planned to MAXIMIZE revenue. Every suitable format is
   evaluated: banner, interstitial, rewarded, rewarded interstitial, native and
   app open ad. Which format will be used on which screen is presented as an
   "ad placement plan" and the user's approval is obtained. Frequency caps
   (e.g. a cooldown for app open) are set in line with policy.
6. In-app purchases and subscriptions are managed through RevenueCat (App
   Store + Play Store from a single hub). The paywall design complies with
   store rules (price, duration and cancellation information are stated
   clearly).
7. Ads are NOT shown to premium/subscribed users; the ad layer works tied to
   the RevenueCat entitlement check.
8. The ads and purchase structure (ad unit id management, entitlement names,
   product ids) is recorded in CLAUDE.md. ONLY AdMob test ids are used during
   development; real ids enter the release build through config.
9. Store privacy declarations are MANDATORY and are prepared correctly
   according to the SDKs used:
   - Apple App Privacy ("nutrition label") declaration: a declaration list is
     prepared and presented to the user so that the data types collected by
     AdMob, Analytics, Crashlytics, RevenueCat and Supabase Auth are marked
     completely and CORRECTLY.
   - iOS Privacy Manifest (`PrivacyInfo.xcprivacy`): it exists in the project;
     the required reason APIs and data types used are defined. The SDKs'
     own manifests come with up-to-date versions; if there is a manifest
     warning during the build, no release is made until it is resolved.
   - Google Play Data Safety form: an answer set to be filled in according to
     the same SDK list is prepared and presented to the user.
   - The rule that these declarations must be updated when a new SDK is added
     stays in CLAUDE.md; the declarations are recorded in CLAUDE.md.
   - A wrong/incomplete declaration is grounds for rejection; a "no data
     collected" declaration is made only if that is actually true.
10. In-app review (in-app rating) is set up:
   - The Google Play In-App Review API and Apple SKStoreReviewController
     (the in_app_review package) are used; the user can rate within the app
     without being sent to the store.
   - It is requested at the RIGHT MOMENT: after the user has had a
     success/value moment (task completion, first successful use, etc.). It is
     NEVER requested after an ad, after an error, or on first launch.
   - Policy is followed: no reward is given in exchange for a rating, no
     "give 5 stars" prompting is done, and filtering before the system dialog
     (screening out negatives with "did you like it?") is not done because it
     violates Apple's rules.
   - The request frequency is limited (the OS already imposes a quota); the
     event after which it is requested is recorded in CLAUDE.md.

## 9. Push Notification Rules (MANDATORY)

1. Push notifications are set up through FCM and MUST work correctly; the
   setup is tested end to end on both platforms (Android + iOS/APNs):
   receiving a notification is verified in all three scenarios: app in the
   foreground, in the background, and completely closed.
2. The notification permission is requested at the right time:
   - The POST_NOTIFICATIONS runtime permission is used for Android 13+, and
     the system permission for iOS.
   - The permission is NOT asked on first launch; it is requested after the
     user has seen value in the app, with a short pre-permission prompt screen
     explaining the benefit of the permission. This approach increases the
     opt-in rate.
   - If the permission is denied, the app works normally; a way to re-enable
     it from settings is shown, and the user is never pressured.
3. FCM token management: the token is obtained, its refresh is listened to,
   and it is stored in Supabase mapped to the user (the `device_tokens` table:
   user_id, token, platform, updated_at). The token of a user who signs out is
   deactivated; invalid tokens are cleaned up.
4. Navigating to the RELEVANT SCREEN when a push notification is tapped is
   MANDATORY:
   - Every notification payload carries routing data
     (e.g. `route` + `id` fields) and the relevant screen is opened with the
     go_router deep link infrastructure.
   - It works correctly in all three states: app open, in the background, and
     closed (initial message check). Push notification work is not considered
     "done" until these three scenarios are tested separately.
   - If the target screen requires auth, the flow does not break: after
     sign-in it continues to the targeted screen.
5. The push notification strategy is planned to INCREASE RETENTION:
   - A push notification plan is prepared according to the app's features and
     presented to the user: transactional push notifications (message
     received, order updated), re-engagement (win-back: a user who has not
     opened the app for X days), personalized reminders and value-driven
     content push notifications.
   - A frequency cap is set (no spamming); notification fatigue leads to
     permission revocation. Quiet hours and the user's time zone are taken
     into account.
   - Push notification texts are prepared in ALL supported languages (the i18n
     rule also applies to push notifications).
6. Sending push notifications from the admin panel uses this infrastructure:
   single/bulk sending, target screen (route) selection, per-language text
   entry and scheduling are supported. Sending is done through an Edge
   Function; the FCM server key/service account never leaks to the client.
7. The push notification structure (payload schema, route list, the
   device_tokens table, the sending flow) is recorded in CLAUDE.md.
## 10. SEO Rules — Web (MANDATORY)

1. The website and landing page are built in FULL COMPLIANCE with SEO rules.
   This is a mandatory rule; content, code and design are shaped by it.
2. Rendering: the landing page and content pages are produced as STATIC HTML
   (hand-written HTML, SSG or prerender). A SPA landing page that renders
   its content only in the browser with JavaScript is FORBIDDEN; all text,
   headings and links are present in the first HTML response.
3. Technical SEO:
   - Every page has a unique `<title>` (≤60 characters, main keyword first)
     and a meta description (≤155 characters, with a call to action).
   - A single `h1` and a correct heading hierarchy, semantic HTML (header,
     main, nav, footer, article), meaningful `alt` texts and descriptive
     image file names are used.
   - A single canonical address: HTTPS is mandatory. www/non-www and the
     trailing `/` are redirected to a single form with a 301 (`.htaccess`),
     and every page has a `canonical`.
   - `sitemap.xml` contains all pages and language versions with `lastmod`.
     `robots.txt` contains the sitemap line; CSS/JS is not blocked.
   - The admin panel and staging are NEVER indexed: `noindex`
     (`X-Robots-Tag` header + meta) and robots `Disallow` are applied.
   - The custom 404 page returns with a real 404 status code (no soft 404).
     URLs are clean and lowercase; internal linking is planned.
4. Content is written keyword-focused. Before the page content is prepared,
   the target keywords are determined and presented to the user: a
   keyword → page mapping per language, with search intent and rationale.
   Keywords are consistent with the ASO keywords (Section 11.1). Search
   volume is never made up; estimates are labelled as estimates.
5. Mobile compatibility (responsive) is mandatory; design is mobile-first.
6. Multi-language: each language lives at its own URL (`/tr/`, `/en/`). Every
   page includes the `hreflang` alternates + `x-default` and the correct
   `<html lang>`. No automatic redirect based on IP or browser language is
   done; a visible language selector is provided. Texts are localization,
   not translation: each language is written with its own keywords.
7. Performance (Core Web Vitals, mobile, 75th percentile):
   - Targets: LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1. Lighthouse mobile
     score ≥ 90 in Performance, Accessibility, Best Practices and SEO.
   - Images are used in WebP/AVIF format with `width`/`height` specified.
     The LCP image gets `fetchpriority="high"` and is not lazy-loaded; other
     images are loaded with `loading="lazy"`.
   - Fonts are loaded with `font-display: swap` and preload. Non-critical
     JS is deferred. gzip/brotli compression and cache headers are defined
     in `.htaccess`.
   - Lighthouse is measured on every web deploy and the result is written
     to docs/SEO.md; work is not considered done until a score below the
     target is fixed.
8. Structured data (JSON-LD): Organization, WebSite,
   MobileApplication/SoftwareApplication (name, operating system, category,
   price, store links) and BreadcrumbList are used. `aggregateRating` is
   added only with a real and verifiable rating. Because Google has largely
   restricted FAQ/HowTo rich results, expectations are not based on them.
   The schema is validated with the Rich Results Test.
9. Sharing and branding: Open Graph (a 1200×630 image for each language) and
   `twitter:card=summary_large_image` are added. A favicon set, a web
   manifest and `theme-color` are present.
10. Bridge to the app: the iOS Smart App Banner
   (`<meta name="apple-itunes-app" content="app-id=…">`) and the official,
   language-appropriate App Store / Google Play badges are used. Badge links
   carry campaign parameters (Apple `pt`/`ct`, Play `referrer` + UTM).
   Deep link files are served with the correct content-type (Section 6.2).
11. Search Console + Bing Webmaster Tools are set up: the domain is verified
   (preferably via DNS TXT) and the sitemap is submitted. The required
   access/verification is requested through a Needs Center entry
   (Section 16.6). After launch, coverage and error reports are checked.
12. Web analytics and cookies: a cookieless analytics tool (Plausible,
   Umami, etc.) or GA4 + Consent Mode v2 is used. If there are non-essential
   cookies, a KVKK/GDPR-compliant cookie banner is added; "Reject" and
   "Accept" have equal visibility.
13. Content quality: content is real, original and useful (E-E-A-T); privacy
   policy, terms of use, account deletion and contact pages are present. The
   same language and promises as the in-app and store texts are used.
14. SEO decisions (keyword mapping, page structure, Lighthouse results,
   Search Console notes) are written to `docs/SEO.md`.

## 11. ASO Rules — Mobile (MANDATORY)

1. Keyword research is performed and presented to the user as a proposal; it
   is applied after approval.
   - Scope: EVERY targeted store country and EVERY language.
   - Competitor analysis: the name, subtitle, description language,
     rating/review count and screenshot messages of the top 10 competitors
     are extracted.
   - Sources: store search suggestions (autocomplete), competitor metadata,
     Apple Search Ads popularity score if available, and Google Trends.
   - The output is written to `docs/ASO.md` as a table: keyword | store/language |
     relevance | estimated popularity | competition | placement (name /
     subtitle / keywords / short description / long description).
   - Search volume is NEVER made up; every estimate is marked as an "estimate".
2. Metadata limits and writing rules:
   | Field | App Store | Google Play |
   |---|---|---|
   | Name / title | 30 | 30 |
   | Subtitle / short description | 30 | 80 |
   | Keywords | 100 (Apple only) | — |
   | Promotional text | 170 (updatable without a new version) | — |
   | Description | 4000 | 4000 |
   | What's new | 4000 | 500 |
   - Apple keywords field: words are separated by commas with no spaces.
     Words in the name and subtitle are not repeated, and singular/plural
     duplicates are not used. "app", the category name, and competitor or
     brand names are not written. On Apple, the description does not affect
     search ranking; it is written for conversion.
   - On Google Play the long description is included in search: the main
     keywords appear several times in natural sentences; no keyword
     stuffing.
   - Policy (Play metadata policy, Apple 2.3.7): emoji in the title, icon and
     developer name, ALL CAPS unless it is a brand, performance/promotional
     phrases such as "best" ("en iyi"), "#1", "free" ("ücretsiz"), "discount"
     ("indirim"), "new" ("yeni"), and irrelevant keywords are not used.
   - Limits and format are validated automatically before every release
     (`fastlane check_metadata`, Section 12.2). If a limit is exceeded, the
     release stops.
3. Store images — PERFECT, modern and marketing-focused:
   - Story: the first 3 images convey the app's core value (those are the
     ones shown in search results). Each image carries a single benefit; the
     headline is a 2-5 word, benefit-focused sentence that includes that
     language's keywords, and an optional short sub-line may be added.
   - Design: the same colors and typography as the app theme are used. There
     is a modern device frame, generous whitespace, a legible large headline
     and a consistent composition; the series flows as a whole like a story.
   - Content rules: ads are NOT visible (the ad layer is off in demo mode).
     Realistic but made-up demo data with no personal data is used. The
     status bar is clean (09:41, full battery, no notifications). The image
     shows the REAL usage of the app (Apple 2.3.3) and contains no
     misleading content.
   - Sizes: iOS 6.9" 1320×2868 (mandatory set); if iPad is supported, 13"
     2064×2752. Play phone 1080×1920; at least 4, at most 8 images. If
     tablet is supported, 7" and 10" sets are added. Play feature graphic
     1024×500, icon 512×512. Images are flattened JPEG/PNG without an alpha
     channel.
   - Production is fully AUTOMATED and repeatable for every language:
     1) Raw screens are captured with `integration_test` in DEMO_MODE, for
        each language and device (`tool/store_screenshots/capture.sh`).
     2) Using an HTML/CSS template, the device frame + localized headline
        are added and the images are rendered at store sizes with headless
        Chrome (`node tool/store_screenshots/render.mjs`).
     3) Outputs are written to the folders that fastlane uploads
        (`fastlane/screenshots/<ios-locale>/`,
        `fastlane/metadata/android/<locale>/images/`).
     The template and scripts are in the skill's `assets/store-screenshots/`
     folder.
   - Optional: a 15-30 second app preview video (Apple) and a promo video
     (Play YouTube link).
4. Language and localization: in a global project the base language is ENGLISH.
   For EVERY language the app supports, the store texts, keywords,
   screenshot headlines and the app UI shown in the images are prepared IN
   THAT LANGUAGE.
   - This is localization, not translation: the words actually searched for
     in each language are researched separately (Section 11.1).
   - The list of supported languages is the single source (Fastfile
     `LOCALES`, the same as the ARB files). A language cannot be missing in
     the store.
   - In some storefronts Apple indexes the metadata of more than one
     language (Apple's current "storefronts and languages" table). The
     additional language indexed by the target storefront is used as an
     extra keyword field, with relevant and meaningful content.
5. Conversion optimization: Apple Product Page Optimization (icon/image A/B
   testing), Custom Product Pages (can also be shown in search by assigning
   keywords) and In-App Events are used. On Play, store listing experiments
   and country/campaign-based custom store listings are used. The first
   experiment plan after launch is ready in `docs/ASO.md`.
6. Quality signals affect ranking:
   - Stay below the Play Android vitals thresholds (user-perceived crash
     rate < 1.09%, ANR rate < 0.47%); monitored with Crashlytics
     (Section 14).
   - Ratings are requested at the right moment (Section 8.10). Templates for
     replying to reviews are prepared in every language.
7. Category and links: primary/secondary categories are chosen with a
   rationale and Play tags are defined. The support, marketing and privacy
   URLs point to the real pages on the landing page; copyright information
   is entered.
8. Measurement and iteration:
   - Sources: App Store Connect Analytics (impressions, product page views,
     conversion rate, traffic source) and Play Console store listing
     acquisition reports; sources are separated with campaign links.
   - ASO is reviewed at every release or monthly. A change log (what
     changed, before/after metrics) is kept in `docs/ASO.md`.
9. ASO decisions (app name, keywords, texts, image messages, experiments) are
   written to `docs/ASO.md` and referenced from CLAUDE.md.

## 12. Release and Deploy Automation (MANDATORY)

1. A fully automated, ONE-COMMAND release automation is set up (Fastlane +
   `release.sh`). The version code increments automatically; the version
   name is incremented via a parameter (patch/minor/major).
   - `./release.sh mobile <android|ios|all> internal` — TEST distribution:
     * Android: the AAB is uploaded to the **internal testing** track, and
       the same build is promoted to the **closed testing** (`alpha`) track.
       A tester list named "testers" is defined in closed testing.
     * iOS: the build is uploaded to TestFlight. Internal testers (App Store
       Connect users) receive the build automatically. In addition, an
       EXTERNAL TestFlight group named "testers" is created automatically if
       it does not exist (public link enabled), the emails in
       `fastlane/testers.txt` are added to the group, the build is
       distributed to the group and submitted for Beta App Review. The
       contact information required for this is in
       `fastlane/beta_review_info.json`.
   - `./release.sh mobile <android|ios|all> promote` — RELEASING THE SAME
     TESTED BUILD (the recommended path: "build once, promote"). There is no
     rebuild and no version bump:
     * Android: the build in closed testing is promoted to production
       (staged rollout via `PLAY_ROLLOUT`).
     * iOS: the build in TestFlight is submitted for App Store review with
       the metadata and images.
     * The GitHub Release is switched from pre-release to "latest".
   - `./release.sh mobile <android|ios|all> production` — DIRECT RELEASE
     (only for emergency fixes; the test stage is skipped):
     * Android: uploaded to the production track as a staged rollout via
       `PLAY_ROLLOUT` (default 20%).
     * iOS: uploaded to the App Store with metadata + images, passes
       precheck and is submitted for review. After approval, release is done
       manually (`automatic_release: false`).
   - One-time store facts (done through a Needs Center entry):
     * The app is created in Play Console and the FIRST AAB is uploaded
       manually; the API does not work until the app has received a release
       on Play at least once. If the app has never been published (draft
       app), the script creates the release as "draft" and reports this.
     * The "testers" email list is created in Play for internal and closed
       testing.
     * For new personal Play developer accounts, before moving to
       production, at least 12 testers must test continuously for 14 days in
       closed testing. This period is included in the plan.
   - Test links (Play opt-in link, TestFlight public link) are shown in the
     release output and written to `docs/RELEASE.md`.
2. Store texts and images are managed with the fastlane structure and
   MUST be prepared in ALL languages the app supports (Fastfile `LOCALES`):
   - iOS — `fastlane/metadata/ios/<locale>/`: `name`, `subtitle`,
     `keywords`, `promotional_text`, `description`, `privacy_url`,
     `support_url`, `marketing_url`. In the root directory: `copyright`,
     `primary_category`, `secondary_category`. Images are under
     `fastlane/screenshots/<locale>/`.
   - Android — `fastlane/metadata/android/<locale>/`: `title`,
     `short_description`, `full_description`, `video` (optional),
     `changelogs/<versionCode>.txt`; under `images/`: `icon`,
     `featureGraphic` and `phoneScreenshots/`.
   - Before release, `fastlane check_metadata` validates, for EVERY language,
     the existence of files, character limits, keywords format, Play
     title/policy prohibitions and image counts. If anything is missing or
     wrong, the release does not start.
   - When a new language is added to the app, the metadata and images are
     also added for that language; store texts and app languages never
     diverge.
   - Metadata and images are sent through fastlane; text/images are not
     edited manually in the store panels.
3. The update (new version) process is also managed entirely by the fastlane
   script: version bump → build → changelog/what's new text → upload is a
   single flow.
4. A changelog is MANDATORY: each app keeps a `CHANGELOG.md` in Keep a
   Changelog format at its own root (`apps/mobile/`, `apps/panel/`,
   `apps/web/`); each app carries its own version number.
   - Each version is written under a `## [x.y.z] - YYYY-MM-DD` heading with
     Added / Changed / Fixed / Removed groups.
   - During development, changes accumulate in the `[Unreleased]` section;
     at release time the script converts this section into the version number.
   - The source of the "what's new" text is CHANGELOG.md. The flow:
     * The supported languages are defined in ONE place, the `LOCALES` table
       in the Fastfile (canonical language → Android/iOS locale code); it is
       exactly the same as the app languages (ARB). The first language is
       the default language.
     * BEFORE the release, Claude translates the `[Unreleased]` content into
       plain, user-facing language, writes the
       `fastlane/release_notes/<version>/<language>.txt` file for each
       language and commits it. If the default language's file is missing,
       the script generates it automatically from the CHANGELOG section; if
       the file of any other language is MISSING, the release stops without
       changing anything.
     * The Play Store "what's new" limit is 500 characters; a file exceeding
       it stops the release.
     * On Android, the notes are written and uploaded as
       `metadata/android/<locale>/changelogs/<versionCode>.txt`; on the iOS
       App Store each locale's `release_notes` is sent, and on TestFlight the
       default language is sent as "What to Test".
   - After every release, CHANGELOG.md is COMMITTED in its updated form and
     the app's annotated tag is created (`mobile/v1.2.0` — Section 15.6).
   - If the release script fails, it leaves no trace: if nothing was
     uploaded to any store, pubspec.yaml and CHANGELOG.md revert to their
     previous state. If one platform was uploaded and the other failed, the
     version is committed and the failed platform is retried with the SAME
     version via `./release.sh mobile <platform> <track> none`.
5. The required credential files are placed in the relevant paths and
   COMMITTED to the repo (the repo is private):
   - Google Play service account JSON → `fastlane/keys/`
   - Apple App Store Connect API key (.p8) + key id + issuer id →
     `fastlane/keys/`
   - Android keystore + key.properties → `android/keys/`
   What these files are and how to renew them is explained in
   `fastlane/keys/README.md`. The path structure is recorded in CLAUDE.md.
   - iOS signing: in the Xcode project (Runner target), "Automatically
     manage signing" is enabled and the Team is selected; the release
     manages certificates/profiles itself using the App Store Connect API
     key with `-allowProvisioningUpdates`. The Apple Developer Team ID is
     requested through the Needs Center.
   - Fastlane is pinned with a `Gemfile` (`bundle exec fastlane`);
     `Gemfile` and `Gemfile.lock` are committed.
6. Web auto deploy is MANDATORY and VERSIONED (GitHub Actions):
   - Push / PR to main → `ci.yml`: only the changed app (path filter) is
     linted + tested + built. This step does NOT deploy; main is always kept
     in a releasable state.
   - Release = tag: `./release.sh web` / `./release.sh panel` runs a build
     check locally, updates the version (`package.json`) and the CHANGELOG,
     creates the `web/vX.Y.Z` / `panel/vX.Y.Z` tag and pushes it. The
     `deploy-<app>-*.yml` workflow that catches the tag builds + deploys and
     attaches a `dist.zip` backup to the GitHub Release.
   - When each phase/feature that includes a web change is completed, Claude
     runs the relevant release command itself; deploy is not waited on
     manually.
   - ROLLBACK: the workflow is run via "Run workflow" in Actions with an old
     tag, redeploying that version; the code is not reverted.
   - Hostinger target: build → upload via FTPS (encrypted FTP); if the
     server does not support FTPS, fall back to plain FTP and write this
     decision to docs/DECISIONS.md. FTP credentials are kept in GitHub
     Actions Secrets and are NEVER written to the workflow file. If a SPA
     (admin panel / React site) goes to Hostinger, an `.htaccess` rewrite
     file is included in the build output for client-side routing
     (template: `htaccess-spa.template` → `apps/<app>/public/.htaccess`).
   - Firebase Hosting target: build → Firebase Hosting `live` channel
     (service account JSON in Actions Secrets).
   - When the workflow is set up, it is verified on the first deploy and the
     process is recorded in `docs/CICD.md`.
7. The release process (commands, tracks, versioning scheme, changelog flow,
   web CI/CD) is documented step by step in CLAUDE.md; a new session must be
   able to cut a release on its own.
8. STORE ACCOUNT SAFETY (MANDATORY) — no release is made on the wrong account:
   - The accounts to release from are finalized up front. Through the
     `store-accounts` entry in the Needs Center, the following are obtained:
     the Play Console developer name + developer account ID (in the
     `/developers/<ID>/` part of the Console URL) and the Apple team name +
     Team ID. These are written to `docs/RELEASE.md`. NO store operation
     (app creation, upload, metadata, test group) is performed until this
     entry is recorded.
   - When a store console is opened via Chrome MCP and multiple Google
     accounts (`/u/0`, `/u/1`…), multiple Play developer accounts or multiple
     App Store Connect teams are visible, Claude STOPS WITHOUT DOING ANYTHING
     and asks explicitly in the chat: "These accounts are open: …
     Which one should I release from?" The answer is compared with the entry
     in `docs/RELEASE.md`; if they do not match, it stops again. This is a
     DELIBERATE EXCEPTION to the "no questions between phases" rule in
     Section 17.7.
   - Even if only one account is visible, the active account is verified
     before every console operation: on Play, the developer ID in the URL
     and the developer name on the page, and on App Store Connect the team
     name, must match the record. If they do not match, no operation is
     performed.
   - The automation verifies too: `fastlane verify_accounts` checks that the
     `APP_IDENTIFIER` app exists in the account the API keys are bound to.
     If the app does not exist (keys of the wrong account), the release
     STOPS. `release.sh` runs this check before every release.
   - Claude does not create store accounts, enter passwords, or switch
     accounts/teams. The user performs logins themselves; an account change
     happens only on the user's explicit instruction.

## 13. Database Performance and Storage Rules (MANDATORY)

1. DB structures and all services to be written MUST be performant; the most
   performant SQL is written and modern Postgres approaches are used.
2. Schema design: correct data types (uuid, timestamptz, jsonb used where
   appropriate), a normalized structure, foreign keys and necessary
   constraints. Indexes (partial/composite if needed) for frequently queried
   columns are planned from the start.
3. Query rules:
   - N+1 queries are NEVER written; related data is fetched in a single query
     with a join/nested select.
   - Only the needed columns are selected instead of `SELECT *`.
   - Pagination is mandatory in lists (for large lists, keyset/cursor
     pagination is preferred over offset).
   - Bulk operations are done as batch/bulk rather than one by one.
4. For complex read scenarios, views/materialized views are used; for
   multi-step business rules, Postgres functions/RPC are used; logic is kept
   close to the database rather than the client. Counter-like values are
   managed with a trigger/denormalized column rather than COUNT on every
   request.
5. RLS policies are also written with performance in mind (expensive
   subqueries inside policies are avoided; helper functions + indexes are
   used where needed).
6. Critical queries are checked with EXPLAIN; if a slow query is detected,
   the index/query is improved and a note is recorded in CLAUDE.md.
7. If real-time (socket) functionality is needed, Supabase Realtime is used
   and the mode appropriate to the scenario is chosen:
   - Postgres Changes: cases where data written to the DB must appear on
     screen instantly (chat message, order status, notification list) — no
     extra structure is needed because persistence is in the DB.
   - Broadcast: low-latency messages between clients that are not written to
     the DB (typing... indicator, live cursor).
   - Presence: online user / room tracking.
   Free tier limits are observed (200 concurrent connections, 2M messages/month);
   unnecessary channel subscriptions are not opened, and the channel is
   closed when the screen closes. RLS is designed so that it also applies to
   realtime channels. The channel structure and which screen listens to what
   is recorded in CLAUDE.md.
   WebRTC / scenarios requiring ultra-low latency (voice-video calls,
   real-time multiplayer games) are outside the scope of Supabase Realtime;
   if such a need arises, the user is consulted before coding.
8. Storage (R2) usage: access to files is provided via presigned URLs;
   buckets are not made public. Images are optimized before upload
   (resizing/compression, WebP if suitable). File paths are kept in the
   `{entity}/{id}/{file}` layout and the structure is recorded in CLAUDE.md.
   R2 access keys are managed as secrets; signing via the API is done in an
   Edge Function, and the key is NEVER sent to the client.
9. Supabase free tier pause prevention: if the project receives no requests
   for 7 days, it is paused by Supabase. To prevent this, a scheduled (cron,
   once a day) keep-alive workflow is set up in GitHub Actions; it sends a
   simple select request to a lightweight table. The Supabase URL and anon
   key are provided to the workflow via Actions Secrets; they are not written
   in the workflow file. When the workflow is set up, its first run is
   verified and it is recorded in CLAUDE.md.
10. Edge Function security:
   - Every function performs an auth check (JWT verification); anonymous
     access is opened only deliberately and its rationale is written to
     CLAUDE.md.
   - Input validation is mandatory: the incoming body is validated against a
     schema (zod or equivalent); unvalidated input does not reach the DB/R2.
   - Rate limiting is added to functions open to abuse (presigned URL
     generation, notification sending, account deletion) (a per-user request
     limit; with a simple counter table or a token bucket).
   - Presigned URLs are generated short-lived (minutes) and signed together
     with a file size and content-type restriction.
   - The service role key lives ONLY in the Edge Function environment
     variables; it NEVER leaks to the client, logs or error messages.

## 14. Monitoring — Crash and Analytics (MANDATORY)

1. Firebase Crashlytics and Firebase Analytics MUST be installed — this is not
   optional. Setup is done in the project's FIRST phases (not left to the
   last phase) and it is VERIFIED on both platforms (Android + iOS) by
   sending a test crash and a test event to the console. Setup is not
   considered "done" until verified.
2. Crashlytics coverage is COMPLETE: ALL uncaught errors (Flutter framework
   errors, async/zone errors, platform/native errors) are reported to
   Crashlytics. Errors caught with try-catch but important are also logged
   as non-fatal; errors are not silently swallowed. Breadcrumbs/custom logs
   are added to critical flows (auth, purchase, notification, sync) so that
   it can be seen how execution got there at crash time.
3. Crash reports are linked to the user id (Supabase user id) so that it can
   be seen which user was affected during debugging. Sensitive data (email,
   name, token) is NEVER written to crash logs.
4. Analytics events are planned to be COMPREHENSIVE and COMPLETE — the goal:
   to have information about EVERYTHING that happens in the app. No user
   behavior in the app that could inform a product decision goes untracked.
   Mandatory scope:
   - Screens: every screen view (`screen_view` + screen name) and the time
     spent on the screen.
   - Lifecycle: first open (`first_open`), session start, onboarding steps
     (`onboarding_step` + step number, `onboarding_completed`,
     `onboarding_skipped`).
   - Auth: login start/success/failure (with a provider parameter:
     google/apple), logout, account deletion.
   - Core features: the use of EVERY core feature of the app is tracked with
     a separate event (the events are planned when the feature is planned).
   - Revenue funnel: paywall view (with its source: which screen it came
     from), plan selection, `purchase_started`, `purchase_completed`,
     `purchase_failed` (with an error code), `purchase_restored`,
     subscription cancellation signals.
   - Ads: load/impression/click/error events for every format,
     `ad_rewarded_earned`, ad dismissal behaviors.
   - Notifications: permission request/granted/denied, notification tap
     (with a route parameter).
   - Errors/friction: empty result screens, failed searches, form validation
     errors — the places where the user gets stuck must be visible.
5. Event naming standard: snake_case, a consistent verb structure
   (`x_started` / `x_completed` / `x_failed`), parameters also snake_case.
   Firebase limits are respected (event name ≤40 characters, ≤25 parameters
   per event); if data would be lost because of the limits, the design is
   changed.
6. The event list and its parameters are kept as a table in CLAUDE.md and are
   ALWAYS up to date; when a new feature is added, its events are added in
   the same task — a feature without events is not merged. The user is
   reminded that critical conversion events (the purchase funnel) must be
   marked as conversions in Firebase.
7. User properties are also set: subscription status (free/premium), app
   language, whether onboarding is completed, notification permission status
   — so that every analysis can be done with these breakdowns.
8. Debug/development traffic does not pollute analytics: in debug builds,
   analytics collection is kept off or goes to DebugView; it is not mixed
   with real data.
9. This data is used for ad placement, paywall and onboarding optimization;
   conversion must be trackable in important funnels (paywall view →
   purchase, onboarding start → completion).

## 15. Testing, Git, Repo and Versioning Rules (MANDATORY)

1. Unit tests are written for the use cases in the domain layer and for
   critical business rules. Base structures are designed to be testable.
2. Commits follow the Conventional Commits format and are written in
   English. The scope is the app or area that changed: `feat(mobile): …`,
   `fix(panel): …`, `feat(web): …`, `feat(supabase): …` (migration),
   `docs: …`, `chore(release): …`, `ci: …`. A feature that affects more
   than one app is split into separate per-app commits. This keeps each
   app's history and release diff cleanly readable.
3. When EVERY task/feature is completed, a commit that summarizes the work
   accurately and clearly MUST be made. The commit message states clearly
   what the work does (e.g. `feat(mobile): add Google and Apple sign-in flow`).
   Meaningful units of work are committed separately; no giant
   "whole project" commit is made. Unrelated changes are not put in the
   same commit.
4. Repo structure — ONE repo, a separate version per app:
   ```
   <project>/
   ├── apps/mobile/          Flutter (pubspec version, fastlane/, CHANGELOG.md)
   ├── apps/panel/           React + Vite (package.json version, CHANGELOG.md)
   ├── apps/web/             Landing/site (package.json version, CHANGELOG.md)
   ├── packages/             shared TS packages (e.g. supabase-types)
   ├── supabase/             SHARED schema: migrations/, functions/
   ├── hub/ docs/ PLAN.md TODO.md CLAUDE.md
   ├── scripts/release/      release and release-diff scripts
   ├── .github/workflows/    ci.yml + deploy-<app>-*.yml + keepalive
   ├── release.sh            single release entry point
   ├── package.json + pnpm-workspace.yaml   (pnpm workspace: panel + web + packages)
   └── .gitignore .gitattributes
   ```
   - The skeleton is set up from the skill's `assets/repo/` folder. Only
     the apps the user asked for are created; for example, if there is no
     web app, `apps/web` and its workflow are not added.
   - The Node side uses a pnpm workspace. The TS types generated from
     Supabase are kept in one place, `packages/supabase-types`, and shared
     by the panel and the web app.
5. Versioning (SemVer):
   - The mobile version is read from `apps/mobile/pubspec.yaml`
     (`x.y.z+build`); the panel and web versions are read from their own
     `package.json` files. Versions are independent of each other.
   - Breaking change → major, new feature → minor, fix → patch.
   - Only `release.sh` changes the version number; it is never edited by
     hand.
6. TAGS (MANDATORY): every release is an annotated tag —
   `mobile/vX.Y.Z`, `panel/vX.Y.Z`, `web/vX.Y.Z`.
   - Only `release.sh` creates the tag, and only after the store upload or
     build has succeeded. The tag message is that version's CHANGELOG
     section (`git show mobile/v1.2.0`).
   - The tag is pushed to GitHub together with main in a SINGLE ATOMIC push
     (`git push --atomic origin main <tag>`).
   - Tags are IMMUTABLE: they are never deleted, moved, or force-pushed. A
     faulty release is corrected with a new patch release.
7. BACKUP — every tag is a GitHub Release:
   - Mobile: `release.sh` attaches the AAB/IPA uploaded in that release.
     Test releases are marked as pre-release; they are made "latest" after
     `promote`.
   - Web/panel: the deploy workflow attaches `dist.zip`.
   - This way, EVERY published release has both its source (the tag) and
     its binary (the release asset) stored on GitHub.
   - The Android upload keystore also has an offline backup outside the
     repo (the user is reminded of this via a Needs Center entry).
8. Diff between releases:
   - `./release.sh changes <app>`: the commits, file summary, and CHANGELOG
     notes between the last two releases.
   - `./release.sh changes <app> <old-tag> <new-tag>`: a specific range. If
     `HEAD` is given, what has been done since the last release is shown.
   - The mobile and panel diffs also include changes to the shared
     `supabase/` folder.
   - The commands are documented in `docs/RELEASE.md`.
9. Branch strategy — trunk-based:
   - `main` is always releasable. Claude works in small, meaningful
     commits. Risky or long-running work is done on a short-lived
     `feat/<topic>` branch and merged into main after CI passes.
   - There is no force-push to main. A release is cut only from a clean
     main and from a HEAD that contains origin/main; the script enforces
     this.
   - Branch protection for main on GitHub (no force-push/deletion, CI
     required) is recommended; the user configures the setting (Needs
     Center entry).
10. The GitHub repo is created at kickoff: with the user's approval,
   `gh repo create <name> --private --source . --push`. If `gh` is missing
   or not signed in, a Needs Center entry is opened. Until the repo is
   connected, tags accumulate locally; once connected, they are pushed with
   `git push --atomic origin main --tags`.

## 16. CLAUDE.md and Documentation Rules (MANDATORY)

1. CLAUDE.md is an INDEX and ROUTING file, NOT an encyclopedia. Claude Code
   reads this file in full in every session; a bloated CLAUDE.md burns the
   context of every session, slows it down, and degrades quality. Therefore:
   - CLAUDE.md MUST NEVER exceed 400 lines. This limit is absolute, like
     the 300-line file rule; if exceeded, the content is split into
     `docs/`.
   - CLAUDE.md contains only the following: the session start procedure,
     the project summary (one screen), the tool status table, a 10-15 line
     SUMMARY of the rules + a reference to `docs/RULES.md`, and "details are
     in this file" pointers for each topic.
   - EVERYTHING that carries detail goes into a separate .md file and is
     pointed to from CLAUDE.md BY REFERENCE. If a section exceeds 20 lines,
     it does not stay in CLAUDE.md; it is moved to its own file.
2. All of the rules (this document) are written to `docs/RULES.md` and are
   ALWAYS kept up to date; CLAUDE.md references it with the directive "read
   docs/RULES.md for all rules — it is MANDATORY".
3. Standard documentation structure (each is created when needed and
   referenced from CLAUDE.md):
   - `docs/RULES.md` — all of the rules
   - `docs/ARCHITECTURE.md` — layers, folder structure, base structures,
     list of shared components
   - `docs/DB_SCHEMA.md` — the DB schema, as complete as a DUMP: tables,
     columns, types, relationships, indexes, RLS policies. Updated every
     time the schema changes. Migrations are versioned as SQL under
     `supabase/migrations/`.
   - `docs/AUTH.md`, `docs/PUSH.md`, `docs/MONETIZATION.md` (ads +
     RevenueCat), `docs/ANALYTICS.md` (event table), `docs/RELEASE.md`
     (release process + key paths), `docs/CICD.md`, `docs/ADMIN_PANEL.md`,
     `docs/DECISIONS.md` (decision log: date — decision — rationale),
     `docs/ASO.md` (name/id decision, keyword tables, copy, visual
     messages, experiments, ASO log), `docs/SEO.md` (keyword-to-page
     mapping, Lighthouse results, Search Console notes), `docs/OPS.md`
     (post-launch operations setup and autonomy level, Section 18)
   - If needed, a new file is opened for a new topic; its reference is
     added to CLAUDE.md. Core rule: information lives in ONE place and is
     pointed to by reference from elsewhere — the same information is not
     copied into two files.
   - These files are also subject to the 300-line rule; if exceeded, they
     are split into sub-files (e.g. `docs/db/tables-users.md`,
     `docs/db/rls.md`) and the parent file becomes an index.
   - THE ONLY EXCEPTION: `docs/RULES.md`. It is an EXACT copy of the rules
     document in the skill; it is not split, shortened, or reorganized (so
     that, being a copy, it does not fall out of sync with the skill). It
     is not read in full every time; the section relevant to the task at
     hand is found by its "Section N" heading and read.
4. A newly opened session must read CLAUDE.md and know which information is
   in which file; however, it opens only the docs needed for that session's
   work (not all of them). Every important piece of information learned is
   added to the relevant docs file; CLAUDE.md is touched only when the
   routing changes.
   INTERPRETATION RULE: Wherever the phrase "is recorded in CLAUDE.md"
   appears in this document, it means "is written to the relevant docs/
   file and pointed to by reference from CLAUDE.md". No item is to be
   interpreted as writing the detail into CLAUDE.md itself.
5. The to-do file (TODO.md) is MANDATORY:
   - `TODO.md` is kept in the repo root; EVERY task that will be done
     later, postponed, left half-done, or deliberately deferred is written
     here IN DETAIL: what the task is, why it was postponed, which
     files/sections it concerns, its dependencies if any, and its priority
     level (high/medium/low).
   - Entries are written clearly enough that a session with no context can
     read them and understand the task (the same logic as the phase
     definition rule — see Section 17.3).
   - At the start of EVERY new session, TODO.md is READ along with
     CLAUDE.md, and the user is briefly reminded of the pending work (in
     priority order). No new work is started without giving this reminder.
   - When a task is completed it is DELETED from TODO.md (the deletion is
     done in the same commit that completes the task); completed work never
     accumulates in the file.
   - If a new gap is noticed during a task (e.g. "the tablet layout of this
     screen was not done"), it is added to TODO.md immediately; it is not
     kept in mind.
   - CLAUDE.md contains an explicit reference section to TODO.md (with the
     directive "read TODO.md for pending work"), so even a session that
     does not know about the file reaches it through CLAUDE.md.
6. The PROJECT HUB (`hub/`) is MANDATORY — a local, live web interface for
   the plan and for what is expected from the user. Setup and usage details
   are in `hub/README.md`; it is read before the relevant work is done.
   - Setup: the skill's `assets/project-hub/` folder (except examples/) is
     copied into the project as `hub/`, and `hub/config.json` is written.
     It has no dependencies: `node hub/server.mjs --open`. Claude starts
     the server in the background itself and gives the link to the user.
   - PLAN SCREEN: Reads PLAN.md and the docs/plan/phase-XX files live (no
     separate copy is kept). Phase statuses, criteria progress, parallel
     groups, remaining time, and phase details are visible to the user from
     here. For this reason PLAN.md and the phase files follow the format in
     `hub/README.md`, and the done criteria in the phase file are checked
     off AS THE WORK PROGRESSES.
   - NEEDS CENTER: During uninterrupted work (Section 17.7), EVERYTHING
     needed from the user — API keys, service account files, FTP
     credentials, store account access, panel settings, external steps
     requiring approval — is added as a `hub/needs/<id>.json` entry
     WITHOUT STOPPING the work. The user fills in the form on the page and
     submits it.
   - Each entry guides the user as if they had no context at all: what is
     needed, why it is needed, which phase(s) and tasks it is holding up,
     prerequisites, STEP BY STEP where to find it (menu path + direct
     link), values to copy, pitfalls, and form fields with format
     validation. The writing quality rules are in `hub/README.md` and are
     MANDATORY.
   - UPFRONT REQUESTS: When the plan is approved, all foreseeable external
     needs of the phases are opened immediately as entries and linked to
     the phases via the `phases` field. The plan screen highlights the
     missing items of upcoming phases, encouraging the user to fill them in
     before the phase arrives.
   - Every time an entry is added, it is announced EXPLICITLY in the work
     output as a single line in the format: "Added to Needs Center:
     <title> — <link>". It is never added silently.
   - AT EVERY PHASE TRANSITION (and at the start of every session) `node
     hub/server.mjs --status` is run; submitted entries are processed with
     the flow in `hub/README.md`: validated, the value moved to its target
     (env/secrets/keys), the entry marked `processed` (or `rejected` with a
     correction reason), the inbox item deleted, the blocked work
     completed RETROACTIVELY, and the related TODO.md entry closed.
   - Security: values are written only under `hub/inbox/` (which has its
     own .gitignore so it never enters the repo) and are deleted after
     processing. Entry files, commits, logs, and chat output contain NO
     values. The server is reachable only from 127.0.0.1, with a session
     token.
   - Blocked work is also tracked in TODO.md and references the entry id
     ("hub: play-service-account"); the two sides point to each other.
   - CLAUDE.md contains an explicit reference to the Project Hub; in the
     session-start reminder, pending entries are summarized with links as
     "here is what's needed from you".

## 17. Way of Working (MANDATORY)

0. FIRST TASK — CLAUDE.md is created: The first task in a project session,
   before moving on to ANY other work (including asking questions), is
   writing all the rules in this document to docs/RULES.md, a SHORT
   index-style CLAUDE.md that references it (Section 16.1), an empty
   TODO.md, and setting up the Project Hub (hub/, Section 16.6). The order
   is mandatory:
   1) Set up the monorepo skeleton (Section 15.4 — `git init -b main`,
      `assets/repo/`), create docs/RULES.md + CLAUDE.md (index) + TODO.md +
      hub/, make the first commit, connect the GitHub private repo
      (Section 15.10), start the Project Hub server and give the link
   2) Run the tool (MCP/CLI) check — see Section 17.0.1
   3) Ask the questions in Section 17.8, record the answers in CLAUDE.md
   4) Present the plan/phases, get approval
   5) Write the approved plan as the PLAN.md index + docs/plan/phase-XX
      files, open the foreseeable external needs of the phases in the
      Needs Center, and commit (Section 17.3.3, 16.6)
   6) Start the work
   This order guarantees that the rules persist even if the session is cut
   short early. Not a single line of project code is written before
   CLAUDE.md is created.
0.1. The tool (MCP/CLI) check is MANDATORY: Before starting work, check
   whether the connection tools the project will need are available and
   working:
   - Supabase MCP: for DB schema, migration, RLS, and query operations.
   - Firebase CLI: for FCM, Crashlytics, Analytics, and (if selected)
     Hosting deploy operations (`firebase --version` + the session status
     is checked).
   - Chrome MCP (browser automation): for testing the admin panel and the
     website in a real browser, and for steps that need verification in
     the AdMob/RevenueCat/store panels. In store consoles, the account is
     verified before every action, and if there are multiple accounts the
     user is asked (Section 12.8).
   - RevenueCat MCP: for product/entitlement/offering configuration and
     managing the purchase side.
   The check result is reported to the user: which are CONNECTED, which are
   MISSING. For the missing ones, setup/connection is REQUESTED from the
   user — explaining which tool is needed for which task. Work that depends
   on that tool is not faked with the missing tool: either the tool gets
   connected, or the need is written to the Needs Center (Section 16.6),
   the blocked work is written to TODO.md, the user is notified, and work
   continues with tasks that do not require the tool. The available tools
   and their status are recorded in CLAUDE.md; later sessions know from
   this list which tools are usable, and if a tool is still missing at
   session start, the user is reminded again.
1. If you are unsure about a task, you MUST ask questions before
   proceeding; you settle the clarity of the task. HOWEVER, all questions
   are collected and asked AT THE VERY START of the work (see
   Sections 17.6-17.7); no questions are asked once the work has started.
2. For large tasks, first present a short plan and code only after getting
   the user's approval.
3. Phasing rule: If you have divided the project into phases, you write
   EACH PHASE in considerable detail — because the phases will be
   implemented by subagents, and a subagent does not know the context in
   your head. Each phase definition includes:
   - The phase's purpose and scope (what will be done, what will NOT be
     done)
   - Files to be created/changed and the folder structure
   - Base structures, components, and packages to be used
   - Related DB tables / APIs / channel structures
   - Rules to follow (with references to the relevant sections of this
     document: 300-line limit, i18n, theme, back button, etc.)
   - The phase's "done" criteria (including the scenarios to be tested)
   - Dependencies from previous phases and what is handed over to the next
     phase
3.1. CROSS-CUTTING CONCERNS are written into the phase definition
   CONCRETELY — giving only a section reference is INSUFFICIENT. In every
   phase that includes screens/features, the following checklist is filled
   in item by item and its CONTENT is written out explicitly in the phase
   definition (if not applicable, state "none"; it is never silently
   skipped):
   - Analytics events: the event names to be added in this phase, their
     parameters, and on which actions they fire are written as a LIST (per
     the scope of Section 14).
   - Crashlytics: the breadcrumb/non-fatal points to be added to the
     critical flows of this phase.
   - i18n: the text keys to be added in this phase and which languages
     they will be added to.
   - Back button: the back behavior of every screen in this phase.
   - Loading / empty / error / offline: how these states will look for
     every screen in this phase.
   - Ads: whether the screens of this phase have ads; if so, the format,
     placement, and premium exemption.
   - Notifications: whether this phase produces/listens to notifications;
     the payload route and the tap target.
   - RLS/security: the policy impact for the tables this phase touches.
   - Admin panel sync: whether this phase requires a management screen in
     the panel (Section 7.6).
   - CLAUDE.md/TODO.md update: which sections will be updated at the end of
     this phase.
   EXAMPLE — for a "Profile screen" phase, writing only "build the profile
   screen" is FORBIDDEN; it is written with this level of precision:
   "screen_view(screen_name=profile), profile_edit_started,
   profile_edit_completed, avatar_upload_started/
   completed/failed(error_code) events will be added; text keys
   profile_title, profile_edit_button... will be added to the en/tr ARBs;
   back button: warning dialog on unsaved changes; avatar upload via the R2
   presigned URL flow (Section 13.8); this screen has no ads; an avatar
   field will be added to the user detail in the panel."
3.2. When the main session reviews subagent output (Section 17.4), it also
   verifies this checklist: do the events/texts/behaviors defined in the
   phase actually exist in the code? If something is missing, the phase is
   NOT COMPLETE; the next phase is not started until the missing items are
   completed.
3.3. PLAN.md is MANDATORY — the plan lives in a file, not in the chat:
   - After the phases are approved, the plan is written to the repo and
     committed. The plan does not remain a chat message; it is in the repo
     even if the session is cut off.
   - STRUCTURE: `PLAN.md` at the root is the INDEX file (≤200 lines); each
     phase's detailed definition (all the content in Section 17.3 and
     Section 17.3.1) lives in a SEPARATE file: `docs/plan/phase-01-<slug>.md`,
     `phase-02-...`. PLAN.md references each phase; phase details are not
     written into PLAN.md.
   - The PLAN.md index contains a table — phase no, name, status,
     dependencies, parallel group, start, end, duration, file link — and
     below it a statistics block (Section 17.3.4).
   - Statuses: `[ ]` pending, `[~]` in progress (with a note on which
     sub-part is being worked on), `[x]` completed (with date), `[cancelled]`
     with a reason. The done-criteria checkboxes in the phase file are
     checked off AS THE WORK PROGRESSES (the Project Hub shows progress
     live from these; for parallel phases each subagent marks only ITS OWN
     phase file, and only the main session updates PLAN.md). When a phase
     passes review and is completed (Section 17.3.2), the index row is set
     to `[x]` — unlike TODO.md, it is NOT DELETED; the plan remains whole
     as the roadmap and progress record. Format rules (columns, status
     markers, duration units) are in `hub/README.md`.
   - When a task is given to a subagent, the phase definition is supplied
     from the relevant `docs/plan/phase-XX` file — not summarized from the
     chat. This way the plan and the implementation never diverge.
3.4. Phase statistics are MANDATORY: Whenever a phase is completed,
   PLAN.md is updated and a SHORT statistics summary is given to the user:
   - This phase's duration (start → end; subagent working time and
     review/fix time separately).
   - Overall progress: completed / total phases and the percentage.
   - Estimated remaining time: a rough estimate for the remaining phases,
     calculated from the average duration of the completed phases and the
     estimated size of the remaining phases (parallel-running groups are
     taken into account).
   - The number of entries added to TODO.md / the Needs Center in this
     phase, and, if there are pending needs, a reminder with their link.
   The summary does not exceed 5-8 lines; the detail is kept in PLAN.md's
   statistics block. When the plan is approved, an initial duration
   estimate is written for each phase; the actual duration is added next
   to it so that estimate quality improves over time.
   - If the plan changes (a phase is added/split/scope changed), PLAN.md is
     updated and committed with the reason for the change; the old phase is
     not deleted, a "cancelled — reason" note is added.
   - At the start of EVERY session, the PLAN.md index is READ along with
     CLAUDE.md and TODO.md (not the phase files — only the file of the
     phase being worked on is opened); the user is given a summary of
     "these phases are done, the next one is this, estimated remaining
     time is this", and work resumes from where it left off. CLAUDE.md
     contains an explicit reference to PLAN.md.
   - Clarity of division of work: PLAN.md is the main roadmap; work that
     arises outside the plan or is postponed goes to TODO.md (Section 16.5);
     released versions are written to CHANGELOG.md (Section 12.4).
   A phase definition must be clear enough that a subagent reading it with
   no additional context can do the work completely and correctly.
4. Phases are executed with subagent workflows: each phase (or suitable
   sub-parts of a phase) is given to a subagent as a task. The main session
   does orchestration, code review, and the integrity check between
   phases; a phase is not considered complete until the subagent output has
   been reviewed for compliance with the rules (architecture, 300 lines,
   i18n, theme).
4.1. PARALLEL WORK IS MANDATORY — for speed, phases that do not block each
   other are run at the same time:
   - During planning, a DEPENDENCY GRAPH between phases is produced: for
     each phase, "depends on" and "blocks" are written. Phases that have no
     dependencies or that depend on the same predecessors form a PARALLEL
     GROUP (the "parallel group" column in the PLAN.md index).
   - The phases in a parallel group are given to separate subagents AT THE
     SAME TIME; they are not done sequentially. E.g. once the base
     infrastructure is done, "Auth screens", "Onboarding", "Admin panel
     skeleton", and "Landing page" are mostly independent of each other and
     run in parallel.
   - Parallel phases DO NOT COLLIDE: each phase works in its own feature
     folder/its own files; if there is a need to touch shared files
     (router, DI, theme, ARB, DB migration), this is written in advance in
     the phase definition and merged by the main session in the integration
     step. Two subagents never modify the same file at the same time.
   - At the end of each parallel group there is a short INTEGRATION step:
     the main session merges the outputs, runs the build, resolves
     conflicts, performs the review (Section 17.3.2) at the group level,
     then moves on to the next group.
   - Even though phases are independent, the base infrastructure phase
     (base structures, theme, router, i18n skeleton, DB schema) is
     completed BEFORE EVERYTHING ELSE and on its own; everything else
     depends on it. This phase is kept as small as possible so that
     parallelization starts early.
   - The parallel group structure is presented to the user along with the
     plan; the information "these 5 phases will run at the same time" is
     also reflected in the estimated duration.
5. When running a subagent (Task/sub-task agent), you use SONNET as the
   model; opus is not assigned to subagents. This preference is for the
   cost/speed balance and applies to all subagent tasks.
6. Questions are asked AT THE START: ALL questions and approvals about the
   plan and phases, including the list in Section 17.8 (ad placement plan,
   ASO keywords, bundle id, etc.), are collected and asked of the user in
   one go before the project starts. The work starts after the answers are
   received and recorded in CLAUDE.md.
7. NO QUESTIONS are asked at phase transitions: Unless the user specified
   otherwise, there is no stopping for approval/questions between phases;
   the plan is executed UNINTERRUPTED to the END. If a serious
   unforeseen obstacle arises in a phase (situations that make progress
   impossible, such as missing access credentials or a conflicting
   requirement), that task is not skipped or faked; the need is written to
   the Needs Center (Section 16.6), the task is linked in TODO.md, and work
   continues UNINTERRUPTED with tasks that do not require the tool/information.
   The user is asked only if the ENTIRE project is blocked, and the
   situation is explained with its reasoning. EXCEPTION: if there is
   account ambiguity in a store console, always stop and ask
   (Section 12.8). No stopping for aesthetic or preference-based decisions;
   the best decision is made according to the rules in this document, and
   the decisions made are reported to the user at the end of the work.
8. Things to ask the user before starting the project (the answers are
   recorded in CLAUDE.md):
   - Web presence: landing page, full site, or both? (Section 6)
   - Admin panel deploy target: Hostinger or Firebase Hosting? (Section 7)
   - Admin panel login method and admin accounts (Section 5.4)
   - Is the project global, what are the target languages/markets? Which
     languages will the app support? What should the default language be?
     (Sections 2.5, 11.4, and 12.2 — i18n and store metadata are set up
     according to these languages)
   - Approval of the ad placement plan (Section 8.5)
   - Approval of the push notification strategy — retention plan,
     notification types, and frequency (Section 9.5)
   - Target countries/stores and known competitor apps (Section 11.1)
   - Is there a brand name idea; is a domain available, which one?
     (Sections 8.4, 10)
   - Approval of ASO keyword suggestions and app name/package name
     candidates — with the uniqueness check already done (see
     Sections 11.1 and 8.4)
   - Approval of SEO target keywords (Section 10.4)
   - Publishing accounts: which Play Console and which Apple Developer
     account? (Obtained via the Needs Center `store-accounts` entry —
     Section 12.8)
   - If storage is needed: R2 or Supabase Storage (Sections 1 and 13.8)
   - If the web deploy target is Hostinger, is FTPS supported?
     (Section 12.6)
   - Post-launch operations: daily routine on or off, and its autonomy
     level (Section 18.2)
   ACCESS CREDENTIALS (FTP password, R2 keys, API keys, store account
   files) are NOT REQUESTED in chat — they are opened as a Needs Center
   entry (Section 16.6); questions are only for decisions and approvals.

## 18. Post-launch Operations (MANDATORY when enabled)

1. Scope and opt-in: after the first production release, an optional daily
   operations routine keeps the app healthy and growing: crashes, store
   vitals, analytics, reviews and ASO. It is chosen at kickoff (Section
   17.8) or turned on later. The choice and its autonomy level are written
   to `docs/OPS.md` and `ops/config.json`.
2. Autonomy levels (the user picks one; the default is `fix-to-testing`):
   - `observe`: collect data, add crash notes, write the report. No code
     changes, releases, store text changes or review replies.
   - `fix-to-testing` (default): also fixes data-proven problems and ships
     them ONLY to the test tracks (`./release.sh mobile all internal`).
     Promotion to production, ASO text changes and replies to 1-2 star
     reviews are prepared and listed for the user to approve.
   - `full-auto`: also promotes, edits ASO text and replies to every review,
     but only through the gates of Section 18.5. The hard limits of Section
     18.8 apply at every level.
3. Scheduling and safety:
   - The routine runs as a LOCAL scheduled task (e.g. Claude desktop
     scheduled tasks), because builds and releases need the local
     toolchain, simulators and keys. A cloud routine is allowed only for
     `observe`.
   - Configuration lives in `ops/config.json` (store, Firebase and analytics
     IDs, autonomy, thresholds, notification channel). The routine prompt
     (template: `DAILY_OPS.template.md`) holds decision logic only, no
     hard-coded IDs or paths.
   - A lock file (`ops/.lock`, with the start time) prevents overlapping
     runs; a lock older than 6 hours is treated as stale and reported.
   - If the working tree is not clean, another session may be working: only
     collect data and report; no code changes, commits or releases.
   - Shared devices are respected: an emulator or simulator started by
     another routine is never closed.
4. Data first:
   - Data collection is deterministic (scripts, CLI or MCP calls that output
     JSON); judgement comes after. Every claim in the report rests on a
     number and its source; generic advice is forbidden.
   - Sources: Crashlytics (fatal, non-fatal and ANR per platform and
     version), Google Play Android vitals (Play Developer Reporting API:
     user-perceived crash and ANR rates), App Store Connect diagnostics,
     analytics funnels (Section 14), both stores' reviews and ratings, ASO
     rankings.
   - Robot traffic is excluded: Apple review devices on review day, Play
     pre-launch and Test Lab devices, emulators. Human users are counted
     separately; below 30 humans no ratios or funnels are interpreted.
   - Daily metrics are appended to `ops/metrics.jsonl` (one JSON line per
     day) so trends stay comparable; the Project Hub Operations tab reads it.
5. Release gates (every level):
   - A release happens only for a user-affecting, data-proven fix or a
     measurable improvement; at most one release per day; never for
     cosmetic changes, refactors or docs.
   - Before shipping, code changes are reviewed adversarially by at least
     two independent subagents (correctness/regression, platform/i18n);
     `flutter analyze` and `flutter test` must pass, with a test that
     reproduces the bug.
   - Builds go to the test tracks first. Promotion to production requires a
     soak period (default 24 h, set in `ops/config.json`) with no new crash
     cluster in that build.
   - Production is staged: Play starts at `PLAY_ROLLOUT` (default 20%) and
     is widened with `./release.sh rollout 0.5`, then `1`; iOS uses the
     7-day phased release.
   - Automatic stop: if the new version's crash-free users fall below the
     SLO of Section 18.6 or a regression appears, run `./release.sh halt`
     at once, report it, and fix forward.
6. Crash handling (the most important step):
   - SLO: crash-free users ≥ 99.5% per platform; Play user-perceived crash
     rate < 1.09% and ANR rate < 0.47% (Section 11.6).
   - Regressions (a closed issue back in a new version) come first.
   - Every issue looked at gets one note per day in Crashlytics ("Reviewed
     <date> (daily ops): <root cause> → <action>"); existing notes are
     listed first to avoid duplicates.
   - Human-affecting crashes are fixed the same day within the autonomy
     level. When the fix is live, the issue gets a "resolved in <version>,
     commit <hash>" note and is closed.
7. Reviews:
   - Replies are written in the review's language: short, calm and
     thankful. They never promise unreleased work, never ask for personal
     data and never argue. A review is answered once.
   - A reported bug is reproduced and, if real, fixed through the flow of
     Section 18.6.
   - Replies to 1-2 star reviews are published automatically only at
     `full-auto`; otherwise they are drafted and listed for the user.
   - Every sent reply is recorded in the report.
8. Hard limits (never automated at any level; listed for the user instead):
   - prices, subscriptions and in-app products; store account, payment, tax
     and user or permission settings;
   - privacy declarations (Play Data safety, App Privacy), and therefore any
     change that collects a new data type;
   - signing keys, certificates and keystores; toolchain upgrades pinned by
     CI; `git push --force`; removing features; entering credentials.
9. ASO experiments (Section 11):
   - One field and one language group per week, so the effect is measurable.
   - The baseline is the 7-day average before the change and the result is
     the 7-day average after it; both go to the experiment log in
     `docs/ASO.md`.
   - Screenshot and icon tests use Apple Product Page Optimization and Play
     store listing experiments instead of direct swaps.
10. Weekly review (Mondays): 28 days of data, this week vs last week, at
   most five actions (why = which number, measured by = which event, which
   file), last week's actions checked, missing logging listed, ASO trend and
   a competitor scan; written to `docs/ops/weekly-YYYY-MM-DD.md`.
11. Reporting:
   - Daily report `docs/ops/daily/YYYY-MM-DD.md` with fixed sections:
     Summary, Numbers (last 7 days vs previous 7), Crashes, Reviews, ASO,
     Development, Release, Needs from the user, Tomorrow.
   - A three-line summary is sent as a notification (desktop or phone push,
     or a connected Slack channel) so the owner sees it without opening
     files.
   - Anything only the user can do becomes a Needs Center record (Section
     16.6), not just a line in the report.
   - On days without a release, nothing that triggers a store build is
     pushed (use `[ci skip]` where CI builds the mobile app).
12. Cost: quiet days (no new crash, review or release) finish with a single
   agent. Multi-agent work is used only for root-cause analysis, code review
   and the weekly review, and the report says which mode was used.
