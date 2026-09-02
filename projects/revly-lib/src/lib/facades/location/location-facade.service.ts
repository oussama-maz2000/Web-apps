import { inject, Injectable, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { Wilaya } from '../../models/types/common.types';
import { LocationCoordinates, LocationDto, Municipality } from '../../models/types/location.types';
import { LocationApiService } from '../../services/location/location-api.service';
import { LocationCacheService } from '../../services/location/location-cache.service';
import { IdentityStateService } from '../../state/identity-state.service';
import { toLanguageCode } from '../../utils/enum-types-utils';

/**
 * Facade that coordinates location-related operations and state management
 * Handles UI selection state, data fetching, and coordinates with location services
 */
@Injectable({
	providedIn: 'root'
})
export class LocationFacade {
	readonly #locationApiService = inject(LocationApiService);
	readonly #locationCacheService = inject(LocationCacheService);
	readonly #identityStateService = inject(IdentityStateService);

	// Data signals
	readonly #wilayasSignal = signal<Wilaya[] | null>(null);
	readonly #municipalitiesSignal = signal<Municipality[] | null>(null);

	// UI selection signals
	readonly #selectedWilaya = signal<Wilaya | null>(null);
	readonly #selectedMunicipality = signal<Municipality | null>(null);

	// Loading state signals
	readonly #wilayasLoading = signal(false);
	readonly #municipalitiesLoading = signal(false);
	readonly #locationDetecting = signal(false);

	// Expose data state
	readonly wilayas = this.#wilayasSignal.asReadonly();
	readonly municipalities = this.#municipalitiesSignal.asReadonly();
	readonly municipalitiesByWilaya = this.#locationCacheService.municipalitiesByWilaya;

	// Expose UI selection state
	readonly selectedWilaya = this.#selectedWilaya.asReadonly();
	readonly selectedMunicipality = this.#selectedMunicipality.asReadonly();

	// Expose loading states
	readonly wilayasLoading = this.#wilayasLoading.asReadonly();
	readonly municipalitiesLoading = this.#municipalitiesLoading.asReadonly();
	readonly locationDetecting = this.#locationDetecting.asReadonly();

	// Expose user location state (from identity state service)
	readonly currentLocation = this.#identityStateService.currentLocation;

	/**
	 * Loads wilayas data with optional cache refresh
	 */
	loadWilayas(forceRefresh = false): Observable<void> {
		const languageCode = toLanguageCode(this.#identityStateService.language());

		if (!forceRefresh) {
			const cachedWilayas = this.#locationCacheService.getCachedWilayas(languageCode);
			if (cachedWilayas) {
				this.#wilayasSignal.set(cachedWilayas);
				return EMPTY;
			}
		}

		const cacheKey = `wilayas-${languageCode}`;
		this.#wilayasLoading.set(true);

		return this.#locationCacheService
			.getOrCreateRequest(cacheKey, () => this.#locationApiService.getWilayas())
			.pipe(
				map((result) => {
					const wilayas = result.value as Wilaya[];
					if (!wilayas) return;

					this.#locationCacheService.setCachedWilayas(languageCode, wilayas);
					this.#wilayasSignal.set(wilayas);
				}),
				finalize(() => this.#wilayasLoading.set(false))
			);
	}

	/**
	 * Loads municipalities for a specific wilaya with optional cache refresh
	 */
	loadMunicipalities(wilayaCode: number, forceRefresh = false): Observable<void> {
		if (!wilayaCode) return EMPTY;

		if (!forceRefresh) {
			const cached = this.#locationCacheService.getCachedMunicipalities(wilayaCode);
			if (cached) {
				this.#municipalitiesSignal.set(cached);
				return EMPTY;
			}
		}

		const cacheKey = `municipalities-${wilayaCode}`;
		this.#municipalitiesLoading.set(true);

		return this.#locationCacheService
			.getOrCreateRequest(cacheKey, () => this.#locationApiService.getMunicipalities(wilayaCode))
			.pipe(
				map((result) => {
					const municipalities = result.value as Municipality[];
					if (!municipalities) return;
					this.#locationCacheService.setCachedMunicipalities(wilayaCode, municipalities);
					this.#municipalitiesSignal.set(municipalities);
				}),
				finalize(() => this.#municipalitiesLoading.set(false))
			);
	}

	/**
	 * Detects location based on provided coordinates
	 */
	detectLocationByCoordinates(coordinates: LocationCoordinates): Observable<void> {
		this.#locationDetecting.set(true);
		return this.#locationApiService.getMunicipalityByCoordinates(coordinates).pipe(
			tap((result) => {
				const municipality = result.value as Municipality;
				if (!municipality) return;

				const locationDto = {
					...coordinates,
					municipalityCode: municipality?.code ?? 0,
					stateCode: municipality?.stateCode ?? 0
				} satisfies LocationDto;

				this.#identityStateService.setCurrentLocation(locationDto);
			}),
			switchMap(() => EMPTY), // Convert to void observable
			finalize(() => this.#locationDetecting.set(false))
		);
	}

	/**
	 * Selects a wilaya and triggers loading its municipalities
	 */
	selectWilaya(wilaya: Wilaya | null): void {
		this.#selectedWilaya.set(wilaya);

		if (!wilaya)
			this.selectMunicipality(null); // Auto-load municipalities when wilaya is selected
		else
			//take 1 ensure observable stream is completed
			this.loadMunicipalities(wilaya.code).pipe(take(1)).subscribe();
	}

	/**
	 * Selects a municipality
	 */
	selectMunicipality(municipality: Municipality | null): void {
		this.#selectedMunicipality.set(municipality);
	}

	/**
	 * Gets municipalities for the currently selected wilaya
	 */
	getMunicipalitiesForSelectedWilaya(): Municipality[] {
		const selectedWilaya = this.selectedWilaya();
		return selectedWilaya ? this.#locationCacheService.getMunicipalitiesForWilaya(selectedWilaya.code) : [];
	}

	/**
	 * Resets wilaya and municipality selection
	 */
	resetSelection(): void {
		this.selectWilaya(null);
		this.selectMunicipality(null);
	}

	/**
	 * Clears all cached location data
	 */
	clearCache(): void {
		this.#locationCacheService.clearCache();
	}
}
