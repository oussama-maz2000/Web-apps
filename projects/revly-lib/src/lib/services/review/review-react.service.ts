import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_REVIEW_REACT_ENDPOINTS } from '../../core/api/api-review-react-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { ReviewReactPostReqDto } from '../../models/requests/review-react.model';

/**
 * Service for making review react-related API calls
 */
@Injectable({
	providedIn: 'root'
})
export class ReviewReactService {
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Post a react to a review
	 * @param react The react data
	 */
	postReact(react: ReviewReactPostReqDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_REVIEW_REACT_ENDPOINTS.REACT, { body: react });
	}
}
