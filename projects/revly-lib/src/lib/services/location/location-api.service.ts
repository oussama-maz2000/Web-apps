import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_LOCATION_ENDPOINTS } from '../../core/api/location-api-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { Wilaya } from '../../models/types/common.types';
import { LocationCoordinates, Municipality } from '../../models/types/location.types';

/**
 * Service for making location-related API calls
 * Pure data fetching service with no state management
 */
@Injectable({
	providedIn: 'root'
})
export class LocationApiService {
	//DI
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Fetch list of available wilayas (states/provinces)
	 */
	getWilayas(): Observable<Result<Wilaya[]>> {
		return this.#httpClient.processRequest$<Wilaya[]>(API_LOCATION_ENDPOINTS.WILAYAS);
	}

	/**
	 * Fetch municipalities for a specific wilaya
	 * @param wilayaCode The unique code of the wilaya
	 */
	getMunicipalities(wilayaCode: number): Observable<Result<Municipality[]>> {
		return this.#httpClient.processRequest$<Municipality[]>(API_LOCATION_ENDPOINTS.MUNICIPALITIES, {
			pathParams: { wilayaCode }
		});
	}

	/**
	 * Get administrative location information based on geographic coordinates
	 * @param coordinates The latitude and longitude coordinates
	 */
	getMunicipalityByCoordinates(coordinates: LocationCoordinates): Observable<Result<Municipality>> {
		return this.#httpClient.processRequest$<Municipality>(API_LOCATION_ENDPOINTS.MUNICIPALITY_BY_LOCATION, {
			queryParams: { lat: coordinates.latitude, long: coordinates.longitude }
		});
	}
}
