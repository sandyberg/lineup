import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform } from 'react-native';
import WebTabs from './app-tabs.web';

export default function AppTabs() {
  if (Platform.OS === 'android' && Platform.isTV) {
    return <WebTabs />;
  }

  return (
    <NativeTabs
      backgroundColor="#0D1117"
      indicatorColor="#FFFFFF"
      tintColor="#FFFFFF"
      iconColor="#B8C1CF"
      labelStyle={{
        selected: { color: '#FFFFFF', fontWeight: '600' },
        default: { color: '#B8C1CF' },
      }}
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
