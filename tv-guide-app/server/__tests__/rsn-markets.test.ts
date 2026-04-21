import { TV_MARKETS, getMarketById, getMarketsForChannel, getMarketRSNChannels, isRSNChannel } from '../rsn-markets';

describe('TV_MARKETS', () => {
  it('has at least 20 markets', () => {
    expect(TV_MARKETS.length).toBeGreaterThanOrEqual(20);
  });

  it('all markets have id, label, and channels', () => {
    for (const market of TV_MARKETS) {
      expect(market.id).toBeTruthy();
      expect(market.label).toBeTruthy();
      expect(Array.isArray(market.channels)).toBe(true);
      expect(market.channels.length).toBeGreaterThan(0);
    }
  });

  it('all channels have name and serviceIds array', () => {
    for (const market of TV_MARKETS) {
      for (const ch of market.channels) {
        expect(ch.name).toBeTruthy();
        expect(Array.isArray(ch.serviceIds)).toBe(true);
      }
    }
  });
});

describe('getMarketById', () => {
  it('returns the correct market for known id', () => {
    const ny = getMarketById('new-york');
    expect(ny).toBeDefined();
    expect(ny!.label).toBe('New York');
  });

  it('returns undefined for unknown id', () => {
    expect(getMarketById('mars')).toBeUndefined();
  });

  it('returns boston market', () => {
    const boston = getMarketById('boston');
    expect(boston).toBeDefined();
    const channelNames = boston!.channels.map((c) => c.name);
    expect(channelNames).toContain('NESN');
  });
});

describe('getMarketsForChannel', () => {
  it('returns New York for YES', () => {
    const markets = getMarketsForChannel('YES');
    expect(markets.length).toBeGreaterThan(0);
    expect(markets.some((m) => m.id === 'new-york')).toBe(true);
  });

  it('returns Boston for NESN', () => {
    const markets = getMarketsForChannel('NESN');
    expect(markets.some((m) => m.id === 'boston')).toBe(true);
  });

  it('is case-insensitive', () => {
    const markets = getMarketsForChannel('nesn');
    expect(markets.some((m) => m.id === 'boston')).toBe(true);
  });

  it('returns empty array for unknown channel', () => {
    expect(getMarketsForChannel('WXYZ')).toEqual([]);
  });
});

describe('getMarketRSNChannels', () => {
  it('returns channels for known market', () => {
    const channels = getMarketRSNChannels('new-york');
    expect(channels.length).toBeGreaterThan(0);
    expect(channels.some((c) => c.name === 'YES')).toBe(true);
  });

  it('returns empty array for unknown market', () => {
    expect(getMarketRSNChannels('mars')).toEqual([]);
  });
});

describe('isRSNChannel', () => {
  it('returns true for known RSN channels', () => {
    expect(isRSNChannel('YES')).toBe(true);
    expect(isRSNChannel('NESN')).toBe(true);
    expect(isRSNChannel('NBC Sports Chicago')).toBe(true);
  });

  it('returns false for national channels', () => {
    expect(isRSNChannel('ESPN')).toBe(false);
    expect(isRSNChannel('FOX')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isRSNChannel('yes')).toBe(true);
    expect(isRSNChannel('Nesn')).toBe(true);
  });
});
