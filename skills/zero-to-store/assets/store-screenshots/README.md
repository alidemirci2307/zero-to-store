# Store screenshots — automated, multilingual generation (RULES.md Section 11.3)

Raw screens are captured from the app. A modern device frame and the localized headline
are added to them, then a JPEG is produced for every store size. Outputs are written to
the folders fastlane uploads from and ship with the release. The same commands run for
every language; nothing is designed by hand.

```
capture.sh  ──>  build/screenshots/raw/<lang>/<device>/<name>.png
render.mjs  ──>  fastlane/screenshots/<ios-locale>/NN_<target>.jpg
                 fastlane/metadata/android/<locale>/images/phoneScreenshots/NN.jpg
                 fastlane/metadata/android/<locale>/images/featureGraphic.jpg
                 build/screenshots/preview.html   (review page for everything)
```

## Setting up in the project (paths are relative to the `apps/mobile/` root)
| Skill file | Location in the project |
|---|---|
| `capture.sh`, `render.mjs`, `frame.css`, `screenshots.config.json` | `tool/store_screenshots/` |
| `store_screenshots_test.dart.template` | `integration_test/store_screenshots_test.dart` (fill in `{{PAKET_ADI}}`) |
| `integration_test_driver.dart.template` | `test_driver/integration_test.dart` |

`pubspec.yaml` → `dev_dependencies: integration_test: { sdk: flutter }`.
Requirements: Node 18+ and Google Chrome. If Chrome is somewhere else, pass its path
via `CHROME_PATH`. There are no other dependencies.

## Demo mode (app side)
```dart
const kDemoMode = bool.fromEnvironment('DEMO_MODE');
const kScreenshotLocale = String.fromEnvironment('SCREENSHOT_LOCALE');
// MaterialApp: locale: kDemoMode ? Locale(kScreenshotLocale) : null,
//              debugShowCheckedModeBanner: false
// ProviderScope overrides (kDemoMode only): demo repositories (realistic, made-up data),
//   ad service = no-op, session = demo user, onboarding/permission prompts = skipped
```
- Demo data looks natural in every language: recipe names and people's names are
  written in that language, and contain no personal data.
- Screens are navigated via `Key('screenshot_<name>')` keys, not looked up by text.
- The raw image has no system status bar. `render.mjs` draws a clean one (9:41, full
  battery). The top of the screen must remain the app background (SafeArea).

## Settings — `screenshots.config.json`
- `brand`: `background` (two-color gradient), `text`, `accent` (highlight), `font`.
  Values are taken from the app theme.
- `locales`: canonical language → `ios` / `android` locale code. Identical to the
  Fastfile `LOCALES`, one to one.
- `capture`: raw device name → iOS simulator name (a 6.9" model, e.g. "iPhone 17 Pro
  Max") or Android emulator id.
- `targets`: the sizes to produce. Each target has:
  - `store`: `ios` / `android`
  - `device`: `iphone` / `ipad` / `android` (frame type)
  - `raw`: the raw device folder to use
  - `width`, `height`
  - `playType`: `phoneScreenshots` / `sevenInchScreenshots` / `tenInchScreenshots`
  - `deviceWidth`: frame width (vw)

  If iPad is supported, add `{ "id": "ipad13", "store": "ios", "device": "ipad", "raw":
  "ipad", "width": 2064, "height": 2752, "deviceWidth": 84 }`.
- `slides`: the order is the store order. At least 3 slides on iOS and at least 4 on
  Play. Fields:
  - `raw`: raw screen name
  - `title`: language → text. `*word*` takes the accent color.
  - `subtitle`, `eyebrow`: optional small label
  - `theme`: per-slide colors
  - `statusBar`: `dark` / `light` / `none`
  - `titleSize`: to shrink the headline in longer languages (vw)
- `featureGraphic`: the 1024×500 promo graphic for Play (title, subline, icon path).

## Running
```bash
tool/store_screenshots/capture.sh          # all languages × devices (needs a simulator/emulator)
node tool/store_screenshots/render.mjs     # all images (~1 s / image, 4 in parallel)
node tool/store_screenshots/render.mjs --lang tr --target ios69   # a single language / target
```
Then open `build/screenshots/preview.html`, check every language and show the images
to the user. Finally run `fastlane check_metadata strict:true`; it catches image counts
and missing languages.

## Writing headlines (ASO)
- Each image conveys a single benefit, and the headline is 2-5 words. The first 3 images
  convey the app's core value, because those are the ones shown in search results.
- Headlines are written with the keywords of that language (`docs/ASO.md`); this is
  localization, not translation. In longer languages (German, Russian…) reduce
  `titleSize`.
- Images are real app screens (Apple 2.3.3); no ads are visible. Phrases like "#1" or
  "best" are not used.
