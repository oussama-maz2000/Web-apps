import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_ENDPOINTS, API_AUTH_EXT_ENDPOINTS } from '../../core/api/api-auth-endpoints';
import { Result } from '../../models/common/result';
import { GoogleAuthCompeleteSignUpReqDto, SignupReqDto } from '../../models/requests/auth.models';
import { SignupLoginResDto } from '../../models/responses/auth.models';
import { AuthBaseService } from './auth-base.service';

@Injectable({
	providedIn: 'root'
})
export class SignUpService extends AuthBaseService {
	/**
	 * Registers a new user
	 */
	signUp$(payload: SignupReqDto): Observable<Result<SignupLoginResDto>> {
		return this.httpClientApi.processRequest$<SignupLoginResDto>(API_AUTH_ENDPOINTS.SIGNUP, { body: payload });
	}

	/**
	 * Register a new user using Google credentials
	 */
	googleSignUp$(payload: GoogleAuthCompeleteSignUpReqDto): Observable<Result<SignupLoginResDto>> {
		return this.httpClientApi.processRequest$<SignupLoginResDto>(API_AUTH_EXT_ENDPOINTS.GoogleCompleteSignUp, {
			body: payload
		});
	}
}
