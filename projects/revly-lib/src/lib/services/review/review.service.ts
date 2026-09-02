import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_REVIEW_ENDPOINTS } from '../../core/api/api-review-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { ReviewDelete, ReviewPostReqDto } from '../../models/requests/review.model';
import { ReviewDto } from '../../models/responses/review.model';

/**
 * Service for making review-related API calls
 * Pure data fetching service with no state management
 */
@Injectable({
	providedIn: 'root'
})
export class ReviewService {
	// DI
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Post a new review
	 * @param review The review data to post
	 */
	postReview(review: ReviewPostReqDto): Observable<Result<ReviewDto>> {
		return this.#httpClient.processRequest$<ReviewDto>(API_REVIEW_ENDPOINTS.POST_REVIEW, { body: review });
	}

	/**
	 * Delete a review
	 * @param reviewId The ID of the review to delete
	 */

	deleteReview(deleteReview: ReviewDelete): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_REVIEW_ENDPOINTS.DELETE_REVIEW, { body: deleteReview });
	}
}
