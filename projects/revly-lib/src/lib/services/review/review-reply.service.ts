import { inject, Injectable } from '@angular/core';
import { ReviewReplyDto } from '@revlib/models';
import { Observable } from 'rxjs';
import { API_REVIEW_REPLY_ENDPOINTS } from '../../core/api/api-review-reply-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { ReviewReplyDeleteReqDto, ReviewReplyPostReqDto } from '../../models/requests/review-reply.model';

/**
 * Service for making review reply-related API calls
 */
@Injectable({
	providedIn: 'root'
})
export class ReviewReplyService {
	readonly #httpClient = inject(HttpClientApi);

	/**
	 * Post a reply to a review
	 * @param reply The reply data
	 */
	postReply(reply: ReviewReplyPostReqDto): Observable<Result<ReviewReplyDto>> {
		return this.#httpClient.processRequest$<ReviewReplyDto>(API_REVIEW_REPLY_ENDPOINTS.REPLY, { body: reply });
	}

	/**
	 * Delete a review reply
	 * @param reply The data of the reply to delete
	 */
	deleteReply(reply: ReviewReplyDeleteReqDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_REVIEW_REPLY_ENDPOINTS.DELETE, { body: reply });
	}
}
