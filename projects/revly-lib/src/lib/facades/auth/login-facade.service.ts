import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { COMMON_ERRORS } from '../../core/internal/error/error-codes';
import { Result } from '../../models/common/result';
import { isAccountRecoveryDto, isSignupLoginDto } from '../../models/responses/auth-type-guards';
import { AccountRecoveryResDto, SignupLoginResDto } from '../../models/responses/auth.models';
import { createErrorResult, isResultOfType } from '../../utils/result-utils';
import { AuthBaseFacade } from './auth-base-facade.service';

/**
 * Facade service for login operations
 *
 * This service handles all login-related operations including:
 * - Traditional email/password login
 * - Social login
 * - Account recovery
 */
@Injectable({
	providedIn: 'root'
})
export class LoginFacade extends AuthBaseFacade {
	//#region Public Facade methods
	/**
	 * Login with email and password
	 */
	login$(email: string, password: string): Observable<Result<SignupLoginResDto | AccountRecoveryResDto> | null> {
		return this.loginService
			.login$({ email, password })
			.pipe(switchMap((result) => this.handleLoginResponse$(result)));
	}
	//#endregion

	//#region Main Responses Handlers
	private handleLoginResponse$(
		result: Result<SignupLoginResDto | AccountRecoveryResDto>
	): Observable<Result<SignupLoginResDto> | Result<AccountRecoveryResDto> | null> {
		// Handle successful login with tokens
		if (isResultOfType(result, isSignupLoginDto))
			return this.handleSuccessfulLogin$(result as Result<SignupLoginResDto>);
		// Handle account recovery case
		else if (isResultOfType(result, isAccountRecoveryDto))
			return this.handleRecoveryLogin$(result as Result<AccountRecoveryResDto>);

		return of(null);
	}

	private handleSuccessfulLogin$(result: Result<SignupLoginResDto>): Observable<Result<SignupLoginResDto>> {
		const tokens = result.value?.tokens;
		const user = result.value?.user;

		if (!tokens || !user) {
			// Return a properly formatted Result error object instead of throwing
			return throwError(() =>
				createErrorResult(
					'Une erreur est survenue. Veuillez réessayer plus tard.',
					COMMON_ERRORS.UNKNOWN_ERROR
				)
			);
		}

		// Update auth state, then return original result
		return this.updateAuthState$(tokens, user).pipe(map(() => result));
	}

	private handleRecoveryLogin$(
		result: Result<AccountRecoveryResDto>
	): Observable<Result<AccountRecoveryResDto>> {
		const recoveryData = result.value as AccountRecoveryResDto;

		// Store as fallback for page refresh
		if (recoveryData?.recoveryUrl && recoveryData?.expiresAt) {
			this.tempStoreAccountRecoveryData(recoveryData);
		}

		// Return the recovery data directly
		return of(result);
	}
	//#endregion
}
