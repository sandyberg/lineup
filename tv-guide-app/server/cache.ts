interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class InMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMs: number = 60_000) {
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  getAge(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }

  get size(): number {
    return this.store.size;
  }
}
