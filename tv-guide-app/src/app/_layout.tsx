import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
