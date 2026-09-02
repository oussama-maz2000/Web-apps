import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_PHONE_ENDPOINTS } from '../../../core/api/api-auth-endpoints';
import { HttpClientApi } from '../../../core/internal/http-client/http-client-api.service';
import { Result } from '../../../models/common/result';
import { PhoneNumChangeDto, PhoneNumDto, ValidateSmsOtpReqDto } from '../../../models/requests/auth-phone.models';

@Injectable({
	providedIn: 'root'
})
export class AuthPhoneService {
	private readonly httpClientApi = inject(HttpClientApi);

	add$(payload: PhoneNumDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_PHONE_ENDPOINTS.ADD, { body: payload });
	}

	confirm$(payload: ValidateSmsOtpReqDto): Observable<Result<PhoneNumDto | number>> {
		return this.httpClientApi.processRequest$(API_AUTH_PHONE_ENDPOINTS.VALIDATE, { body: payload });
	}

	resendVerificaion$(): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_PHONE_ENDPOINTS.RESEND_VERIFICATION);
	}

	change$(payload: PhoneNumChangeDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_PHONE_ENDPOINTS.CHANGE, { body: payload });
	}

	/*
  //disabled in purpose
  deletePhone$(): Observable<Result>
  {
    return this.httpClientApi.processRequest$(API_AUTH_PHONE_ENDPOINTS.DELETE);
  }
  */
}
