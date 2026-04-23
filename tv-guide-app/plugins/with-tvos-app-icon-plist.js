/**
 * tvOS: ensure Info.plist icon keys match what App Store Connect expects.
 *
 * Problem: Xcode / actool can merge invalid CFBundleIcons (mixed sources → 90039).
 * Prebuild can fix the template plist, but the asset-catalog pass rewrites the
 * built .app (90039 / 90713).
 *
 * We set CFBundleIconName and CFBundleIcons.CFBundlePrimaryIcon to the *string*
 * brand-asset set name: "App Icon - Small" (@react-native-tvos/config-tv). A Run
 * Script rewrites the built .app Info.plist after actool so the value survives
 * archive and signing. App Store / Content Delivery (altool -t appletvos) requires
 * CFBundlePrimaryIcon to be a *string*; a dict w/ CFBundleIconFiles is rejected
 * (409 type mismatch / missing string). Bad actool *merges* (mixed iOS + TV icons)
 * still produce 90039; our script runs *after* actool and overwrites with the
 * canonical string.
 * The script runs when SDKROOT matches *AppleTVSimulator* or *AppleTVOS* (device + simulator).
 *
 * CocoaPods appends shell phases (e.g. [CP] Embed Pods Frameworks) *after* prebuild
 * rewrites the xcodeproj, so that script can run *after* our PlistBuddy fix. We
 * inject a Podfile post_install step that reorders the fix phase to the end of
 * the app target (after all [CP] phases) and save the project, so the fix runs
 * last before signing.
 *
 * We also remove `ios.icon` (Expo `expo.icon` / iOS icon assets) for EXPO_TV=1.
 * Keeping it alongside @react-native-tvos/config-tv TVAppIcon led actool to merge
 * CFBundleIcons with CFBundlePrimaryIcon as a string (ASC 90039). TV icons come
 * only from the TV brand asset catalog.
 *
 * This plugin is registered *after* `@react-native-tvos/config-tv` in app.json.
 * config-tv sets ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS=YES, which
 * (with Xcode 16 + brand assets) can yield an invalid CFBundleIcons merge.
 * We set it to NO by patching `project.pbxproj` in the *podfile* mod (prebuild
 * runs xcodeproj before podfile), so the write happens after the last xcode write.
 */
const fs = require('fs');
const path = require('path');

const { withInfoPlist, withXcodeProject, withPodfile, IOSConfig } = require('expo/config-plugins');

const TV_PRIMARY_ICON_NAME = 'App Icon - Small';
const XCODE_BUILD_PHASE_NAME = '[lineup] Fix tvOS App Store Info.plist (CFBundleIcons)';

function isAppleTVPlist(plist) {
  const platforms = plist.CFBundleSupportedPlatforms;
  if (Array.isArray(platforms) && platforms.includes('AppleTVOS')) {
    return true;
  }
  const fam = plist.UIDeviceFamily;
  if (Array.isArray(fam) && fam.includes(3)) {
    return true;
  }
  if (plist.TVTopShelfImage != null) {
    return true;
  }
  return false;
}

/**
 * Healthy tvOS store plist: CFBundlePrimaryIcon is the *string* "App Icon - Small"
 * (brand asset). Wrong dict merges from actool (90039) and dict+CFBundleIconFiles
 * from earlier fixes (409 with altool -t appletvos) are both "broken" until
 * the run script overwrites. CFBundleIconName is also required (90713).
 */
function hasBrokenAppIconPlist(plist) {
  const ci = plist.CFBundleIcons;
  if (ci == null) {
    return true;
  }
  if (typeof ci === 'string') {
    return true;
  }
  if (typeof ci !== 'object') {
    return true;
  }
  const pri = ci.CFBundlePrimaryIcon;
  if (pri === TV_PRIMARY_ICON_NAME) {
    return false;
  }
  return true;
}

/**
 * The xcodeproj mod (precedence -1) finishes before the podfile mod (0). @react-native-tvos
 * config-tv still ends up with ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS=YES in the
 * written pbx; mutating the in-memory project in our withXcodeProject is not always last in
 * the mod pipeline. Patching the file on disk in the podfile mod guarantees YES→NO.
 */
function patchPbxIncludeAllAppIconAssetsToNo(projectRoot) {
  if (!projectRoot) {
    return;
  }
  const name = IOSConfig.XcodeUtils.getProjectName(projectRoot);
  const pbxPath = path.join(projectRoot, 'ios', `${name}.xcodeproj`, 'project.pbxproj');
  if (!fs.existsSync(pbxPath)) {
    return;
  }
  let s = fs.readFileSync(pbxPath, 'utf8');
  let out = s.replace(
    /ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES;/g,
    'ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO;',
  );
  if (!out.includes('INFOPLIST_ENABLE_CFBUNDLEICONS_MERGE')) {
    out = out.replace(
      /ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO;/g,
      'ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO;\n\t\t\t\tINFOPLIST_ENABLE_CFBUNDLEICONS_MERGE = NO;',
    );
  }
  if (out !== s) {
    fs.writeFileSync(pbxPath, out);
  }
}

