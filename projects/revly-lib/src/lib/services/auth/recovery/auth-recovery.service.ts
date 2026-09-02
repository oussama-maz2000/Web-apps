import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_RECOVERY_ENDPOINTS } from '../../../core/api/api-auth-endpoints';
import { HttpClientApi } from '../../../core/internal/http-client/http-client-api.service';
import { Result } from '../../../models/common/result';
import { EmailDto } from '../../../models/requests/auth-email.models';
import { ChangePasswordReqDto, PasswordResetReqDto } from '../../../models/requests/auth-recovery.models';

@Injectable({
	providedIn: 'root'
})
export class AuthRecoveryService {
	private readonly httpClientApi = inject(HttpClientApi);

	forgotPassword$(payload: EmailDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_RECOVERY_ENDPOINTS.FORGOT_PASSWORD, { body: payload });
	}

	resetPassword$(payload: PasswordResetReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_RECOVERY_ENDPOINTS.RESET_PASSWORD, { body: payload });
	}

	changePassword$(payload: ChangePasswordReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_RECOVERY_ENDPOINTS.CHANGE_PASSWORD, { body: payload });
	}

	recoverDeletedAccount$(recoveryUrl: string): Observable<Result> {
		return this.httpClientApi.get$(recoveryUrl);
	}
}
