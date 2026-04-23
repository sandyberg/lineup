import { Linking, Platform } from 'react-native';
import type { StreamingService } from '@/lib/types';
import { SERVICE_MAP } from '@/data/services';

function appStorePageUrl(numericId: string): string {
  return `https://apps.apple.com/app/id${numericId}`;
}

function playStorePageUrl(packageName: string): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;
}

function playStorePackage(service: StreamingService): string | undefined {
  if (Platform.OS !== 'android') return undefined;
  if (Platform.isTV && service.playStorePackageTv) return service.playStorePackageTv;
  return service.playStorePackage;
}

/** When the app deep link cannot be opened, send users to the first‑party store listing. */
async function tryOpenStoreListing(service: StreamingService): Promise<boolean> {
  if (Platform.OS === 'ios' && service.appStoreId) {
    try {
      await Linking.openURL(appStorePageUrl(service.appStoreId));
      return true;
    } catch {
      return false;
    }
  }
  const playPkg = playStorePackage(service);
  if (playPkg) {
    try {
      await Linking.openURL(playStorePageUrl(playPkg));
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function isMobileWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function isDesktopWeb(): boolean {
  return Platform.OS === 'web' && !isMobileWeb();
}

/** Phone/tablet browsers: prefer app deep links; iPad is included via iPad in UA. */
function urlForMobileWebBrowser(service: StreamingService): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return service.deepLinks.android;
  if (/iPhone|iPad|iPod/i.test(ua)) return service.deepLinks.ios ?? service.deepLinks.tvos;
  return service.deepLinks.android ?? service.deepLinks.ios ?? service.deepLinks.tvos;
}

function resolveLaunchUrl(service: StreamingService): string | undefined {
  if (Platform.OS === 'web') {
    if (isDesktopWeb()) return service.deepLinks.web;
    return urlForMobileWebBrowser(service);
  }

  if (Platform.OS === 'android') {
    if (Platform.isTV && service.deepLinks.androidTv) return service.deepLinks.androidTv;
    return service.deepLinks.android ?? service.deepLinks.web;
  }

  if (Platform.OS === 'ios') {
    if (Platform.isTV) return service.deepLinks.tvos ?? service.deepLinks.web;
    return service.deepLinks.ios ?? service.deepLinks.tvos ?? service.deepLinks.web;
  }

  return service.deepLinks.web;
}

function allowWebFallback(): boolean {
  if (Platform.isTV) return false;
  if (Platform.OS === 'web' && !isDesktopWeb()) return false;
  return true;
}

export async function launchStreamingApp(serviceId: string): Promise<boolean> {
  const service = SERVICE_MAP[serviceId];
  if (!service) return false;

  const url = resolveLaunchUrl(service);
  if (!url) return false;

  try {
    if (Platform.OS === 'web') {
      if (isDesktopWeb()) {
        await Linking.openURL(url);
        return true;
      }
      const w = typeof globalThis !== 'undefined' ? (globalThis as { window?: { open?: (u: string, t?: string) => void } }).window : undefined;
      if (w?.open) {
        w.open(url, '_blank');
        return true;
      }
      await Linking.openURL(url);
      return true;
    }

    const isIntent = url.startsWith('intent:');
    if (!isIntent) {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        if (await tryOpenStoreListing(service)) {
          return true;
        }
        if (allowWebFallback() && service.deepLinks.web) {
          await Linking.openURL(service.deepLinks.web);
          return true;
        }
        return false;
      }
    }

    await Linking.openURL(url);
    return true;
  } catch (err) {
    // Android: intent or openURL can fail if the app is missing; offer Play Store.
    if (Platform.OS === 'android' && (await tryOpenStoreListing(service))) {
      return true;
    }
    if (allowWebFallback() && service.deepLinks.web) {
      try {
        await Linking.openURL(service.deepLinks.web);
        return true;
      } catch {
        /* fall through */
      }
    }
    console.warn(`Failed to launch ${service.name}:`, err);
  }

  return false;
}

export function getServiceDisplayInfo(serviceId: string) {
  return SERVICE_MAP[serviceId] ?? null;
}

/** For dev tools: what URL we’d use, whether the OS claims it can open it, and the store URL fallback. */
export type StreamingLaunchProbe = {
  serviceId: string;
  name: string;
  resolvedUrl: string | undefined;
  isIntent: boolean;
  canOpen: boolean | null;
  storeListingUrl: string | undefined;
  /** Native: would open the store (or other fallback) if `canOpen` is false. */
  wouldUseStoreFallback: boolean;
};

export async function probeStreamingLaunch(
  serviceId: string,
): Promise<StreamingLaunchProbe | null> {
  const service = SERVICE_MAP[serviceId];
  if (!service) return null;
  const url = resolveLaunchUrl(service);
  const isIntent = !!url && url.startsWith('intent:');
  let canOpen: boolean | null = null;
  if (Platform.OS !== 'web' && url && !isIntent) {
    canOpen = await Linking.canOpenURL(url);
  }
  const playPkg = playStorePackage(service);
  const storeListingUrl =
    Platform.OS === 'ios' && service.appStoreId
      ? appStorePageUrl(service.appStoreId)
      : playPkg
        ? playStorePageUrl(playPkg)
        : undefined;
  const wouldUseStoreFallback =
    Platform.OS !== 'web' &&
    !isIntent &&
    canOpen === false &&
    (Platform.OS === 'ios' ? Boolean(service.appStoreId) : Boolean(playPkg));

  return {
    serviceId: service.id,
    name: service.name,
    resolvedUrl: url,
    isIntent,
    canOpen,
    storeListingUrl,
    wouldUseStoreFallback,
  };
}
