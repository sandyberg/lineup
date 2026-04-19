import { groupEventsBySport } from '@/lib/api';
import { SportEvent } from '@/lib/types';

function makeEvent(overrides: Partial<SportEvent> = {}): SportEvent {
  return {
    id: 'test-1',
    title: 'Team A at Team B',
    sport: 'nba',
    league: 'NBA',
    channel: 'ESPN',
    startTime: new Date().toISOString(),
    status: 'upcoming',
    availableServices: ['youtube-tv'],
    ...overrides,
  };
}

const now = Date.now();
const ONE_HOUR = 60 * 60_000;

describe('groupEventsBySport', () => {
  it('groups events by sport category', () => {
    const events = [
      makeEvent({ id: 'nba-1', sport: 'nba' }),
      makeEvent({ id: 'mlb-1', sport: 'mlb' }),
      makeEvent({ id: 'nba-2', sport: 'nba' }),
      makeEvent({ id: 'nhl-1', sport: 'nhl' }),
    ];
    const groups = groupEventsBySport(events);
    const sportIds = groups.map((g) => g.group);
    expect(sportIds).toContain('nba');
    expect(sportIds).toContain('mlb');
    expect(sportIds).toContain('nhl');
  });

  it('NBA group contains only NBA events', () => {
    const events = [
      makeEvent({ id: 'nba-1', sport: 'nba' }),
      makeEvent({ id: 'mlb-1', sport: 'mlb' }),
      makeEvent({ id: 'nba-2', sport: 'nba' }),
    ];
    const groups = groupEventsBySport(events);
    const nbaGroup = groups.find((g) => g.group === 'nba');
    expect(nbaGroup).toBeDefined();
    expect(nbaGroup!.events).toHaveLength(2);
    expect(nbaGroup!.events.every((e) => e.sport === 'nba')).toBe(true);
  });

  it('uses correct display labels', () => {
    const events = [
      makeEvent({ id: 'nfl-1', sport: 'nfl' }),
      makeEvent({ id: 'nba-1', sport: 'nba' }),
      makeEvent({ id: 'soccer-1', sport: 'soccer' }),
      makeEvent({ id: 'cfb-1', sport: 'college-football' }),
    ];
    const groups = groupEventsBySport(events);
    expect(groups.find((g) => g.group === 'nfl')!.label).toBe('NFL');
    expect(groups.find((g) => g.group === 'nba')!.label).toBe('NBA');
    expect(groups.find((g) => g.group === 'soccer')!.label).toBe('Soccer');
    expect(groups.find((g) => g.group === 'college-football')!.label).toBe('College Football');
  });

  it('follows standard sport display order', () => {
    const events = [
      makeEvent({ id: 'soccer-1', sport: 'soccer' }),
      makeEvent({ id: 'nba-1', sport: 'nba' }),
      makeEvent({ id: 'nfl-1', sport: 'nfl' }),
      makeEvent({ id: 'mlb-1', sport: 'mlb' }),
      makeEvent({ id: 'nhl-1', sport: 'nhl' }),
    ];
    const groups = groupEventsBySport(events);
    const order = groups.map((g) => g.group);
    expect(order.indexOf('nfl')).toBeLessThan(order.indexOf('nba'));
    expect(order.indexOf('nba')).toBeLessThan(order.indexOf('mlb'));
    expect(order.indexOf('mlb')).toBeLessThan(order.indexOf('nhl'));
    expect(order.indexOf('nhl')).toBeLessThan(order.indexOf('soccer'));
  });

  it('puts live events first within each sport group', () => {
    const events = [
      makeEvent({
        id: 'nba-upcoming',
        sport: 'nba',
        status: 'upcoming',
        startTime: new Date(now + ONE_HOUR).toISOString(),
      }),
      makeEvent({
        id: 'nba-live',
        sport: 'nba',
        status: 'live',
        startTime: new Date(now - ONE_HOUR).toISOString(),
      }),
    ];
    const groups = groupEventsBySport(events);
    const nbaGroup = groups.find((g) => g.group === 'nba')!;
    expect(nbaGroup.events[0].id).toBe('nba-live');
    expect(nbaGroup.events[1].id).toBe('nba-upcoming');
  });

  it('excludes final events', () => {
    const events = [
      makeEvent({ id: 'nba-live', sport: 'nba', status: 'live' }),
      makeEvent({ id: 'nba-final', sport: 'nba', status: 'final' }),
    ];
    const groups = groupEventsBySport(events);
    const nbaGroup = groups.find((g) => g.group === 'nba')!;
    expect(nbaGroup.events).toHaveLength(1);
    expect(nbaGroup.events[0].id).toBe('nba-live');
  });

  it('omits sports with no non-final events', () => {
    const events = [
      makeEvent({ id: 'nba-final', sport: 'nba', status: 'final' }),
      makeEvent({ id: 'mlb-live', sport: 'mlb', status: 'live' }),
    ];
    const groups = groupEventsBySport(events);
    expect(groups.find((g) => g.group === 'nba')).toBeUndefined();
    expect(groups.find((g) => g.group === 'mlb')).toBeDefined();
  });

  it('returns empty array for empty input', () => {
    expect(groupEventsBySport([])).toEqual([]);
  });

  it('returns empty array when all events are final', () => {
    const events = [
      makeEvent({ id: 'final-1', sport: 'nba', status: 'final' }),
      makeEvent({ id: 'final-2', sport: 'nfl', status: 'final' }),
    ];
    expect(groupEventsBySport(events)).toEqual([]);
  });

  it('sorts upcoming events chronologically within a sport', () => {
    const events = [
      makeEvent({
        id: 'mlb-later',
        sport: 'mlb',
        status: 'upcoming',
        startTime: new Date(now + 5 * ONE_HOUR).toISOString(),
      }),
      makeEvent({
        id: 'mlb-sooner',
        sport: 'mlb',
        status: 'upcoming',
        startTime: new Date(now + ONE_HOUR).toISOString(),
      }),
    ];
    const groups = groupEventsBySport(events);
    const mlbGroup = groups.find((g) => g.group === 'mlb')!;
    expect(mlbGroup.events[0].id).toBe('mlb-sooner');
    expect(mlbGroup.events[1].id).toBe('mlb-later');
  });
});
