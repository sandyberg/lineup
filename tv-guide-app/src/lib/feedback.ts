import { Linking } from 'react-native';

export const FEEDBACK_EMAIL = 'lineup.tvguide@gmail.com';
export const FEEDBACK_SUBJECT = 'Lineup Feedback';

export function buildFeedbackMailto(
  email: string = FEEDBACK_EMAIL,
  subject: string = FEEDBACK_SUBJECT,
): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export async function openFeedback(): Promise<boolean> {
  try {
    await Linking.openURL(buildFeedbackMailto());
    return true;
  } catch {
    return false;
  }
}
