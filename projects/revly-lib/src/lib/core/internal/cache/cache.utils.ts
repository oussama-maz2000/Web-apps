import { CacheEntry as CacheItem } from './cache.types';

export function isValidEntry<T>(item: CacheItem<T> | undefined, CacheTtlMs: number): item is CacheItem<T> {
	if (!item) return false;
	return Date.now() - item.timestamp < CacheTtlMs;
}
