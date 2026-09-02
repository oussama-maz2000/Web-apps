import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StorageCoreService } from '../../core/internal/storage/storage-core.service';
import { STORAGE_KEYS } from '../../core/internal/storage/storage-keys';
import { Result } from '../../models/common/result';
import { DeleteAccountReqDto, GoogleAuthReqDto } from '../../models/requests/auth.models';
import { isSignupLoginDto } from '../../models/responses/auth-type-guards';
import {
	AccountRecoveryResDto,
	AuthExtResDto,
	SignupLoginResDto,
	TokenDto
} from '../../models/responses/auth.models';
import { UserDto } from '../../models/responses/userDto.model';
import { AuthBaseService } from '../../services/auth/auth-base.service';
import { LoginService } from '../../services/auth/login.service';
import { AuthRecoveryService } from '../../services/auth/recovery/auth-recovery.service';
import { AuthTokenService } from '../../services/token/auth-token.service';
import { IdentityStateService } from '../../state/identity-state.service';
import { isResultOfType } from '../../utils/result-utils';

@Injectable({
	providedIn: 'root'
})
export class AuthBaseFacade {
	//#region DI
	protected readonly authTokenService = inject(AuthTokenService);
	protected readonly identityStateService = inject(IdentityStateService);
	protected readonly authBaseService = inject(AuthBaseService);
	protected readonly authRecoveryService = inject(AuthRecoveryService);
	protected readonly loginService = inject(LoginService);
	readonly #storageCoreService = inject(StorageCoreService);
	//#endregion

	//#region Google Auth
	/**
	 * Auth with Google
	 */
	googleAuth$(data: GoogleAuthReqDto): Observable<Result<AuthExtResDto | AccountRecoveryResDto> | null> {
		return this.authBaseService
			.googleLogin$(data)
			.pipe(switchMap((result) => this.handleGoogleAuthResponse$(result)));
	}

	protected handleGoogleAuthResponse$(
		result: Result<AuthExtResDto>
	): Observable<Result<AuthExtResDto | AccountRecoveryResDto> | null> {
		// Handle standard login flow
		if (result.isSucceeded && result.value) {
			const authExtResult = result.value as AuthExtResDto;

			// If not a new user, handle as regular login
			if (!authExtResult.isNewUser && authExtResult.tokens && authExtResult.user) {
				// Update auth state with new tokens and user
				return this.updateAuthState$(authExtResult.tokens, authExtResult.user).pipe(map(() => result));
			}
			return of(result);
		}
		return of(null);
	}

	// Google token session management
	sessionStoreGoogleData(token: string, name: string | null): void {
		this.authTokenService.sessionStoreGoogleToken(token);
		this.#storageCoreService.setSessionItem(STORAGE_KEYS.GOOGLE_USER_NAME, name);
	}

	sessionGetGoogleToken(): string | null {
		return this.authTokenService.sessionGetGoogleToken();
	}

	sessionGetGoogleUserName(): string | null {
		return this.authTokenService.sessionGetGoogleUserName();
	}

	sessionRemoveGoogleData(): void {
		return this.authTokenService.sessionRemoveGoogleToken();
	}
	//#endregion

	/**
	 * Get the current access token
	 * Used by the auth interceptor to add authentication headers
	 */
	getAccessToken(): Promise<string | null> {
		return this.authTokenService.getAccessToken();
	}

	/**
	 * Log out user
	 */
	logout$(): Observable<Result> {
		// First make the logout HTTP request before clearing the profile and tokens
		return this.authBaseService.logout$().pipe(
			map((result) => {
				// Then clean up after the request completes (regardless of success/failure)
				this.logoutFromFrontend();
				return result;
			})
		);
	}

	logoutFromFrontend(): void {
		this.identityStateService.updateLogoutState();
	}

	/**
	 * Update authentication state with new tokens and user profile
	 * Used after token refresh to update the app state
	 * @returns Observable that completes when all updates are done, or null if no language update is needed
	 */
	updateAuthState$(tokens: TokenDto, user: UserDto): Observable<void> {
		// Convert Promise to Observable and wait for it to complete
		return this.authTokenService.storeTokens$(tokens.accessToken, tokens.refreshToken).pipe(
			tap(() => {
				// Update auth state & implictly sync/persist storage
				this.identityStateService.updateAuthenticatedState(user);
			})
		);
	}

	/*
	*
	 * Set user's preferred language
	 * @returns Observable that completes when language is updated in UI, or null if no change needed
	 /
	updateLanguagePreference(language: LanguageEnum): Observable<boolean> | null {
		// Only switch UI language if different from current
		const needsUiUpdate = this.identityStateService.language() !== language;

		// Update state
		this.identityStateService.updateLanguage(language);

		// Update in storage
		this.authBaseService.updateLanguage(language);

		// Return observable for UI update if needed, otherwise null
		//needsUiUpdate ? this.translationManager.switchLanguage$(language) :, redirecto to language path when i18n implemented
		return null;
	}*/

	/**
	 * Refresh authentication token
	 */
	refreshToken$(): Observable<Result<TokenDto>> {
		return this.authBaseService.refreshToken$();
	}

	deleteAccount$(passwordOrIdToken: string): Observable<Result> {
		const payload: DeleteAccountReqDto = { passwordOrIdToken: passwordOrIdToken };
		return this.authBaseService.deleteAccount$(payload);
	}

	/**
	 * Recover deleted account
	 */
	recoverDeletedAccount$(recoveryUrl: string): Observable<Result<SignupLoginResDto> | null> {
		return this.authRecoveryService.recoverDeletedAccount$(recoveryUrl).pipe(
			switchMap((result) => {
				if (isResultOfType(result, isSignupLoginDto)) {
					const signupLoginResult = result as Result<SignupLoginResDto>;
					const tokens = signupLoginResult.value?.tokens;
					const user = signupLoginResult.value?.user;

					if (tokens && user) {
						// Clear stored recovery data
						this.loginService.clearAccountRecoveryData();

						// Store tokens and update auth state, then return result
						return this.updateAuthState$(tokens, user).pipe(map(() => signupLoginResult));
					}

					return of(signupLoginResult);
				}
				return of(null);
			})
		);
	}

	/**
	 * Temporarily stores account recovery data
	 */
	tempStoreAccountRecoveryData(recoveryData: AccountRecoveryResDto): void {
		this.authBaseService.tempStoreAccountRecoveryData(recoveryData);
	}
}
