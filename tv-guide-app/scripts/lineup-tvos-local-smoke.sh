#!/usr/bin/env bash
# Local tvOS smoke: prebuild → pods → xcodebuild → print Info.plist keys.
# Run this BEFORE another paid EAS build when debugging native plist / signing.
#
# Prereq: Xcode → Settings → Components (or Platforms) → install **tvOS** for your Xcode version.
# If `pod install` fails on Apple Silicon (ffi / arch errors), this script retries under Rosetta.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export EXPO_TV=1
export CI=1

echo "==> expo prebuild (ios)"
npx expo prebuild --platform ios --no-install

echo "==> pod install"
cd ios
if ! pod install 2>/dev/null; then
  echo "    (retry) arch -x86_64 pod — your default pod/Ruby may be x86_64-gem on arm64"
  COCOAPODS_DISABLE_STATS=1 arch -x86_64 "$(command -v pod)" install
fi
cd "$ROOT"

DERIVED="$(mktemp -d /tmp/lineup-tvos-dd.XXXXXX)"
trap 'rm -rf "$DERIVED"' EXIT

echo "==> xcodebuild (tvOS Simulator, no code signing)"
echo "    derived: $DERIVED"
# Adjust -sdk / destination if your Xcode only has a different tvOS version installed.
xcodebuild \
  -workspace ios/Lineup.xcworkspace \
  -scheme Lineup \
  -configuration Debug \
  -sdk appletvsimulator \
  -destination 'generic/platform=tvOS Simulator' \
  -derivedDataPath "$DERIVED" \
  build \
  CODE_SIGNING_ALLOWED=NO

# Prefer the final Products path (find order can pick an intermediate bundle with a stale Info.plist)
APP="${DERIVED}/Build/Products/Debug-appletvsimulator/Lineup.app"
if [[ ! -d "$APP" ]]; then
  APP="$(find "$DERIVED" -path '*/Build/Products/*/Lineup.app' -type d 2>/dev/null | head -1 || true)"
fi
if [[ -z "${APP}" || ! -d "$APP" ]]; then
  echo "ERROR: Lineup.app not found under $DERIVED"
  exit 1
fi

echo ""
echo "==> Info.plist (altool -t appletvos: CFBundlePrimaryIcon must be string brand-asset name)"
plutil -p "$APP/Info.plist" | grep -E 'CFBundleIconName|CFBundleSupportedPlatforms' || true
if python3 -c "
import sys, plistlib
p = sys.argv[1]
want = 'App Icon - Small'
d = plistlib.load(open(p, 'rb'))
c = d.get('CFBundleIcons')
if c is None or isinstance(c, str):
  sys.exit(1)
if not isinstance(c, dict):
  sys.exit(1)
pri = c.get('CFBundlePrimaryIcon')
if pri != want:
  sys.exit(1)
print('    CFBundleIcons: CFBundlePrimaryIcon string matches brand asset — OK for App Store upload')
" "$APP/Info.plist" 2>/dev/null; then
  :
else
  echo "    CFBundleIcons: INVALID or missing — run: EXPO_TV=1 npx expo prebuild --platform ios, pod install, rebuild (plugin out of date?)"
  python3 -c "import plistlib, pprint, sys; d=plistlib.load(open(sys.argv[1],'rb')); pprint.pprint(d.get('CFBundleIcons'), width=100)" "$APP/Info.plist" 2>/dev/null || true
  exit 1
fi
echo ""
echo "OK: built $APP"
echo "    Open Workspace: $ROOT/ios/Lineup.xcworkspace"
