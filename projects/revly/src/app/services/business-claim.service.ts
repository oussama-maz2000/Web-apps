import { inject, Injectable } from '@angular/core';
import { API_BIZ_CLAIM_ENDPOINTS, API_BIZ_ENDPOINTS, HttpClientApi } from '@revlib/core';
import { Result } from '@revlib/models';
import { Observable } from 'rxjs';
import { BusinessClaimRequest, ExistingBizClaimRequest } from '../models/biz-claim-request.model';
import { BusinessClaimResponse } from '../models/biz-claim-response.model';
import { BusinessClaimDto } from '../../../../revly-lib/src/lib/models/types/business-claim-dto';

@Injectable({ providedIn: 'root' })
export class BusinessClaimService {
	readonly #http = inject(HttpClientApi);

	/** Add new business and claim it */
	addNewBusinessClaim(data: BusinessClaimRequest): Observable<Result<BusinessClaimResponse>> {
		return this.#http.processRequest$(API_BIZ_CLAIM_ENDPOINTS.ADD, { body: data });
	}

	/** Claim an existing business */
	addExistingClaim(data: BusinessClaimRequest): Observable<Result<void>> {
		return this.#http.processRequest$(API_BIZ_ENDPOINTS.ADD_CLAIMED, { body: data });
	}

	/** Cancel a claim */
	cancelClaim(bizIdEnc: string): Observable<Result<void>> {
		return this.#http.processRequest$(API_BIZ_CLAIM_ENDPOINTS.CANCEL, { pathParams: { bizIdEnc } });
	}

	/** Get claim status */
	getClaimStatus(): Observable<Result<BusinessClaimDto[]>> {
		return this.#http.processRequest$(API_BIZ_CLAIM_ENDPOINTS.STATUS);
	}

	/** Make a claim existing business request */
	claimExistingBusiness(data: ExistingBizClaimRequest): Observable<Result<void>> {
		return this.#http.processRequest$(API_BIZ_CLAIM_ENDPOINTS.CLAIM, { body: data });
	}
}
