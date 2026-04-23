#!/usr/bin/env bash
# "Expo run:ios" has NO --no-build. This uses: expo run:ios --binary <.app> -d <UDID>
# so Xcode does not recompile—only install + start Metro. For zero Xcode use ios:tv:open.
#
# Prereq: a tvOS Lineup.app in DerivedData from a full build, e.g.:
#   EXPO_TV=1 npx expo run:ios -d <UDID>
# (smoke:tv:ios deletes its temp build — it won't leave a .app to reuse.)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export EXPO_TV=1

find_newest_lineup() {
  find "$HOME/Library/Developer/Xcode/DerivedData" \( \
    -path "*/Build/Products/Debug-appletvsimulator/Lineup.app" -o \
    -path "*/Build/Products/Release-appletvsimulator/Lineup.app" \
  \) -type d 2>/dev/null | while IFS= read -r d; do
    [[ -d "$d" ]] || continue
    echo "$(stat -f%m "$d" 2>/dev/null)	$d"
  done | sort -rn | head -1 | cut -f2-
}

APP="${LINEUP_TV_APP_BUNDLE:-$(find_newest_lineup)}"
if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "No tvOS simulator Lineup.app in ~/Library/Developer/Xcode/DerivedData."
  echo "Build once, then re-run this script:"
  echo "  cd tv-guide-app && EXPO_TV=1 npx expo run:ios -d   # pick an Apple TV simulator"
  exit 1
fi

if [[ -n "${LINEUP_TV_SIM_UDID:-}" ]]; then
  UDID="$LINEUP_TV_SIM_UDID"
else
  LINE=$(xcrun simctl list devices available 2>/dev/null | grep "Apple TV" | head -1) || true
  if [[ -z "$LINE" ]]; then
    echo "No available Apple TV simulator. Install a tvOS runtime: Xcode → Settings → Components."
    exit 1
  fi
  UDID=$(echo "$LINE" | grep -oE '[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}' | head -1)
  if [[ -z "$UDID" ]]; then
    echo "Could not parse simulator UDID from: $LINE"
    exit 1
  fi
fi

xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator

echo "==> App bundle:  $APP"
echo "==> Simulator:   $UDID"
echo "==> (no rebuild — installing binary + starting Metro if needed)"
exec npx expo run:ios --binary "$APP" -d "$UDID"
