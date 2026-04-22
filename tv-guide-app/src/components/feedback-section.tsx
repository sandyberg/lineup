import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FEEDBACK_EMAIL, openFeedback } from '@/lib/feedback';

interface FeedbackSectionProps {
  compact?: boolean;
}

export function FeedbackSection({ compact }: FeedbackSectionProps) {
  const isTV = Platform.isTV;

  return (
    <View testID="feedback-section">
      <Text style={[styles.description, compact && styles.descriptionCompact]}>
        {isTV
          ? 'Have a question or suggestion? Email us from your phone or computer:'
          : 'Have a question or suggestion? We\u2019d love to hear from you.'}
      </Text>

      <Text
        testID="feedback-email"
        selectable
        style={[styles.email, compact && styles.emailCompact]}
      >
        {FEEDBACK_EMAIL}
      </Text>

      {!isTV && (
        <Pressable
          testID="feedback-button"
          onPress={openFeedback}
          style={({ pressed }) => [
            styles.button,
            compact && styles.buttonCompact,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
            Send Feedback
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: '#8B95A5',
    fontSize: 20,
    marginBottom: 16,
    lineHeight: 28,
  },
  descriptionCompact: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  email: {
    color: '#5CAAFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  emailCompact: {
    fontSize: 17,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A3A5C',
    borderWidth: 2,
    borderColor: '#5CAAFF',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonCompact: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextCompact: {
    fontSize: 15,
  },
});
