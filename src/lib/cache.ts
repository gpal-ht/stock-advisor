interface CacheItem<T> {
  data: T;
  timestamp: number;
  timeRange: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function getCachedData<T>(key: string, timeRange: string): T | null {
  try {
    const item = localStorage.getItem(`stock_${key}_${timeRange}`);
    if (!item) return null;

    const cached: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    if (now - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`stock_${key}_${timeRange}`);
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, timeRange: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      timeRange,
    };
    localStorage.setItem(`stock_${key}_${timeRange}`, JSON.stringify(cacheItem));
  } catch {
    // Ignore cache errors
  }
}