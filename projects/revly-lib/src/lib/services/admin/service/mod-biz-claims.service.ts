import { inject, Injectable } from '@angular/core';
import { HttpClientApi } from '@revlib/core';
import { Result } from '@revlib/models';
import { Observable } from 'rxjs';
import { API_MOD_BIZ_CLAIMS_ENDPOINTS } from '../api/api-mod-biz-claims-endpoint';
import { BizModClaimReviewReqDto } from '../model/claims-review';
import { BusinessClaimDto } from '../../../models/types/business-claim-dto';

@Injectable({
	providedIn: 'root'
})
export class ModBizClaimsService {
	protected readonly httpClientApi = inject(HttpClientApi);

	getPendingBizClaims$(): Observable<Result<BusinessClaimDto[]>> {
		return this.httpClientApi.processRequest$<BusinessClaimDto[]>(API_MOD_BIZ_CLAIMS_ENDPOINTS.GET_CLAIMS);
	}

	reviewBizClaim(claimsReq: BizModClaimReviewReqDto): Observable<Result<void>> {
		return this.httpClientApi.processRequest$<void>(API_MOD_BIZ_CLAIMS_ENDPOINTS.REVIEW_CLAIM, {
			body: claimsReq
		});
	}
}
