import { Channel } from '@/lib/types';

export const CHANNELS: Channel[] = [
  { id: 'espn', name: 'ESPN', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espn2', name: 'ESPN2', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espnu', name: 'ESPNU', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'espnews', name: 'ESPNews', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'abc', name: 'ABC', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fox', name: 'FOX', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs1', name: 'FS1', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs2', name: 'FS2', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc', name: 'NBC', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'nbcsn', name: 'NBC Sports', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'cbs', name: 'CBS', serviceIds: ['youtube-tv', 'hulu-live', 'paramount-plus'] },
  { id: 'cbs-sports', name: 'CBS Sports Network', serviceIds: ['youtube-tv', 'hulu-live', 'paramount-plus'] },
  { id: 'paramount-exclusive', name: 'Paramount+', serviceIds: ['paramount-plus'] },
  { id: 'tnt', name: 'TNT', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'tbs', name: 'TBS', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'trutv', name: 'truTV', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nfl-network', name: 'NFL Network', serviceIds: ['youtube-tv', 'hulu-live', 'nfl-plus'] },
  { id: 'mlb-network', name: 'MLB Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nba-tv', name: 'NBA TV', serviceIds: ['youtube-tv', 'hulu-live', 'nba-league-pass'] },
  { id: 'nhl-network', name: 'NHL Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'golf-channel', name: 'Golf Channel', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'pga-tour-live', name: 'PGA Tour Live', serviceIds: ['espn-plus'] },
  { id: 'usa', name: 'USA Network', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'peacock-exclusive', name: 'Peacock', serviceIds: ['peacock'] },
  { id: 'prime-exclusive', name: 'Prime Video', serviceIds: ['prime-video'] },
  { id: 'apple-exclusive', name: 'Apple TV+', serviceIds: ['apple-tv'] },
  { id: 'espn-plus-exclusive', name: 'ESPN+', serviceIds: ['espn-plus'] },
  { id: 'espn-ppv', name: 'ESPN PPV', serviceIds: ['espn-plus'] },
  { id: 'espn-ppv-alt', name: 'ESPN+ PPV', serviceIds: ['espn-plus'] },
  { id: 'sec-network', name: 'SEC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'acc-network', name: 'ACC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'big-ten', name: 'Big Ten Network', serviceIds: ['youtube-tv', 'hulu-live'] },
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

export const CHANNEL_MAP = Object.fromEntries(
  CHANNELS.map((c) => [c.name.toLowerCase(), c]),
);

export function findChannelByName(name: string): Channel | undefined {
  const normalized = name.toLowerCase().trim();
  return (
    CHANNEL_MAP[normalized] ??
    CHANNELS.find(
      (c) =>
        normalized.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(normalized),
    )
  );
}
