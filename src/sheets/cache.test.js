const {
  buildCacheKey,
  getCachedData,
  setCachedData,
  invalidateCache,
  getCacheStats,
} = require('./cache');

describe('cache', () => {
  beforeEach(() => {
    invalidateCache();
  });

  describe('buildCacheKey', () => {
    it('builds a key from sheetId and range', () => {
      const key = buildCacheKey('abc123', 'Sheet1!A1:Z');
      expect(key).toBe('abc123:Sheet1!A1:Z');
    });

    it('uses default range when not provided', () => {
      const key = buildCacheKey('abc123');
      expect(key).toContain('abc123');
    });
  });

  describe('getCachedData / setCachedData', () => {
    it('returns null for a cache miss', () => {
      const result = getCachedData('missing-key');
      expect(result).toBeNull();
    });

    it('returns data after it has been set', () => {
      const data = [{ name: 'Alice', age: 30 }];
      setCachedData('my-key', data);
      const result = getCachedData('my-key');
      expect(result).toEqual(data);
    });

    it('returns null after TTL expires', () => {
      jest.useFakeTimers();
      setCachedData('ttl-key', [{ id: 1 }], 1000);
      jest.advanceTimersByTime(1500);
      const result = getCachedData('ttl-key');
      expect(result).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('invalidateCache', () => {
    it('clears all cached entries', () => {
      setCachedData('k1', [1]);
      setCachedData('k2', [2]);
      invalidateCache();
      expect(getCachedData('k1')).toBeNull();
      expect(getCachedData('k2')).toBeNull();
    });

    it('clears a specific key when provided', () => {
      setCachedData('k1', [1]);
      setCachedData('k2', [2]);
      invalidateCache('k1');
      expect(getCachedData('k1')).toBeNull();
      expect(getCachedData('k2')).toEqual([2]);
    });
  });

  describe('getCacheStats', () => {
    it('returns size 0 for empty cache', () => {
      const stats = getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('reflects current number of cached entries', () => {
      setCachedData('a', []);
      setCachedData('b', []);
      const stats = getCacheStats();
      expect(stats.size).toBe(2);
    });
  });
});
