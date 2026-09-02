import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BIZ_PROFILE_ENDPOINTS } from '../../core/api/api-biz-profile-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { UpdateBizProfileDto } from '../../models/requests/update-biz-profile';

/**
 * Service for making profile-related API calls
 */
@Injectable({
	providedIn: 'root'
})
export class BizProfileService {
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Put a profile update
	 * @param profile The profile data
	 */
	updateProfile(profile: UpdateBizProfileDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_BIZ_PROFILE_ENDPOINTS.UPDATE, { body: profile });
	}
}
