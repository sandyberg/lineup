import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MAJOR_SERVICES, LEAGUE_SERVICES } from '@/data/services';
import { getSizesForWidth } from '@/lib/constants';
import { TeamPicker } from './team-picker';
import { MarketPicker } from './market-picker';

interface OnboardingProps {
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  selectedTeams: string[];
  onToggleTeam: (teamId: string) => void;
  selectedSports: string[];
  onToggleSport: (sport: string) => void;
  selectedMarkets: string[];
  onToggleMarket: (marketId: string) => void;
  onClearMarkets: () => void;
  onComplete: () => void;
  onFavoritesMigrated?: (teamIds: string[]) => void;
}

export function Onboarding({
  selectedServices,
  onToggleService,
  selectedTeams,
  onToggleTeam,
  selectedSports,
  onToggleSport,
  selectedMarkets,
  onToggleMarket,
  onClearMarkets,
  onComplete,
  onFavoritesMigrated,
}: OnboardingProps) {
  const [step, setStep] = useState(0);

  if (step === 0) {
    return <WelcomeStep onNext={() => setStep(1)} />;
  }

  if (step === 1) {
    return (
      <ServicePickerStep
        selectedServices={selectedServices}
        onToggle={onToggleService}
        onComplete={() => setStep(2)}
      />
    );
  }

  if (step === 2) {
    return (
      <MarketPickerStep
        selectedMarkets={selectedMarkets}
        onToggle={onToggleMarket}
        onClear={onClearMarkets}
        onComplete={() => setStep(3)}
      />
    );
  }

  return (
    <TeamPickerStep
      selectedTeams={selectedTeams}
      onToggle={onToggleTeam}
      onFavoritesMigrated={onFavoritesMigrated}
      selectedSports={selectedSports}
      onToggleSport={onToggleSport}
      onComplete={onComplete}
    />
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTv = Platform.isTV;
  const isLandscapeMobile = Platform.OS === 'web' && width > height && height < 500;

  const content = (
    <>
      <Text style={[styles.logoText, isTv && styles.logoTextTv, isMobile && { fontSize: 44 }, isLandscapeMobile && { fontSize: 36 }]}>Lineup</Text>
      <Text style={[styles.tagline, isTv && styles.taglineTv, isMobile && { fontSize: 18 }, isLandscapeMobile && { fontSize: 16 }]}>Live Sports TV Guide</Text>
      <Text style={[styles.heroSubtext, isTv && styles.heroSubtextTv, isLandscapeMobile && { marginBottom: 18 }]}>
        Pick your services once. Lineup shows what you can actually watch.
      </Text>

      <View style={[styles.featureList, isLandscapeMobile && { gap: 12, marginBottom: 24 }]}>
        <FeatureRow
          number="1"
          title="See what's on"
          desc="Live and upcoming games across all your streaming services"
        />
        <FeatureRow
          number="2"
          title="Tap to watch"
          desc="Press select on any game to instantly open the right streaming app"
        />
        <FeatureRow
          number="3"
          title="Never miss a game"
          desc="NFL, NBA, MLB, NHL, Soccer, and more — all in one place"
        />
      </View>

      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Pressable
          testID="onboarding-get-started"
          onPress={onNext}
          onFocus={() =>
            Animated.spring(btnScale, {
              toValue: 1.05,
              useNativeDriver: true,
              friction: 8,
            }).start()
          }
          onBlur={() =>
            Animated.spring(btnScale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 8,
            }).start()
          }
          style={({ focused }) => [
            styles.ctaButton,
            focused && styles.ctaButtonFocused,
          ]}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </>
  );

  if (isLandscapeMobile) {
    return (
      <ScrollView
        testID="onboarding-welcome"
        style={styles.screen}
        contentContainerStyle={[styles.welcomeContent, { justifyContent: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <LinearGradient colors={['#0D1B2B', '#07101B']} style={styles.screen} testID="onboarding-welcome">
      <View style={[styles.welcomeContent, isMobile && { paddingHorizontal: 24 }]}>
        {content}
      </View>
    </LinearGradient>
  );
}

function FeatureRow({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureNumber}>
        <Text style={styles.featureNumberText}>{number}</Text>
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function ServicePickerStep({
  selectedServices,
  onToggle,
  onComplete,
}: {
  selectedServices: string[];
  onToggle: (id: string) => void;
  onComplete: () => void;
}) {
  const btnScale = useRef(new Animated.Value(1)).current;

  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTv = Platform.isTV;
  const isLandscapeMobile = Platform.OS === 'web' && width > height && height < 500;
  const scrollStyle = Platform.OS === 'web'
    ? [styles.screen, { height: '100vh' as unknown as number }]
    : styles.screen;

  const topPadding = isLandscapeMobile ? 16 : isMobile ? 60 : isTv ? Math.max(90, height * 0.1) : Math.max(80, height * 0.12);
  const serviceGridLayout = [
    styles.serviceGrid,
    isMobile && { gap: 10 },
    isTv && styles.serviceGridTv,
  ];

  return (
    <ScrollView testID="onboarding-service-picker" style={scrollStyle} contentContainerStyle={[styles.pickerContent, { paddingTop: topPadding }, isMobile && { paddingHorizontal: 20 }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, isTv && styles.stepTitleTv, isMobile && { fontSize: 26 }]}>Pick your streaming services</Text>
      <Text style={[styles.stepSubtitle, isTv && styles.stepSubtitleTv]}>
        Lineup will only show games available on your services. You can change this anytime in Settings.
      </Text>

      <View style={serviceGridLayout}>
        {MAJOR_SERVICES.map((service) => (
          <ServiceChip
            key={service.id}
            name={service.name}
            color={service.color}
            isSelected={selectedServices.includes(service.id)}
            onPress={() => onToggle(service.id)}
            compact={isMobile}
            fullWidth={isTv}
          />
        ))}
      </View>
      <Text style={styles.sectionLabel}>League packages</Text>
      <Text style={styles.sectionHint}>Add these if you subscribe to league-specific streaming</Text>
      <View style={serviceGridLayout}>
        {LEAGUE_SERVICES.map((service) => (
          <ServiceChip
            key={service.id}
            name={service.name}
            color={service.color}
            isSelected={selectedServices.includes(service.id)}
            onPress={() => onToggle(service.id)}
            compact={isMobile}
            fullWidth={isTv}
          />
        ))}
      </View>

      <Text style={styles.selectedCount}>
        {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
      </Text>

      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Pressable
          testID="onboarding-next-services"
          onPress={onComplete}
          onFocus={() =>
            Animated.spring(btnScale, {
              toValue: 1.05,
              useNativeDriver: true,
              friction: 8,
            }).start()
          }
          onBlur={() =>
            Animated.spring(btnScale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 8,
            }).start()
          }
          style={({ focused }) => [
            styles.ctaButton,
            focused && styles.ctaButtonFocused,
            selectedServices.length === 0 && styles.ctaButtonDisabled,
          ]}
          disabled={selectedServices.length === 0}
        >
          <Text style={styles.ctaText}>
            {selectedServices.length === 0 ? 'Select at least one' : 'Next'}
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

function MarketPickerStep({
  selectedMarkets,
  onToggle,
  onClear,
  onComplete,
}: {
  selectedMarkets: string[];
  onToggle: (marketId: string) => void;
  onClear: () => void;
  onComplete: () => void;
}) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTv = Platform.isTV;
  const isLandscapeMobile = Platform.OS === 'web' && width > height && height < 500;
  const scrollStyle = Platform.OS === 'web'
    ? [styles.screen, { height: '100vh' as unknown as number }]
    : styles.screen;

  const topPadding = isLandscapeMobile ? 16 : isMobile ? 60 : isTv ? Math.max(90, height * 0.1) : Math.max(80, height * 0.12);

  return (
    <ScrollView
      testID="onboarding-market-picker"
      style={scrollStyle}
      contentContainerStyle={[
        styles.pickerContent,
        { paddingTop: topPadding },
        isMobile && { paddingHorizontal: 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.stepTitle, isTv && styles.stepTitleTv, isMobile && { fontSize: 26 }]}>Select your TV markets</Text>
      <Text style={[styles.stepSubtitle, isTv && styles.stepSubtitleTv]}>
        This helps Lineup show local channels like your regional sports networks. You can skip this or change it later in Settings.
      </Text>

      <View style={{ width: '100%', maxWidth: isTv ? 980 : 700 }}>
        <MarketPicker
          selectedMarkets={selectedMarkets}
          onToggle={onToggle}
          onClear={onClear}
          compact={isMobile}
        />
      </View>

      <View style={styles.teamPickerButtons}>
        <Pressable
          testID="onboarding-skip-market"
          onPress={onComplete}
          style={({ focused }) => [
            styles.skipButton,
            Platform.isTV && focused && styles.skipButtonFocused,
          ]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            testID="onboarding-next-market"
            onPress={onComplete}
            onFocus={() =>
              Animated.spring(btnScale, {
                toValue: 1.05,
                useNativeDriver: true,
                friction: 8,
              }).start()
            }
            onBlur={() =>
              Animated.spring(btnScale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
              }).start()
            }
            style={({ focused }) => [
              styles.ctaButton,
              focused && styles.ctaButtonFocused,
            ]}
          >
            <Text style={styles.ctaText}>Next</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function TeamPickerStep({
  selectedTeams,
  onToggle,
  onFavoritesMigrated,
  selectedSports,
  onToggleSport,
  onComplete,
}: {
  selectedTeams: string[];
  onToggle: (teamId: string) => void;
  onFavoritesMigrated?: (teamIds: string[]) => void;
  selectedSports: string[];
  onToggleSport: (sport: string) => void;
  onComplete: () => void;
}) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTv = Platform.isTV;
  const isLandscapeMobile = Platform.OS === 'web' && width > height && height < 500;
  const scrollStyle = Platform.OS === 'web'
    ? [styles.screen, { height: '100vh' as unknown as number }]
    : styles.screen;

  const topPadding = isLandscapeMobile ? 16 : isMobile ? 60 : isTv ? Math.max(90, height * 0.1) : Math.max(80, height * 0.12);

  return (
    <ScrollView
      testID="onboarding-team-picker"
      style={scrollStyle}
      contentContainerStyle={[
        styles.pickerContent,
        { paddingTop: topPadding },
        isMobile && { paddingHorizontal: 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.stepTitle, isTv && styles.stepTitleTv, isMobile && { fontSize: 26 }]}>Pick your favorites</Text>
      <Text style={[styles.stepSubtitle, isTv && styles.stepSubtitleTv]}>
        Add sports, teams, or both—only what you turn on is used. You can skip and change this anytime in Settings.
      </Text>

      <View style={{ width: '100%', maxWidth: isTv ? 980 : 700 }}>
        <TeamPicker
          selectedTeams={selectedTeams}
          onToggle={onToggle}
          onFavoritesMigrated={onFavoritesMigrated}
          selectedSports={selectedSports}
          onToggleSport={onToggleSport}
          compact={isMobile}
          preferInitialFocus
        />
      </View>

      <Text style={styles.selectedCount}>
        {selectedTeams.length + selectedSports.length} favorite
        {selectedTeams.length + selectedSports.length !== 1 ? 's' : ''} selected
      </Text>

      <View style={styles.teamPickerButtons}>
        <Pressable
          testID="onboarding-skip-teams"
          onPress={onComplete}
          style={({ focused }) => [
            styles.skipButton,
            Platform.isTV && focused && styles.skipButtonFocused,
          ]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            testID="onboarding-complete"
            onPress={onComplete}
            onFocus={() =>
              Animated.spring(btnScale, {
                toValue: 1.05,
                useNativeDriver: true,
                friction: 8,
              }).start()
            }
            onBlur={() =>
              Animated.spring(btnScale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
              }).start()
            }
            style={({ focused }) => [
              styles.ctaButton,
              focused && styles.ctaButtonFocused,
            ]}
          >
            <Text style={styles.ctaText}>
              {selectedTeams.length + selectedSports.length === 0
                ? "Let\u2019s go"
                : 'Done'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function ServiceChip({
  name,
  color,
  isSelected,
  onPress,
  compact,
  fullWidth,
}: {
  name: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  compact?: boolean;
  /** TV: one column, full width — predictable up/down focus, no "row end" issues */
  fullWidth?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const sizes = getSizesForWidth(width, Platform.isTV && Platform.OS !== 'web');
  // tvOS: scaling the chip makes it grow past the row and overlap neighbors; use the white focus border only.
  const focusScale = Platform.isTV ? 1 : sizes.focusScale;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        testID={`onboarding-service-${name.toLowerCase().replace(/\s+/g, '-')}`}
        onPress={onPress}
        onFocus={() =>
          Animated.spring(scaleAnim, {
            toValue: focusScale,
            useNativeDriver: true,
            friction: 8,
          }).start()
        }
        onBlur={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }).start()
        }
        style={({ focused }) => [
          styles.chip,
          compact && { width: 150, height: 56, paddingHorizontal: 12, gap: 8 },
          fullWidth && { width: '100%' as const, minWidth: undefined, alignSelf: 'stretch' },
          fullWidth && styles.chipTv,
          isSelected && { backgroundColor: color, borderColor: color },
          focused && styles.chipFocused,
        ]}
      >
        <Text style={[styles.chipCheck, fullWidth && styles.chipCheckTv, compact && { fontSize: 16, width: 20 }]}>{isSelected ? '✓' : ''}</Text>
        <Text style={[styles.chipName, fullWidth && styles.chipNameTv, compact && { fontSize: 15 }]}>{name}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A1320',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.isTV ? 90 : 60,
    paddingBottom: 40,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: '#5CAAFF',
    fontSize: 24,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 14,
  },
  heroSubtext: {
    color: '#A7B4C5',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 560,
    marginBottom: 48,
  },
  heroSubtextTv: {
    fontSize: 27,
    lineHeight: 38,
    maxWidth: 780,
    marginBottom: 58,
  },
  featureList: {
    width: '100%',
    maxWidth: Platform.isTV ? 820 : 600,
    gap: Platform.isTV ? 32 : 24,
    marginBottom: Platform.isTV ? 56 : 48,
  },
  logoTextTv: {
    fontSize: 96,
  },
  taglineTv: {
    fontSize: 34,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Platform.isTV ? 28 : 20,
  },
  featureNumber: {
    width: Platform.isTV ? 56 : 40,
    height: Platform.isTV ? 56 : 40,
    borderRadius: Platform.isTV ? 28 : 20,
    backgroundColor: '#1A3A5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureNumberText: {
    color: '#5CAAFF',
    fontSize: Platform.isTV ? 25 : 18,
    fontWeight: '700',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: Platform.isTV ? 31 : 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#8B95A5',
    fontSize: Platform.isTV ? 24 : 17,
    lineHeight: Platform.isTV ? 34 : 24,
  },
  pickerContent: {
    paddingHorizontal: Platform.isTV ? 90 : 60,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepTitleTv: {
    fontSize: 52,
    marginBottom: 18,
  },
  stepSubtitle: {
    color: '#8B95A5',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 550,
    lineHeight: 26,
  },
  stepSubtitleTv: {
    fontSize: 27,
    lineHeight: 38,
    maxWidth: 860,
    marginBottom: 46,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  serviceGridTv: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 860,
  },
  chip: {
    width: 220,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1A1F2E',
    borderWidth: 3,
    borderColor: '#2D3548',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  chipTv: {
    minHeight: 112,
    borderRadius: 24,
    paddingHorizontal: 30,
    gap: 18,
  },
  chipFocused: {
    borderColor: '#FFFFFF',
  },
  chipCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    width: 26,
  },
  chipCheckTv: {
    fontSize: 30,
    width: 40,
  },
  chipName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  chipNameTv: {
    fontSize: 30,
  },
  sectionLabel: {
    color: '#AEAEB2',
    fontSize: Platform.isTV ? 24 : 18,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionLabelTv: {
    fontSize: 24,
  },
  sectionHint: {
    color: '#4A5568',
    fontSize: Platform.isTV ? 22 : 15,
    marginBottom: Platform.isTV ? 22 : 16,
  },
  selectedCount: {
    color: '#8B95A5',
    fontSize: Platform.isTV ? 22 : 16,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#2C7BE5',
    paddingHorizontal: Platform.isTV ? 70 : 48,
    paddingVertical: Platform.isTV ? 26 : 18,
    borderRadius: Platform.isTV ? 22 : 14,
    borderWidth: 3,
    borderColor: '#2C7BE5',
  },
  ctaButtonFocused: {
    backgroundColor: '#4DA6FF',
    borderColor: '#FFFFFF',
  },
  ctaButtonDisabled: {
    backgroundColor: '#1A1F2E',
    borderColor: '#2D3548',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: Platform.isTV ? 32 : 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  teamPickerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.isTV ? 34 : 20,
    marginTop: 8,
  },
  skipButton: {
    paddingHorizontal: Platform.isTV ? 44 : 32,
    paddingVertical: Platform.isTV ? 24 : 18,
  },
  skipButtonFocused: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  skipText: {
    color: '#8B95A5',
    fontSize: Platform.isTV ? 26 : 18,
    fontWeight: '600',
  },
});
