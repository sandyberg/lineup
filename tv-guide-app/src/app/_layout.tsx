import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppTabs from '@/components/app-tabs';
import { Onboarding } from '@/components/onboarding';
import { usePreferences } from '@/hooks/use-preferences';

const NavyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D1117',
    card: '#1A1F2E',
    border: '#2D3548',
  },
};

export default function TabLayout() {
  const { prefs, loaded, toggleService, completeOnboarding } = usePreferences();

  if (loaded && !prefs.onboardingComplete) {
    return (
      <ThemeProvider value={NavyTheme}>
        <View style={styles.fullScreen}>
          <Onboarding
            selectedServices={prefs.selectedServices}
            onToggleService={toggleService}
            onComplete={completeOnboarding}
          />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={NavyTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
});
