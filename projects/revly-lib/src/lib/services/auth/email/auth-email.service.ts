import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_EMAIL_ENDPOINTS } from '../../../core/api/api-auth-endpoints';
import { ApiPayloadParams } from '../../../core/api/api-config';
import { HttpClientApi } from '../../../core/internal/http-client/http-client-api.service';
import { Result } from '../../../models/common/result';
import {
	ChangeEmailReqDto,
	ConfirmEmailChangeReqDto,
	ConfirmEmailReqDto,
	EmailDto
} from '../../../models/requests/auth-email.models';

@Injectable({
	providedIn: 'root'
})
export class AuthEmailService {
	private readonly httpClientApi = inject(HttpClientApi);

	confirm$(queryParams: ConfirmEmailReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_EMAIL_ENDPOINTS.CONFIRM, {
			queryParams: queryParams as unknown as Record<string, string | number | boolean>
		} as ApiPayloadParams);
	}

	resendConfirmation$(payload: EmailDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_EMAIL_ENDPOINTS.RESEND_CONFIRMATION, { body: payload });
	}

	changeEmail$(payload: ChangeEmailReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_EMAIL_ENDPOINTS.CHANGE, { body: payload });
	}

	confirmChangeEmail$(queryParams: ConfirmEmailChangeReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_EMAIL_ENDPOINTS.CONFIRM_CHANGE, {
			queryParams: queryParams as unknown as Record<string, string | number | boolean>
		} as ApiPayloadParams);
	}
}
