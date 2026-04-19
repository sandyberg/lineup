import cors from 'cors';
import express from 'express';
import { InMemoryCache } from './cache';
import { getServicesForChannel } from './channel-mapping';
import { fetchAllEvents, NormalizedEvent } from './sports-api';

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

type EnrichedEvent = NormalizedEvent & { availableServices: string[] };

const eventsCache = new InMemoryCache<EnrichedEvent[]>(60_000);
const CACHE_KEY = 'all-events';

export function clearCache() {
  eventsCache.clear();
}

export async function getEvents(): Promise<EnrichedEvent[]> {
  const cached = eventsCache.get(CACHE_KEY);
  if (cached) return cached;

  console.log('[server] Fetching fresh sports data...');
  const raw = await fetchAllEvents();

  const LEAGUE_SERVICE_MAP: Record<string, string> = {
    mlb: 'mlb-tv',
    nba: 'nba-league-pass',
    nfl: 'nfl-plus',
  };

  const SPORT_SERVICE_MAP: Record<string, string> = {
    mma: 'espn-plus',
    golf: 'espn-plus',
    nhl: 'espn-plus',
  };

  const enriched = raw.map((event) => {
    const services = [...getServicesForChannel(event.channel)];
    const leagueService = LEAGUE_SERVICE_MAP[event.sport];
    if (leagueService && !services.includes(leagueService)) {
      services.push(leagueService);
    }
    const sportService = SPORT_SERVICE_MAP[event.sport];
    if (sportService && !services.includes(sportService)) {
      services.push(sportService);
    }
    return { ...event, availableServices: services };
  });

  eventsCache.set(CACHE_KEY, enriched);
  console.log(`[server] Cached ${enriched.length} events`);
  return enriched;
}

app.get('/api/events', async (_req, res) => {
  try {
    const events = await getEvents();
    res.json({ events, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[server] Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    cached: eventsCache.has(CACHE_KEY),
    cacheAge: eventsCache.getAge(CACHE_KEY),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Lineup API running on http://localhost:${PORT}`);
  });
}
