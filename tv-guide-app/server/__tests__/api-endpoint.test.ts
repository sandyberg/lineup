import request from 'supertest';
import { app, clearCache } from '../index';

beforeEach(() => {
  clearCache();
});

describe('GET /api/health', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('reports cache status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('cached');
    expect(res.body).toHaveProperty('cacheAge');
  });

  it('shows not cached initially', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.cached).toBe(false);
    expect(res.body.cacheAge).toBeNull();
  });
});

describe('GET /api/events', () => {
  it('returns 200 with events array', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('events');
    expect(Array.isArray(res.body.events)).toBe(true);
  }, 30000);

  it('returns a timestamp', async () => {
    const res = await request(app).get('/api/events');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
  }, 30000);

  it('returns events with required fields', async () => {
    const res = await request(app).get('/api/events');
    if (res.body.events.length > 0) {
      const event = res.body.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('sport');
      expect(event).toHaveProperty('league');
      expect(event).toHaveProperty('channel');
      expect(event).toHaveProperty('startTime');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('availableServices');
      expect(['upcoming', 'live', 'final']).toContain(event.status);
      expect(Array.isArray(event.availableServices)).toBe(true);
    }
  }, 30000);

  it('caches results on second call', async () => {
    await request(app).get('/api/events');
    const healthBefore = await request(app).get('/api/health');
    expect(healthBefore.body.cached).toBe(true);

    const res2 = await request(app).get('/api/events');
    expect(res2.status).toBe(200);
  }, 30000);

  it('returns events sorted by start time', async () => {
    const res = await request(app).get('/api/events');
    const events = res.body.events;
    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].startTime).getTime();
      const curr = new Date(events[i].startTime).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  }, 30000);

  it('has CORS headers', async () => {
    const res = await request(app).get('/api/events');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  }, 30000);
});

describe('404 handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
