import { inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { API_AUTH_ENDPOINTS, API_AUTH_EXT_ENDPOINTS } from '../../core/api/api-auth-endpoints';
import { AUTH_ERROR_TYPES } from '../../core/internal/error/error-codes';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { LanguageCoreService } from '../../core/internal/language/language-core.service';
import { StorageCoreService } from '../../core/internal/storage/storage-core.service';
import { STORAGE_KEYS } from '../../core/internal/storage/storage-keys';
import { Result } from '../../models/common/result';
import { DeleteAccountReqDto, GoogleAuthReqDto, RefreshTokenReqDto } from '../../models/requests/auth.models';
import { AccountRecoveryResDto, AuthExtResDto, TokenDto } from '../../models/responses/auth.models';
import { UserDto } from '../../models/responses/userDto.model';
import { LanguageEnum } from '../../models/types/common.types';
import { AuthTokenService } from '../token/auth-token.service';

@Injectable({
	providedIn: 'root'
})

/**
 * @internal
 * Base class shared logic between login and signup services, used by auth facade
 * service responsible for user account management.
 * This service should not be used directly by components. Use IdentityFacade instead.
 */
export class AuthBaseService {
	//#region DI
	protected readonly httpClientApi = inject(HttpClientApi);
	private readonly authTokenService = inject(AuthTokenService);
	protected readonly storageCoreService = inject(StorageCoreService);
	protected readonly languageCoreService = inject(LanguageCoreService);
	//#endregion

	/**
	 * Authenticates a user using Google credentials
	 */
	googleLogin$(payload: GoogleAuthReqDto): Observable<Result<AuthExtResDto>> {
		return this.httpClientApi.processRequest$<AuthExtResDto>(API_AUTH_EXT_ENDPOINTS.GoogleAuth, {
			body: payload
		});
	}

	/**
	 * Logs out current user
	 */
	logout$(): Observable<Result> {
		// Don't clear tokens here, it's now handled in the facade after request completes
		return this.httpClientApi.processRequest$(API_AUTH_ENDPOINTS.LOGOUT, {
			queryParams: { useCookies: true }
		});
	}

	/**
	 * Refreshes the authentication token
	 */
	refreshToken$(): Observable<Result<TokenDto>> {
		return from(this.authTokenService.getTokens()).pipe(
			switchMap(([accessToken, refreshToken]) => {
				if (accessToken == null || refreshToken == null) {
					return of({
						isSucceeded: false,
						errors: [
							{
								errorCode: {
									code: AUTH_ERROR_TYPES.INVALID_EXPIRED_TOKEN
								}
							}
						]
					} as Result<TokenDto>);
				}

				const refreshTokenReqDto: RefreshTokenReqDto = {
					accessToken: accessToken,
					refreshToken: refreshToken
				};
				// Make the API call with the tokens
				return this.httpClientApi.processRequest$<TokenDto>(API_AUTH_ENDPOINTS.REFRESH_TOKEN, {
					body: refreshTokenReqDto,
					queryParams: { useCookies: true }
				});
			})
		);
	}

	/**
	 * Permanently deletes user account
	 */
	deleteAccount$(payload: DeleteAccountReqDto): Observable<Result> {
		return this.httpClientApi.processRequest$(API_AUTH_ENDPOINTS.DELETE, { body: payload });
	}

	/**
	 * Temporarily stores account recovery data
	 */
	tempStoreAccountRecoveryData(recoveryData: AccountRecoveryResDto): void {
		this.storageCoreService.setSessionItem(STORAGE_KEYS.RECOVERY_DATA, recoveryData);
	}

	/**
	 * Clears user profile from storage
	 */
	clearProfileAndTokens(): void {
		this.authTokenService.clearTokens();
		this.storageCoreService.removeItem(STORAGE_KEYS.USER_PROFILE);
	}

	/**
	 * Stores user profile in local storage
	 * Internal method - should only be called by IdentityStateService
	 */
	storeProfile(user: UserDto | null): void {
		if (user && user.idEnc !== '') {
			this.storageCoreService.setItem(STORAGE_KEYS.USER_PROFILE, user);
			this.storageCoreService.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, user.preferredLanguage.toString());
		} else {
			this.storageCoreService.removeItem(STORAGE_KEYS.USER_PROFILE);
		}
	}

	/**
	 * Retrieves user profile
	 * @returns UserDto | null
	 */
	getProfile(): UserDto | null {
		return this.storageCoreService.getItem<UserDto>(STORAGE_KEYS.USER_PROFILE);
	}

	/**
	 * Updates user's preferred language
	 */
	updateLanguage(language: LanguageEnum): void {
		this.languageCoreService.storePreferredLanguage(language);
	}

	isAuthenticated(): boolean {
		return this.authTokenService.isAuthenticated();
	}
}
