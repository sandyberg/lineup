interface ChannelEntry {
  id: string;
  name: string;
  serviceIds: string[];
}

const CHANNELS: ChannelEntry[] = [
  { id: 'espn', name: 'ESPN', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espn2', name: 'ESPN2', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espnu', name: 'ESPNU', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espnews', name: 'ESPNews', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espn-plus', name: 'ESPN+', serviceIds: ['espn-plus'] },
  { id: 'espn-ppv', name: 'ESPN PPV', serviceIds: ['espn-plus'] },
  { id: 'espn-ppv-alt', name: 'ESPN+ PPV', serviceIds: ['espn-plus'] },
  { id: 'espn-unlmtd', name: 'ESPN Unlmtd', serviceIds: ['espn-plus'] },
  { id: 'espn-unlimited', name: 'ESPN Unlimited', serviceIds: ['espn-plus'] },
  { id: 'abc', name: 'ABC', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fox', name: 'FOX', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs1', name: 'FS1', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs2', name: 'FS2', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc', name: 'NBC', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'nbcsn', name: 'NBC Sports', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'usa', name: 'USA Network', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'cbs', name: 'CBS', serviceIds: ['youtube-tv', 'hulu-live', 'paramount-plus'] },
  { id: 'cbs-sports', name: 'CBS Sports Network', serviceIds: ['youtube-tv', 'hulu-live', 'paramount-plus'] },
  { id: 'paramount-plus', name: 'Paramount+', serviceIds: ['paramount-plus'] },
  { id: 'tnt', name: 'TNT', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'tbs', name: 'TBS', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'trutv', name: 'truTV', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nfl-network', name: 'NFL Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'mlb-network', name: 'MLB Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nba-tv', name: 'NBA TV', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nhl-network', name: 'NHL Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'golf-channel', name: 'Golf Channel', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'pga-tour-live', name: 'PGA Tour Live', serviceIds: ['espn-plus'] },
  { id: 'sec-network', name: 'SEC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'acc-network', name: 'ACC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'big-ten', name: 'Big Ten Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'peacock', name: 'Peacock', serviceIds: ['peacock'] },
  { id: 'prime-video', name: 'Prime Video', serviceIds: ['prime-video'] },
  { id: 'apple-tv', name: 'Apple TV+', serviceIds: ['apple-tv'] },
  { id: 'mlb-tv', name: 'MLB.TV', serviceIds: ['mlb-tv'] },
  { id: 'mlb-tv-alt', name: 'MLBTV', serviceIds: ['mlb-tv'] },
  { id: 'nba-league-pass', name: 'NBA League Pass', serviceIds: ['nba-league-pass'] },
  { id: 'nfl-plus', name: 'NFL+', serviceIds: ['nfl-plus'] },
  { id: 'nfl-sunday-ticket', name: 'NFL Sunday Ticket', serviceIds: ['nfl-sunday-ticket'] },

  // Regional Sports Networks (RSNs)
  { id: 'yes', name: 'YES', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'yes-network', name: 'YES Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'sny', name: 'SNY', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'msg', name: 'MSG', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'msg-plus', name: 'MSG+', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nesn', name: 'NESN', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nesn-plus', name: 'NESN+', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-boston', name: 'NBC Sports Boston', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-chicago', name: 'NBC Sports Chicago', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'marquee', name: 'Marquee', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'marquee-sports', name: 'Marquee Sports Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'sportsnet-la', name: 'SportsNet LA', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-philly', name: 'NBC Sports Philadelphia', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbcs-philly', name: 'NBCS Philadelphia', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-bayarea', name: 'NBC Sports Bay Area', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbcs-bayarea', name: 'NBCS Bay Area', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-california', name: 'NBC Sports California', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc-sports-washington', name: 'NBC Sports Washington', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'masn', name: 'MASN', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'masn2', name: 'MASN2', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'space-city', name: 'Space City Home Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'root-sports', name: 'ROOT Sports', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'root-sports-nw', name: 'ROOT Sports NW', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'sportsnet-pitt', name: 'SportsNet Pittsburgh', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'att-sportsnet-pitt', name: 'AT&T SportsNet Pittsburgh', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'bally-southwest', name: 'Bally Sports Southwest', serviceIds: [] },
  { id: 'bally-southeast', name: 'Bally Sports Southeast', serviceIds: [] },
  { id: 'bally-south', name: 'Bally Sports South', serviceIds: [] },
  { id: 'bally-detroit', name: 'Bally Sports Detroit', serviceIds: [] },
  { id: 'bally-north', name: 'Bally Sports North', serviceIds: [] },
  { id: 'bally-west', name: 'Bally Sports West', serviceIds: [] },
  { id: 'bally-sun', name: 'Bally Sports Sun', serviceIds: [] },
  { id: 'bally-florida', name: 'Bally Sports Florida', serviceIds: [] },
  { id: 'bally-greatlakes', name: 'Bally Sports Great Lakes', serviceIds: [] },
  { id: 'bally-ohio', name: 'Bally Sports Ohio', serviceIds: [] },
  { id: 'bally-midwest', name: 'Bally Sports Midwest', serviceIds: [] },
  { id: 'bally-wisconsin', name: 'Bally Sports Wisconsin', serviceIds: [] },
  { id: 'bally-kc', name: 'Bally Sports Kansas City', serviceIds: [] },
  { id: 'bally-arizona', name: 'Bally Sports Arizona', serviceIds: [] },
  { id: 'altitude', name: 'Altitude', serviceIds: [] },
  { id: 'altitude-sports', name: 'Altitude Sports', serviceIds: [] },
];

function normalizeChannelName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9+]/g, '').trim();
}

const CHANNEL_LOOKUP = new Map<string, ChannelEntry>();
for (const ch of CHANNELS) {
  CHANNEL_LOOKUP.set(normalizeChannelName(ch.name), ch);
}

export function getServicesForChannel(channelName: string): string[] {
  if (!channelName) return [];

  const normalized = normalizeChannelName(channelName);
  const exact = CHANNEL_LOOKUP.get(normalized);
  if (exact) return exact.serviceIds;

  let bestMatch: ChannelEntry | null = null;
  let bestLen = 0;

  for (const [key, ch] of CHANNEL_LOOKUP) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const matchLen = Math.min(key.length, normalized.length);
      if (matchLen > bestLen) {
        bestLen = matchLen;
        bestMatch = ch;
      }
    }
  }

  return bestMatch?.serviceIds ?? [];
}
