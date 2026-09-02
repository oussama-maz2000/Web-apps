import { Injectable, signal } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheEntry } from '../../core/internal/cache/cache.types';
import { isValidEntry } from '../../core/internal/cache/cache.utils';
import { Wilaya } from '../../models/types/common.types';
import { Municipality } from '../../models/types/location.types';

/**
 * Service for caching and managing location data
 * Provides reactive access to wilayas and municipalities data
 * Handles in-memory caching with TTL for optimal performance
 */
@Injectable({
	providedIn: 'root'
})
export class LocationCacheService {
	static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

	readonly #wilayasCache = new Map<string, CacheEntry<Wilaya[]>>();
	readonly #municipalitiesCache = new Map<number, CacheEntry<Municipality[]>>();
	readonly #activeRequests = new Map<string, Observable<unknown>>();

	// Signal for municipalities map to enable reactive access
	readonly #municipalitiesByWilaya = signal<Map<number, Municipality[]>>(new Map());

	// Readonly accessor
	readonly municipalitiesByWilaya = this.#municipalitiesByWilaya.asReadonly();

	/**
	 * Get cached wilayas for a specific language
	 * @param languageCode The language code to fetch wilayas for
	 * @returns Array of wilayas if valid in cache, null otherwise
	 */
	getCachedWilayas(languageCode: string): Wilaya[] | null {
		const entry = this.#wilayasCache.get(languageCode);
		return isValidEntry(entry, LocationCacheService.CACHE_TTL_MS) ? entry.data : null;
	}

	/**
	 * Cache wilayas for a specific language
	 * @param languageCode The language code to cache wilayas for
	 * @param wilayas The wilayas data to cache
	 */
	setCachedWilayas(languageCode: string, wilayas: Wilaya[]): void {
		this.#wilayasCache.set(languageCode, {
			data: wilayas,
			timestamp: Date.now()
		});
	}

	/**
	 * Get cached municipalities for a specific wilaya
	 * @param wilayaCode The wilaya code to fetch municipalities for
	 * @returns Array of municipalities if valid in cache, null otherwise
	 */
	getCachedMunicipalities(wilayaCode: number): Municipality[] | null {
		const entry = this.#municipalitiesCache.get(wilayaCode);
		return isValidEntry(entry, LocationCacheService.CACHE_TTL_MS) ? entry.data : null;
	}

	/**
	 * Cache municipalities for a specific wilaya
	 * @param wilayaCode The wilaya code to cache municipalities for
	 * @param municipalities The municipalities data to cache
	 */
	setCachedMunicipalities(wilayaCode: number, municipalities: Municipality[]): void {
		// Update the cache
		this.#municipalitiesCache.set(wilayaCode, {
			data: municipalities,
			timestamp: Date.now()
		});

		// Also update the signal for reactive access
		const currentMap = this.#municipalitiesByWilaya();
		const newMap = new Map(currentMap);
		newMap.set(wilayaCode, municipalities);
		this.#municipalitiesByWilaya.set(newMap);
	}

	/**
	 * Get municipalities for a specific wilaya, merging cache and signal data
	 * @param wilayaCode The wilaya code to get municipalities for
	 * @returns Array of municipalities (empty if none found)
	 */
	getMunicipalitiesForWilaya(wilayaCode: number): Municipality[] {
		// Try to get from cache first
		const cached = this.getCachedMunicipalities(wilayaCode);
		if (cached) {
			return cached;
		}

		// Fall back to signal data if available
		return this.#municipalitiesByWilaya().get(wilayaCode) ?? [];
	}

	/**
	 * Get or create a request for a resource, preventing duplicate requests
	 * @param key Unique key for the request
	 * @param requestFactory Factory function to create the request if it doesn't exist
	 * @returns Observable for the request
	 */
	getOrCreateRequest<T>(key: string, requestFactory: () => Observable<T>): Observable<T> {
		if (this.#activeRequests.has(key)) {
			return this.#activeRequests.get(key) as Observable<T>;
		}

		const request$ = requestFactory().pipe(
			tap(() => this.#activeRequests.delete(key)),
			shareReplay(1)
		);

		this.#activeRequests.set(key, request$);
		return request$;
	}

	/**
	 * Clear all cached data
	 */
	clearCache(): void {
		this.#wilayasCache.clear();
		this.#municipalitiesCache.clear();
		this.#activeRequests.clear();
		this.#municipalitiesByWilaya.set(new Map());
	}
}