/**
 * xcode pbx encodes shellScript like pbxShellScriptBuildPhaseObj in cordova-xcode.
 * @param {import('xcode').XcodeProject} project
 * @param {string} body
 * @returns {boolean} true if an existing [lineup] phase was updated
 */
function upsertPlistFixShellScriptInPbxProject(project, body) {
  const section = project?.hash?.project?.objects?.PBXShellScriptBuildPhase;
  if (!section || typeof section !== 'object') {
    return false;
  }
  const esc = (s) => `"${s.replace(/"/g, '\\"')}"`;
  let updated = false;
  for (const key of Object.keys(section)) {
    if (key.includes('_comment')) {
      continue;
    }
    const phase = section[key];
    if (!phase || phase.isa !== 'PBXShellScriptBuildPhase') {
      continue;
    }
    const nm = phase.name != null ? String(phase.name) : '';
    if (!nm.includes('lineup') || !nm.includes('CFBundleIcons')) {
      continue;
    }
    phase.shellPath = '/bin/sh';
    phase.shellScript = esc(body);
    phase.alwaysOutOfDate = 1;
    phase.showEnvVarsInLog = 0;
    updated = true;
  }
  return updated;
}

/**
 * @param {import('xcode').XcodeProject} project
 */
function addFixPlistBuildPhase(project) {
  const { uuid: targetUuid } = project.getFirstTarget() || {};
  if (!targetUuid) {
    return;
  }
  // Must match the catalog name in @react-native-tvos/config-tv (withTVAppleIconImages).
  const iconName = TV_PRIMARY_ICON_NAME;
  const shellScript = `# Run for tvOS device and simulator. Prefer SDKROOT (always set) — PLATFORM_NAME is not always exported to Run Script.
case "\${SDKROOT}" in
  *AppleTVSimulator*|*AppleTVOS*) ;;
  *) exit 0 ;;
esac
# Primary fix: python plistlib rewrites the plist (survives malformed CFBundleIcons merges).
# Debug: set LINEUP_DEBUG_TVOS_INFOPLIST=1 (e.g. in eas.json for production_tv_ios) to log paths.
if [ "\${LINEUP_DEBUG_TVOS_INFOPLIST}" = "1" ]; then
  echo "lineup-tvos-info-plist: BUILT_PRODUCTS_DIR=\${BUILT_PRODUCTS_DIR} TARGET_BUILD_DIR=\${TARGET_BUILD_DIR} CODESIGNING_FOLDER_PATH=\${CODESIGNING_FOLDER_PATH} WRAPPER_NAME=\${WRAPPER_NAME} CONFIGURATION=\${CONFIGURATION}" >&2
fi
lineup_tvos_fix_plist() {
  _pl="\$1"
  [ -f "\$_pl" ] || return 0
  if command -v python3 >/dev/null 2>&1; then
    if python3 -c 'import os, sys, plistlib; p, icn, dbg = (sys.argv[1], sys.argv[2], os.environ.get("LINEUP_DEBUG_TVOS_INFOPLIST") == "1");
try:
  f = open(p, "rb")
  d = plistlib.load(f)
  f.close()
  had = "CFBundleIcons" in d
  d["CFBundleIcons"] = {"CFBundlePrimaryIcon": icn}
  d["CFBundleIconName"] = icn
  f = open(p, "wb")
  plistlib.dump(d, f, fmt=plistlib.FMT_BINARY)
  f.close()
  if dbg:
    print("lineup-tvos-info-plist: fixed", p, "had_CFBundleIcons=", had, file=sys.stderr)
except Exception as e:
  if dbg:
    print("lineup-tvos-info-plist: python failed", p, e, file=sys.stderr)
  sys.exit(1)
' "\$_pl" "${iconName}"; then
      return 0
    fi
  fi
  if command -v plutil >/dev/null 2>&1; then
    plutil -remove "CFBundleIcons" "\$_pl" 2>/dev/null || true
  fi
  if /usr/libexec/PlistBuddy -c "Print :CFBundleIcons" "\$_pl" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Delete :CFBundleIcons" "\$_pl" 2>/dev/null || true
  fi
  if /usr/libexec/PlistBuddy -c "Add :CFBundleIcons dict" "\$_pl" 2>/dev/null; then
    /usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon string '${iconName}'" "\$_pl" 2>/dev/null || true
  fi
  if ! /usr/libexec/PlistBuddy -c "Print :CFBundleIconName" "\$_pl" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Add :CFBundleIconName string 'App Icon - Small'" "\$_pl" 2>/dev/null || true
  else
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconName 'App Icon - Small'" "\$_pl" 2>/dev/null || true
  fi
}
lineup_tvos_sweep() {
  for ROOT in "\${BUILT_PRODUCTS_DIR}" "\${TARGET_BUILD_DIR}" "\${CONFIGURATION_BUILD_DIR}" "\${CODESIGNING_FOLDER_PATH}" "\${OBJROOT}" "\${SYMROOT}"; do
    if [ -z "\$ROOT" ] || [ ! -d "\$ROOT" ]; then
      continue
    fi
    find "\$ROOT" -name Info.plist 2>/dev/null | while IFS= read -r PL; do
      case "\$PL" in
        *.app/Info.plist) lineup_tvos_fix_plist "\$PL" ;;
      esac
    done
  done
  for PLIST in "\${CODESIGNING_FOLDER_PATH}/Info.plist" "\${BUILT_PRODUCTS_DIR}/\${WRAPPER_NAME}/Info.plist" "\${TARGET_BUILD_DIR}/\${WRAPPER_NAME}/Info.plist"; do
    if [ -n "\$PLIST" ] && [ -f "\$PLIST" ]; then
      lineup_tvos_fix_plist "\$PLIST"
    fi
  done
}
lineup_tvos_sweep
lineup_tvos_sweep
`;

  // Re-run prebuild must refresh script body: xcode "add once" would otherwise keep the first version forever.
  if (upsertPlistFixShellScriptInPbxProject(project, shellScript)) {
    return;
  }
  const { buildPhase } = project.addBuildPhase(
    [],
    'PBXShellScriptBuildPhase',
    XCODE_BUILD_PHASE_NAME,
    targetUuid,
    {
      shellPath: '/bin/sh',
      shellScript,
    },
  );
  // Xcode 14+ may skip run scripts with no declared inputs/outputs; match Expo’s RN bundling phase.
  if (buildPhase) {
    buildPhase.alwaysOutOfDate = 1;
    buildPhase.showEnvVarsInLog = 0;
  }
}

