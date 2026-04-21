export interface RSNChannel {
  name: string;
  serviceIds: string[];
}

export interface TVMarket {
  id: string;
  label: string;
  channels: RSNChannel[];
}

export const TV_MARKETS: TVMarket[] = [
  {
    id: 'new-york',
    label: 'New York',
    channels: [
      { name: 'YES', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'YES Network', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'SNY', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'MSG', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'MSG+', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'boston',
    label: 'Boston',
    channels: [
      { name: 'NESN', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'NESN+', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'NBC Sports Boston', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'chicago',
    label: 'Chicago',
    channels: [
      { name: 'NBC Sports Chicago', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'Marquee', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'Marquee Sports Network', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'los-angeles',
    label: 'Los Angeles',
    channels: [
      { name: 'SportsNet LA', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'Spectrum SportsNet', serviceIds: [] },
      { name: 'Bally Sports West', serviceIds: [] },
      { name: 'BSW', serviceIds: [] },
    ],
  },
  {
    id: 'philadelphia',
    label: 'Philadelphia',
    channels: [
      { name: 'NBC Sports Philadelphia', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'NBCS Philadelphia', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'san-francisco',
    label: 'San Francisco Bay Area',
    channels: [
      { name: 'NBC Sports Bay Area', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'NBCS Bay Area', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'NBC Sports California', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'dallas',
    label: 'Dallas-Fort Worth',
    channels: [
      { name: 'Bally Sports Southwest', serviceIds: [] },
      { name: 'BSSW', serviceIds: [] },
    ],
  },
  {
    id: 'houston',
    label: 'Houston',
    channels: [
      { name: 'Space City Home Network', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'SCHN', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'washington-dc',
    label: 'Washington DC',
    channels: [
      { name: 'MASN', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'MASN2', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'Monumental Sports Network', serviceIds: [] },
      { name: 'NBC Sports Washington', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'atlanta',
    label: 'Atlanta',
    channels: [
      { name: 'Bally Sports Southeast', serviceIds: [] },
      { name: 'BSSE', serviceIds: [] },
      { name: 'Bally Sports South', serviceIds: [] },
    ],
  },
  {
    id: 'detroit',
    label: 'Detroit',
    channels: [
      { name: 'Bally Sports Detroit', serviceIds: [] },
      { name: 'BSD', serviceIds: [] },
    ],
  },
  {
    id: 'minneapolis',
    label: 'Minneapolis-St. Paul',
    channels: [
      { name: 'Bally Sports North', serviceIds: [] },
      { name: 'BSN', serviceIds: [] },
    ],
  },
  {
    id: 'denver',
    label: 'Denver',
    channels: [
      { name: 'Altitude', serviceIds: [] },
      { name: 'Altitude Sports', serviceIds: [] },
    ],
  },
  {
    id: 'phoenix',
    label: 'Phoenix',
    channels: [
      { name: 'Arizona Sports', serviceIds: [] },
      { name: 'Bally Sports Arizona', serviceIds: [] },
      { name: 'BSAZ', serviceIds: [] },
    ],
  },
  {
    id: 'miami',
    label: 'Miami-Fort Lauderdale',
    channels: [
      { name: 'Bally Sports Sun', serviceIds: [] },
      { name: 'Bally Sports Florida', serviceIds: [] },
      { name: 'BSFL', serviceIds: [] },
    ],
  },
  {
    id: 'seattle',
    label: 'Seattle',
    channels: [
      { name: 'ROOT Sports', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'ROOT Sports NW', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'cleveland',
    label: 'Cleveland',
    channels: [
      { name: 'Bally Sports Great Lakes', serviceIds: [] },
      { name: 'BSGL', serviceIds: [] },
    ],
  },
  {
    id: 'pittsburgh',
    label: 'Pittsburgh',
    channels: [
      { name: 'SportsNet Pittsburgh', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'SNP', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'AT&T SportsNet Pittsburgh', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'san-diego',
    label: 'San Diego',
    channels: [
      { name: 'Padres.TV', serviceIds: ['mlb-tv'] },
      { name: 'San Diego Padres', serviceIds: ['mlb-tv'] },
    ],
  },
  {
    id: 'st-louis',
    label: 'St. Louis',
    channels: [
      { name: 'Bally Sports Midwest', serviceIds: [] },
      { name: 'BSMW', serviceIds: [] },
    ],
  },
  {
    id: 'milwaukee',
    label: 'Milwaukee',
    channels: [
      { name: 'Bally Sports Wisconsin', serviceIds: [] },
      { name: 'BSWI', serviceIds: [] },
    ],
  },
  {
    id: 'tampa-bay',
    label: 'Tampa Bay',
    channels: [
      { name: 'Bally Sports Sun', serviceIds: [] },
      { name: 'BSSUN', serviceIds: [] },
    ],
  },
  {
    id: 'portland',
    label: 'Portland',
    channels: [
      { name: 'ROOT Sports', serviceIds: ['youtube-tv', 'hulu-live'] },
      { name: 'ROOT Sports NW', serviceIds: ['youtube-tv', 'hulu-live'] },
    ],
  },
  {
    id: 'cincinnati',
    label: 'Cincinnati',
    channels: [
      { name: 'Bally Sports Ohio', serviceIds: [] },
      { name: 'BSOH', serviceIds: [] },
    ],
  },
  {
    id: 'kansas-city',
    label: 'Kansas City',
    channels: [
      { name: 'Bally Sports Kansas City', serviceIds: [] },
      { name: 'BSKC', serviceIds: [] },
    ],
  },
  {
    id: 'toronto',
    label: 'Toronto',
    channels: [
      { name: 'Sportsnet', serviceIds: [] },
      { name: 'TSN', serviceIds: [] },
    ],
  },
];

const MARKET_MAP = new Map<string, TVMarket>(
  TV_MARKETS.map((m) => [m.id, m]),
);

export function getMarketById(id: string): TVMarket | undefined {
  return MARKET_MAP.get(id);
}

const CHANNEL_NAME_INDEX = new Map<string, TVMarket[]>();
for (const market of TV_MARKETS) {
  for (const ch of market.channels) {
    const key = ch.name.toLowerCase();
    const existing = CHANNEL_NAME_INDEX.get(key) ?? [];
    existing.push(market);
    CHANNEL_NAME_INDEX.set(key, existing);
  }
}

export function getMarketsForChannel(channelName: string): TVMarket[] {
  return CHANNEL_NAME_INDEX.get(channelName.toLowerCase()) ?? [];
}

export function getMarketRSNChannels(marketId: string): RSNChannel[] {
  return MARKET_MAP.get(marketId)?.channels ?? [];
}

export function isRSNChannel(channelName: string): boolean {
  return CHANNEL_NAME_INDEX.has(channelName.toLowerCase());
}
