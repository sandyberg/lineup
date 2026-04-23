#!/usr/bin/env bash
# Open Lineup on a tvOS simulator with NO build and NO "expo run:ios" (no Xcode).
# Only: boot sim + simctl launch. Use after you've installed the app at least once
# (full: EXPO_TV=1 npx expo run:ios -d <UDID> or npm run run:tv:sim).
#
#   LINEUP_TV_SIM_UDID=... npm run ios:tv:open
# Start Metro yourself: npm run start:8082
set -euo pipefail
BUNDLE_ID="${LINEUP_BUNDLE_ID:-com.sandyberg.lineup}"
if [[ -n "${LINEUP_TV_SIM_UDID:-}" ]]; then
  UDID="$LINEUP_TV_SIM_UDID"
else
  LINE=$(xcrun simctl list devices available 2>/dev/null | grep "Apple TV" | head -1) || true
  if [[ -z "$LINE" ]]; then
    echo "Set LINEUP_TV_SIM_UDID, or add an Apple TV in Xcode → Devices and Simulators."
    exit 1
  fi
  UDID=$(echo "$LINE" | grep -oE '[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}' | head -1)
fi
if [[ -z "$UDID" ]]; then
  echo "Could not resolve Apple TV simulator UDID."
  exit 1
fi
xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator
echo "==> Launching $BUNDLE_ID (no Xcode / no expo run:ios build)"
if ! xcrun simctl launch "$UDID" "$BUNDLE_ID" 2>/dev/null; then
  echo "Launch failed. Install once, then re-run: EXPO_TV=1 npx expo run:ios -d \"$UDID\""
  exit 1
fi