const PODS_REORDER_MARK = '    # [lineup] Move tvOS plist fix after CocoaPods';

/**
 * After `pod install`, place our run script *after* all CocoaPods-injected build phases
 * (see user log: [lineup]… ran, then [CP] Embed Pods Frameworks, then signing).
 * @param {string} podfileContents
 * @returns {string}
 */
function withTvOSPodfilePlistFixReorder(podfileContents) {
  if (typeof podfileContents !== 'string' || podfileContents.includes(PODS_REORDER_MARK)) {
    return podfileContents;
  }
  const needle = `    :ccache_enabled => ccache_enabled?(podfile_properties),
    )`;
  if (!podfileContents.includes(needle)) {
    return podfileContents;
  }
  const postInstall = `${PODS_REORDER_MARK}
    begin
      require 'xcodeproj'
      app_project = Dir[File.join(__dir__, '*.xcodeproj')].first
      if app_project
        p = Xcodeproj::Project.open(app_project)
        changed = false
        p.targets.each do |target|
          next unless target.product_type == 'com.apple.product-type.application'
          fix = target.build_phases.find { |bp| bp.respond_to?(:name) && bp.name.to_s.include?('Fix tvOS App Store Info.plist') }
          if fix
            target.build_phases.delete(fix)
            target.build_phases << fix
            changed = true
          end
        end
        p.save if changed
      end
    rescue => e
      Pod::UI.warn('Lineup tvOS: reorder plist fix phase: ' + e.to_s)
    end
`;
  return podfileContents.replace(needle, `${needle}\n${postInstall}`);
}

function withTvOSAppIconPlist(config) {
  if (process.env.EXPO_TV === '1' && config.ios && config.ios.icon != null) {
    delete config.ios.icon;
  }

  config = withInfoPlist(config, (config) => {
    const plist = config.modResults;
    const isTv = process.env.EXPO_TV === '1' || isAppleTVPlist(plist);
    if (!isTv) {
      return config;
    }
    if (!hasBrokenAppIconPlist(plist) && typeof plist.CFBundleIconName === 'string' && plist.CFBundleIconName.length > 0) {
      return config;
    }
    plist.CFBundleIcons = {
      CFBundlePrimaryIcon: TV_PRIMARY_ICON_NAME,
    };
    plist.CFBundleIconName = TV_PRIMARY_ICON_NAME;
    return config;
  });

  config = withXcodeProject(config, (config) => {
    // Only tvOS EAS / local prebuilds set EXPO_TV=1 in eas.json or the shell.
    if (process.env.EXPO_TV !== '1') {
      return config;
    }
    addFixPlistBuildPhase(config.modResults);
    return config;
  });

  return withPodfile(config, (config) => {
    if (process.env.EXPO_TV !== '1' || !config.modResults || typeof config.modResults.contents !== 'string') {
      return config;
    }
    if (!config.modRequest?.introspect) {
      patchPbxIncludeAllAppIconAssetsToNo(config.modRequest.projectRoot);
    }
    config.modResults.contents = withTvOSPodfilePlistFixReorder(config.modResults.contents);
    return config;
  });
}

module.exports = withTvOSAppIconPlist;
