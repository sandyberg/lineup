import { SPORT_FILTERS, STATUS_COLORS, TV_SIZES } from '@/lib/constants';

describe('SPORT_FILTERS', () => {
  it('starts with "all" filter', () => {
    expect(SPORT_FILTERS[0].id).toBe('all');
    expect(SPORT_FILTERS[0].label).toBe('All Sports');
  });

  it('has no duplicate IDs', () => {
    const ids = SPORT_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every filter has a label', () => {
    for (const filter of SPORT_FILTERS) {
      expect(filter.label.length).toBeGreaterThan(0);
    }
  });

  it('every filter has an icon', () => {
    for (const filter of SPORT_FILTERS) {
      expect(filter.icon.length).toBeGreaterThan(0);
    }
  });

  it('contains major US sports', () => {
    const ids = SPORT_FILTERS.map((f) => f.id);
    expect(ids).toContain('nfl');
    expect(ids).toContain('nba');
    expect(ids).toContain('mlb');
    expect(ids).toContain('nhl');
    expect(ids).toContain('soccer');
  });

  it('contains college sports', () => {
    const ids = SPORT_FILTERS.map((f) => f.id);
    expect(ids).toContain('college-football');
    expect(ids).toContain('college-basketball');
  });
});

describe('STATUS_COLORS', () => {
  it('has a color for live', () => {
    expect(STATUS_COLORS.live).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has a color for upcoming', () => {
    expect(STATUS_COLORS.upcoming).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has a color for final', () => {
    expect(STATUS_COLORS.final).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('live color is red-ish', () => {
    const r = parseInt(STATUS_COLORS.live.slice(1, 3), 16);
    expect(r).toBeGreaterThan(200);
  });
});

describe('TV_SIZES', () => {
  it('card dimensions are positive', () => {
    expect(TV_SIZES.cardWidth).toBeGreaterThan(0);
    expect(TV_SIZES.cardHeight).toBeGreaterThan(0);
  });

  it('card width is reasonable for TV (200-500px)', () => {
    expect(TV_SIZES.cardWidth).toBeGreaterThanOrEqual(200);
    expect(TV_SIZES.cardWidth).toBeLessThanOrEqual(500);
  });

  it('text sizes are readable at distance', () => {
    expect(TV_SIZES.titleSize).toBeGreaterThanOrEqual(18);
    expect(TV_SIZES.sectionLabelSize).toBeGreaterThanOrEqual(24);
  });

  it('focus border is visible', () => {
    expect(TV_SIZES.focusBorderWidth).toBeGreaterThanOrEqual(2);
  });

  it('focus scale is subtle (1.0 to 1.15)', () => {
    expect(TV_SIZES.focusScale).toBeGreaterThan(1);
    expect(TV_SIZES.focusScale).toBeLessThanOrEqual(1.15);
  });
});
