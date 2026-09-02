import { inject, Injectable } from '@angular/core';
import { API_CATEGORY_ENDPOINTS, HttpClientApi } from '@revlib/core';
import { Result } from '@revlib/models';
import { Observable } from 'rxjs';
import { BusinessCategory } from '../models/biz-category.model';

/**
 * Service for fetching business categories and subcategories
 */
@Injectable({
	providedIn: 'root'
})
export class BusinessCategoryService {
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Load all business categories with their sub-categories
	 */
	loadCategories(): Observable<Result<BusinessCategory[]>> {
		return this.#httpClient.processRequest$(API_CATEGORY_ENDPOINTS.CATEGORIES);
	}
}
