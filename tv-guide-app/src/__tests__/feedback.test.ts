import { Linking } from 'react-native';
import {
  FEEDBACK_EMAIL,
  FEEDBACK_SUBJECT,
  buildFeedbackMailto,
  openFeedback,
} from '@/lib/feedback';

beforeEach(() => {
  jest.clearAllMocks();
  (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
});

describe('FEEDBACK_EMAIL', () => {
  it('points to the canonical feedback address', () => {
    expect(FEEDBACK_EMAIL).toBe('lineup.tvguide@gmail.com');
  });

  it('has a non-empty default subject', () => {
    expect(FEEDBACK_SUBJECT.length).toBeGreaterThan(0);
  });
});

describe('buildFeedbackMailto', () => {
  it('returns a mailto URL with the default email and subject', () => {
    expect(buildFeedbackMailto()).toBe(
      `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(FEEDBACK_SUBJECT)}`,
    );
  });

  it('URL-encodes the subject so spaces and special characters survive', () => {
    const url = buildFeedbackMailto('test@example.com', 'hello world & friends');
    expect(url).toBe('mailto:test@example.com?subject=hello%20world%20%26%20friends');
  });

  it('accepts a custom email address', () => {
    const url = buildFeedbackMailto('support@example.com');
    expect(url.startsWith('mailto:support@example.com?subject=')).toBe(true);
  });
});

describe('openFeedback', () => {
  it('invokes Linking.openURL with the default mailto URL and resolves true', async () => {
    const result = await openFeedback();
    expect(Linking.openURL).toHaveBeenCalledWith(buildFeedbackMailto());
    expect(result).toBe(true);
  });

  it('returns false when Linking.openURL rejects', async () => {
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('no mail app'));
    const result = await openFeedback();
    expect(result).toBe(false);
  });
});
