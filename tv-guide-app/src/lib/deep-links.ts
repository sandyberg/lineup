import { Linking, Platform } from 'react-native';
import type { StreamingService } from '@/lib/types';
import { SERVICE_MAP } from '@/data/services';

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
