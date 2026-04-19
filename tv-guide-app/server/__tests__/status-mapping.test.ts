import { mapStatus } from '../sports-api';

describe('mapStatus', () => {
  describe('upcoming statuses', () => {
    it.each([
      ['Not Started', 'upcoming'],
      ['NS', 'upcoming'],
      ['Scheduled', 'upcoming'],
      ['scheduled', 'upcoming'],
      ['pre', 'upcoming'],
      ['PRE', 'upcoming'],
      ['', 'upcoming'],
    ])('maps "%s" to "%s"', (input, expected) => {
      expect(mapStatus(input)).toBe(expected);
    });
  });

  describe('live statuses', () => {
    it.each([
      ['in', 'live'],
      ['In Progress', 'live'],
      ['LIVE', 'live'],
      ['live', 'live'],
      ['1H', 'live'],
      ['HT', 'live'],
      ['Halftime', 'live'],
      ['2H', 'live'],
    ])('maps "%s" to "%s"', (input, expected) => {
      expect(mapStatus(input)).toBe(expected);
    });
  });

  describe('final statuses', () => {
    it.each([
      ['FT', 'final'],
      ['Final', 'final'],
      ['FINAL', 'final'],
      ['Finished', 'final'],
      ['finished', 'final'],
      ['AET', 'final'],
      ['completed', 'final'],
      ['Completed', 'final'],
      ['post', 'final'],
      ['POST', 'final'],
    ])('maps "%s" to "%s"', (input, expected) => {
      expect(mapStatus(input)).toBe(expected);
    });
  });

  describe('golf/tennis statuses', () => {
    it.each([
      ['Round 1', 'upcoming'],
      ['Round 3', 'upcoming'],
      ['Rd 2', 'upcoming'],
      ['Tee Time', 'upcoming'],
    ])('maps "%s" to "%s"', (input, expected) => {
      expect(mapStatus(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('defaults unknown statuses to upcoming', () => {
      expect(mapStatus('some_random_status')).toBe('upcoming');
    });

    it('handles null/undefined gracefully', () => {
      expect(mapStatus(null as unknown as string)).toBe('upcoming');
      expect(mapStatus(undefined as unknown as string)).toBe('upcoming');
    });

    it('is case insensitive', () => {
      expect(mapStatus('LIVE')).toBe('live');
      expect(mapStatus('live')).toBe('live');
      expect(mapStatus('Live')).toBe('live');
    });

    it('matches partial strings', () => {
      expect(mapStatus('STATUS_FINAL')).toBe('final');
      expect(mapStatus('Not Started Yet')).toBe('upcoming');
    });
  });
});
