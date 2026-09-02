import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Result } from '../../models/common/result';
import { GoogleAuthCompeleteSignUpReqDto, SignupReqDto } from '../../models/requests/auth.models';
import { isAccountRecoveryDto, isSignupLoginDto } from '../../models/responses/auth-type-guards';
import { AccountRecoveryResDto, SignupLoginResDto } from '../../models/responses/auth.models';
import { SignUpService } from '../../services/auth/signup.service';
import { isResultOfType } from '../../utils/result-utils';
import { AuthBaseFacade } from './auth-base-facade.service';

/**
 * Facade service for signup operations
 *
 * This service handles all signup-related operations including:
 * - Email/password registration
 * - Social signup
 */
@Injectable({
	providedIn: 'root'
})
export class SignUpFacade extends AuthBaseFacade {
	//#region DI
	protected readonly signUpService = inject(SignUpService);
	//#endregion

	/**
	 * Register new user
	 */
	signUp$(signupData: SignupReqDto): Observable<Result<SignupLoginResDto>> {
		return this.signUpService
			.signUp$(signupData)
			.pipe(switchMap((result) => this.handleSuccessfulSignUp$(result)));
	}

	/**
	 * Register with Google
	 */
	googleSignUp$(
		data: GoogleAuthCompeleteSignUpReqDto
	): Observable<Result<SignupLoginResDto> | Result<AccountRecoveryResDto> | null> {
		return this.signUpService
			.googleSignUp$(data)
			.pipe(switchMap((result) => this.handleLoginResponse$(result)));
	}

	//#region Response Handlers
	private handleLoginResponse$(
		result: Result<SignupLoginResDto | AccountRecoveryResDto>
	): Observable<Result<SignupLoginResDto> | Result<AccountRecoveryResDto> | null> {
		// Handle successful login with tokens
		if (isResultOfType(result, isSignupLoginDto)) {
			return this.handleSuccessfulSignUp$(result as Result<SignupLoginResDto>);
		}
		// Handle account recovery case
		else if (isResultOfType(result, isAccountRecoveryDto)) {
			return this.handleRecoveryLogin$(result as Result<AccountRecoveryResDto>);
		}
		return of(null);
	}

	private handleSuccessfulSignUp$(result: Result<SignupLoginResDto>): Observable<Result<SignupLoginResDto>> {
		const tokens = result.value?.tokens || null;
		const user = result.value?.user || null;
		//in case of a signup tokens an user ight be null that's ok, user need to verify email first
		if (!tokens || !user) {
			return of(result);
		}

		// Update auth state, then return original result
		return this.updateAuthState$(tokens, user).pipe(map(() => result));
	}

	private handleRecoveryLogin$(
		result: Result<AccountRecoveryResDto>
	): Observable<Result<AccountRecoveryResDto>> {
		const recoveryData = result.value as AccountRecoveryResDto;

		// Store as fallback for page refresh
		if (recoveryData?.recoveryUrl && recoveryData?.expiresAt)
			this.signUpService.tempStoreAccountRecoveryData(recoveryData);

		return of(result); // Return the recovery data directly
	}
	//#endregion
}
