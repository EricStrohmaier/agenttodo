/**
 * Simple In-Memory Cache for Style Previews
 *
 * Caches generated style preview images to avoid regenerating
 * for the same character/style combination during a session.
 */

import crypto from "crypto";

// Cache entry structure
interface CacheEntry {
  imageUrl: string;
  createdAt: number;
  expiresAt: number;
}

// Style preview cache (in-memory)
const stylePreviewCache = new Map<string, CacheEntry>();

// Cache configuration
const CACHE_CONFIG = {
  /** Default TTL in milliseconds (1 hour) */
  defaultTTL: 60 * 60 * 1000,
  /** Maximum cache size (entries) */
  maxSize: 100,
  /** Cleanup interval in milliseconds (5 minutes) */
  cleanupInterval: 5 * 60 * 1000,
};

// Cleanup interval reference
let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Generate a cache key from character/style data
 */
export function generateCacheKey(params: {
  characterDescription: string;
  style: string;
  photoUrl?: string;
}): string {
  // Create a deterministic hash from the parameters
  const data = JSON.stringify({
    desc: params.characterDescription.toLowerCase().trim(),
    style: params.style.toLowerCase().trim(),
    photo: params.photoUrl || "",
  });

  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
}

/**
 * Get a cached style preview
 */
export function getCachedStylePreview(key: string): CacheEntry | null {
  const entry = stylePreviewCache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    stylePreviewCache.delete(key);
    return null;
  }

  return entry;
}

/**
 * Set a cached style preview
 */
export function setCachedStylePreview(
  key: string,
  imageUrl: string,
  ttlMs?: number
): void {
  const now = Date.now();
  const ttl = ttlMs || CACHE_CONFIG.defaultTTL;

  // Enforce max cache size
  if (stylePreviewCache.size >= CACHE_CONFIG.maxSize) {
    cleanExpiredCache();

    // If still at max, remove oldest entry
    if (stylePreviewCache.size >= CACHE_CONFIG.maxSize) {
      const oldestKey = stylePreviewCache.keys().next().value;
      if (oldestKey) {
        stylePreviewCache.delete(oldestKey);
      }
    }
  }

  stylePreviewCache.set(key, {
    imageUrl,
    createdAt: now,
    expiresAt: now + ttl,
  });
}

/**
 * Clean expired entries from the cache
 */
export function cleanExpiredCache(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of stylePreviewCache.entries()) {
    if (now > entry.expiresAt) {
      stylePreviewCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Cache cleanup: removed ${cleaned} expired entries`);
  }

  return cleaned;
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  stylePreviewCache.clear();
  console.log("Cache cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
} {
  return {
    size: stylePreviewCache.size,
    maxSize: CACHE_CONFIG.maxSize,
  };
}

/**
 * Start automatic cache cleanup
 */
export function startCacheCleanup(): void {
  if (cleanupIntervalId) {
    return; // Already running
  }

  cleanupIntervalId = setInterval(() => {
    cleanExpiredCache();
  }, CACHE_CONFIG.cleanupInterval);

  console.log("Cache cleanup started");
}

/**
 * Stop automatic cache cleanup
 */
export function stopCacheCleanup(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log("Cache cleanup stopped");
  }
}

/**
 * Cache decorator for async functions
 */
export function withCache<T extends (...args: unknown[]) => Promise<string>>(
  keyGenerator: (...args: Parameters<T>) => string,
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<string> => {
    const key = keyGenerator(...args);

    // Check cache first
    const cached = getCachedStylePreview(key);
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
      return cached.imageUrl;
    }

    // Generate and cache
    console.log(`Cache miss for key: ${key}`);
    const result = await fn(...args);
    setCachedStylePreview(key, result);

    return result;
  }) as T;
}

// Start cleanup on module load (in production)
if (process.env.NODE_ENV === "production") {
  startCacheCleanup();
}
