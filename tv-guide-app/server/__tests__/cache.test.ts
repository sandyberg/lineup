import { InMemoryCache } from '../cache';

describe('InMemoryCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stores and retrieves values', () => {
    const cache = new InMemoryCache<string>(60_000);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for missing keys', () => {
    const cache = new InMemoryCache<string>(60_000);
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', () => {
    const cache = new InMemoryCache<string>(1000);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    jest.advanceTimersByTime(999);
    expect(cache.get('key1')).toBe('value1');

    jest.advanceTimersByTime(2);
    expect(cache.get('key1')).toBeNull();
  });

  it('has() reflects TTL expiration', () => {
    const cache = new InMemoryCache<string>(500);
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);

    jest.advanceTimersByTime(501);
    expect(cache.has('key1')).toBe(false);
  });

  it('clear() removes all entries', () => {
    const cache = new InMemoryCache<number>(60_000);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  it('getAge() returns milliseconds since set', () => {
    const cache = new InMemoryCache<string>(60_000);
    cache.set('key1', 'value1');

    jest.advanceTimersByTime(5000);
    const age = cache.getAge('key1');
    expect(age).toBe(5000);
  });

  it('getAge() returns null for missing keys', () => {
    const cache = new InMemoryCache<string>(60_000);
    expect(cache.getAge('nonexistent')).toBeNull();
  });

  it('overwrites existing values', () => {
    const cache = new InMemoryCache<string>(60_000);
    cache.set('key1', 'first');
    cache.set('key1', 'second');
    expect(cache.get('key1')).toBe('second');
  });

  it('overwriting resets the TTL', () => {
    const cache = new InMemoryCache<string>(1000);
    cache.set('key1', 'first');

    jest.advanceTimersByTime(800);
    cache.set('key1', 'second');

    jest.advanceTimersByTime(800);
    expect(cache.get('key1')).toBe('second');

    jest.advanceTimersByTime(201);
    expect(cache.get('key1')).toBeNull();
  });

  it('supports complex object values', () => {
    const cache = new InMemoryCache<{ events: string[]; count: number }>(60_000);
    const data = { events: ['a', 'b', 'c'], count: 3 };
    cache.set('events', data);

    const retrieved = cache.get('events');
    expect(retrieved).toEqual(data);
    expect(retrieved?.events).toHaveLength(3);
  });

  it('supports array values', () => {
    const cache = new InMemoryCache<number[]>(60_000);
    cache.set('nums', [1, 2, 3]);
    expect(cache.get('nums')).toEqual([1, 2, 3]);
  });

  it('size tracks entries correctly', () => {
    const cache = new InMemoryCache<string>(60_000);
    expect(cache.size).toBe(0);

    cache.set('a', 'val');
    expect(cache.size).toBe(1);

    cache.set('b', 'val');
    expect(cache.size).toBe(2);

    cache.set('a', 'overwrite');
    expect(cache.size).toBe(2);
  });

  it('defaults TTL to 60 seconds', () => {
    const cache = new InMemoryCache<string>();
    cache.set('key1', 'value1');

    jest.advanceTimersByTime(59_999);
    expect(cache.get('key1')).toBe('value1');

    jest.advanceTimersByTime(2);
    expect(cache.get('key1')).toBeNull();
  });

  it('handles concurrent keys independently', () => {
    const cache = new InMemoryCache<string>(2000);
    cache.set('early', 'val1');
    jest.advanceTimersByTime(1000);
    cache.set('late', 'val2');

    jest.advanceTimersByTime(1001);
    expect(cache.get('early')).toBeNull();
    expect(cache.get('late')).toBe('val2');

    jest.advanceTimersByTime(1000);
    expect(cache.get('late')).toBeNull();
  });
});
