/**
 * High-performance In-Memory Cache with TTL and Key Invalidation
 * Dramatically reduces database overhead when 2,000+ students fetch
 * static questions, quotes, categories, and self-care items.
 */

class MemoryCache {
  constructor(defaultTtlMs = 60000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  clearPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll() {
    this.cache.clear();
  }
}

const memoryCache = new MemoryCache(5 * 60 * 1000); // 5 minutes default TTL

module.exports = memoryCache;
