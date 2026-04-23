/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

const tintColorLight = '#0274df';
const tintColorDark = '#3c9ffe';

export const Colors = {
  light: {
    text: '#000000',
    tint: tintColorLight,
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    gradientStart: tintColorLight,
    gradientEnd: tintColorDark,
  },
  dark: {
    text: '#ffffff',
    tint: tintColorDark,
    background: '#0D1117',
    backgroundElement: '#1A1F2E',
    backgroundSelected: '#252D3D',
    textSecondary: '#8B95A5',
    gradientStart: tintColorLight,
    gradientEnd: tintColorDark,
  },
} as const;

/**
 * tvOS Guide/Settings (NativeTabs) + `patches/expo-router+55.0.12.patch`:
 * dim labels on the dark bar; on the *system* light focus pill, labels use app background color.
 * Custom `Pressable` search fields are not the native tab item — use `focusedSurface` + `labelOnLightFocus`
 * so the same dark-on-light pairing isn’t “black on black.”
 */
export const TvosTabBar = {
  background: '#0D1117',
  /** `NativeTabs` default label on the dark bar (app-tabs `TVOS_TAB_DIM`) */
  labelDim: '#8B9AAC',
  labelOnBarSelected: '#FFFFFF',
  /**
   * Label/icon on the **light** focus state (expo `appearance` patch `["focused"]` →
   * `color` / `iconColor` = bar background = readable on the white pill)
   */
  labelOnLightFocus: '#0D1117',
  /** ~system light “pill” for custom controls (tabs get this from UIKit) */
  focusedSurface: '#FFFFFF',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing: {
  half: number;
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
} = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
