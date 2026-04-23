import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { TvosTabBar } from '@/constants/theme';
import WebTabs from './app-tabs.web';

/**
 * tvOS: “selected” in Expo is the current route. We use white on the dark bar, and
 * (via a small expo-router appearance patch) the app background color on the system light
 * focus pill so icon+label are readable when the tab is highlighted.
 */
const TVOS_LABEL_TYPE = { fontSize: 17, fontWeight: '600' as const };

export default function AppTabs() {
  // Android TV: JS tabs; Apple TV: native — selection pill is light, so we tint labels dark (see below).
  if (Platform.OS === 'android' && Platform.isTV) {
    return <WebTabs />;
  }

  const isTvos = Platform.OS === 'ios' && Platform.isTV;

  return (
    <NativeTabs
      backgroundColor={TvosTabBar.background}
      indicatorColor={isTvos ? '#2D3A4F' : '#FFFFFF'}
      tintColor={isTvos ? TvosTabBar.labelOnBarSelected : '#FFFFFF'}
      iconColor={
        isTvos
          ? { default: TvosTabBar.labelDim, selected: TvosTabBar.labelOnBarSelected }
          : '#B8C1CF'
      }
      labelStyle={
        isTvos
          ? {
              default: { color: TvosTabBar.labelDim, ...TVOS_LABEL_TYPE },
              selected: { color: TvosTabBar.labelOnBarSelected, ...TVOS_LABEL_TYPE },
            }
          : {
              default: { color: '#B8C1CF' },
              selected: { color: '#FFFFFF', fontWeight: '600' },
            }
      }
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Guide</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/tv.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
