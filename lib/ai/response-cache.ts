/**
 * In-memory cache for LLM responses.
 * Stores responses to avoid redundant API calls.
 */

interface CacheEntry {
  response: string;
  timestamp: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;

  constructor(ttlHours: number = 1) {
    this.cache = new Map();
    this.ttl = ttlHours * 60 * 60 * 1000;
  }

  /**
   * Generate a stable cache key based on userId and the query string.
   */
  private generateKey(userId: string, query: string): string {
    return `${userId}:${query.trim().toLowerCase()}`;
  }

  /**
   * Retrieves a cached response if it exists and is still valid.
   */
  get(userId: string, query: string): string | null {
    const key = this.generateKey(userId, query);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  /**
   * Stores a response in the cache.
   */
  set(userId: string, query: string, response: string): void {
    const key = this.generateKey(userId, query);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Clears all cache entries for a given user (e.g., when they update marks).
   */
  invalidateUser(userId: string): void {
    const prefix = `${userId}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clearAll(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const llmCache = new ResponseCache();
