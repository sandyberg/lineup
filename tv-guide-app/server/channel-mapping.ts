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
  { id: 'abc', name: 'ABC', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fox', name: 'FOX', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs1', name: 'FS1', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'fs2', name: 'FS2', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nbc', name: 'NBC', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'nbcsn', name: 'NBC Sports', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'usa', name: 'USA Network', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'cbs', name: 'CBS', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'tnt', name: 'TNT', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'tbs', name: 'TBS', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'trutv', name: 'truTV', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nfl-network', name: 'NFL Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'mlb-network', name: 'MLB Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nba-tv', name: 'NBA TV', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'nhl-network', name: 'NHL Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'golf-channel', name: 'Golf Channel', serviceIds: ['youtube-tv', 'hulu-live', 'peacock'] },
  { id: 'sec-network', name: 'SEC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'acc-network', name: 'ACC Network', serviceIds: ['youtube-tv', 'hulu-live', 'espn-plus'] },
  { id: 'big-ten', name: 'Big Ten Network', serviceIds: ['youtube-tv', 'hulu-live'] },
  { id: 'peacock', name: 'Peacock', serviceIds: ['peacock'] },
  { id: 'prime-video', name: 'Prime Video', serviceIds: ['prime-video'] },
  { id: 'apple-tv', name: 'Apple TV+', serviceIds: ['apple-tv'] },
  { id: 'mlb-tv', name: 'MLB.TV', serviceIds: ['mlb-tv'] },
  { id: 'mlb-tv-alt', name: 'MLBTV', serviceIds: ['mlb-tv'] },
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
