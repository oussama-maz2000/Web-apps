import { inject, Injectable } from '@angular/core';
import { API_BIZ_FOOD_ENDPOINTS } from '@revlib/core';
import { BizFoodUpdateReqDto } from '@revlib/models';
import { Observable } from 'rxjs';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';

/**
 * Service for making BizFood-related API calls
 */
@Injectable({
	providedIn: 'root'
})
export class BizFoodService {
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Put a business food update
	 * @param bizFood The business food data
	 */
	updateBizFood(bizFood: BizFoodUpdateReqDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_BIZ_FOOD_ENDPOINTS.UPDATE, { body: bizFood });
	}
}
