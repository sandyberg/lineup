import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StreamingService, SportEvent } from '@/lib/types';
import { launchStreamingApp } from '@/lib/deep-links';

const IS_NATIVE_TV = Platform.isTV && Platform.OS !== 'web';

interface ServicePickerModalProps {
  visible: boolean;
  services: StreamingService[];
  event: SportEvent | null;
  onClose: () => void;
}

function ServiceOption({
  service,
  onPress,
  hasTVPreferredFocus,
  large,
}: {
  service: StreamingService;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
  large: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = useCallback(() => {
    if (IS_NATIVE_TV) {
      return;
    }
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handleBlur = useCallback(() => {
    if (IS_NATIVE_TV) {
      return;
    }
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const body = (
    <Pressable
      testID={`service-option-${service.id}`}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPress={onPress}
      style={({ focused }) => [
        styles.serviceOption,
        large && styles.serviceOptionLarge,
        focused && styles.serviceOptionFocused,
      ]}
    >
      <View style={[styles.serviceDot, large && styles.serviceDotLarge, { backgroundColor: service.color }]} />
      <Text style={[styles.serviceName, large && styles.serviceNameLarge]}>{service.name}</Text>
      <Text style={[styles.launchArrow, large && styles.launchArrowLarge]}>→</Text>
    </Pressable>
  );

  // Animated.View can confuse the Apple TV focus engine; use plain view on TV.
  if (IS_NATIVE_TV) {
    return <View>{body}</View>;
  }
  return <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{body}</Animated.View>;
}

export function ServicePickerModal({
  visible,
  services,
  event,
  onClose,
}: ServicePickerModalProps) {
  const useLargeModal = IS_NATIVE_TV;


  const handleLaunch = useCallback(
    (serviceId: string) => {
      onClose();
      launchStreamingApp(serviceId);
    },
    [onClose],
  );

  const title = event?.homeTeam && event?.awayTeam
    ? `${getMascot(event.awayTeam)} vs ${getMascot(event.homeTeam)}`
    : event?.title ?? 'Watch on';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Do not wrap the sheet in a full-screen Pressable: on tvOS the backdrop
        steals the focus path from inner rows. Backdrop is non-focusable on TV. */}
      <View style={styles.backdrop} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Close provider list"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          {...(IS_NATIVE_TV ? { focusable: false } : {})}
        />
        <View
          testID="service-picker-modal"
          style={[styles.sheet, useLargeModal && styles.sheetLarge]}
          pointerEvents="box-none"
        >
          <Text style={[styles.title, useLargeModal && styles.titleLarge]}>Available on</Text>
          <Text style={[styles.subtitle, useLargeModal && styles.subtitleLarge]} numberOfLines={1}>{title}</Text>

          <View style={[styles.serviceList, useLargeModal && styles.serviceListLarge]}>
            {services.map((svc, index) => (
              <ServiceOption
                key={svc.id}
                service={svc}
                hasTVPreferredFocus={IS_NATIVE_TV && index === 0}
                large={useLargeModal}
                onPress={() => handleLaunch(svc.id)}
              />
            ))}
          </View>

          <Pressable
            testID="service-picker-cancel"
            onPress={onClose}
            style={({ focused }) => [
              styles.cancelBtn,
              useLargeModal && styles.cancelBtnLarge,
              focused && styles.cancelBtnFocused,
            ]}
          >
            <Text style={[styles.cancelText, useLargeModal && styles.cancelTextLarge]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function getMascot(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    zIndex: 1,
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    padding: 28,
    width: 400,
    maxWidth: '90%',
  },
  sheetLarge: {
    borderRadius: 36,
    padding: 56,
    width: 760,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleLarge: {
    fontSize: 42,
  },
  subtitle: {
    color: '#8B95A5',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  subtitleLarge: {
    fontSize: 30,
    marginBottom: 40,
  },
  serviceList: {
    gap: 10,
  },
  serviceListLarge: {
    gap: 22,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252D3D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceOptionLarge: {
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 34,
  },
  serviceOptionFocused: {
    borderColor: '#FFFFFF',
    backgroundColor: '#2D3A50',
  },
  serviceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  serviceDotLarge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 26,
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  serviceNameLarge: {
    fontSize: 34,
  },
  launchArrow: {
    color: '#8B95A5',
    fontSize: 18,
    fontWeight: '600',
  },
  launchArrowLarge: {
    fontSize: 34,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cancelBtnLarge: {
    marginTop: 32,
    paddingVertical: 24,
    borderRadius: 24,
  },
  cancelBtnFocused: {
    borderColor: '#FFFFFF',
  },
  cancelText: {
    color: '#8B95A5',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelTextLarge: {
    fontSize: 30,
  },
});
