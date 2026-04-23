/**
 * tvOS: ensure Info.plist icon keys match what App Store Connect expects.
 *
 * Problem: CFBundleIcons.CFBundlePrimaryIcon was ending up as a string
 * ("App Icon - Small") instead of a dictionary, and CFBundleIconName was missing.
 * ASC then fails with 90713 / 90039.
 *
 * We set CFBundleIconName to the primary brand-asset name from
 * @react-native-tvos/config-tv (see withTVAppleIconImages.js): "App Icon - Small".
 * and remove the broken CFBundleIcons entry so the asset catalog supplies icons.
 */
const { withInfoPlist } = require('expo/config-plugins');

const TV_PRIMARY_ICON_NAME = 'App Icon - Small';

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
 * We observed a bad merge where CFBundlePrimaryIcon is a *string*:
 *   CFBundleIcons: { CFBundlePrimaryIcon: "App Icon - Small" }
 * App Store Connect rejects with 90039; CFBundleIconName is also required (90713).
 */
function hasBrokenAppIconPlist(plist) {
  const ci = plist.CFBundleIcons;
  if (ci == null) {
    return true;
  }
  if (typeof ci === 'string') {
    return true;
  }
  if (typeof ci === 'object' && typeof ci.CFBundlePrimaryIcon === 'string') {
    return true;
  }
  return false;
}

function withTvOSAppIconPlist(config) {
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;
    const isTv = process.env.EXPO_TV === '1' || isAppleTVPlist(plist);
    if (!isTv) {
      return config;
    }
    if (!hasBrokenAppIconPlist(plist) && typeof plist.CFBundleIconName === 'string' && plist.CFBundleIconName.length > 0) {
      return config;
    }
    delete plist.CFBundleIcons;
    plist.CFBundleIconName = TV_PRIMARY_ICON_NAME;
    return config;
  });
}

module.exports = withTvOSAppIconPlist;
