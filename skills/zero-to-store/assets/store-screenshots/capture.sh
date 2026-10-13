#!/usr/bin/env bash
# tool/store_screenshots/capture.sh — captures raw screens for EVERY LANGUAGE and device (DEMO_MODE)
#   tool/store_screenshots/capture.sh            -> all languages × devices in the config
#   tool/store_screenshots/capture.sh tr iphone  -> one language, one device
# Output: build/screenshots/raw/<lang>/<device>/<name>.png  -> then: node tool/store_screenshots/render.mjs
# Devices are in the "capture" field of screenshots.config.json: iOS simulator name or Android emulator id.
set -euo pipefail
cd "$(dirname "$0")/../.."
CONFIG=tool/store_screenshots/screenshots.config.json
json() { node -e "const c=require('./$CONFIG'); $1"; }

LANGS=${1:-$(json "console.log(Object.keys(c.locales).join(' '))")}
DEVICES=${2:-$(json "console.log(Object.keys(c.capture).join(' '))")}

for device in $DEVICES; do
  target=$(json "console.log(c.capture['$device'] || '')")
  [[ -z "$target" ]] && { echo "ERROR: capture.$device is not in the config"; exit 1; }
  # Boot the iOS simulator if it is off (the Android emulator must already be running: flutter emulators --launch <id>)
  if xcrun simctl list devices available 2>/dev/null | grep -q "$target ("; then
    xcrun simctl boot "$target" 2>/dev/null || true
  fi
  for lang in $LANGS; do
    echo ">> $device / $lang ($target)"
    SCREENSHOT_LOCALE="$lang" SCREENSHOT_DEVICE="$device" flutter drive \
      --driver=test_driver/integration_test.dart \
      --target=integration_test/store_screenshots_test.dart \
      -d "$target" \
      --dart-define=DEMO_MODE=true --dart-define=SCREENSHOT_LOCALE="$lang"
  done
done
echo ">> Raw screens ready: build/screenshots/raw/  ->  node tool/store_screenshots/render.mjs"
