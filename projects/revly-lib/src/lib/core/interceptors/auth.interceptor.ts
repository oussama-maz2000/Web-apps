import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HttpStatusCode
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
	catchError,
	finalize,
	from,
	Observable,
	retry,
	RetryConfig,
	shareReplay,
	switchMap,
	throwError,
	timer
} from 'rxjs';

import { getFirstErrorCode } from '@revlib/utils';
import { API_AUTH_ENDPOINTS } from '../../../public-api';
import { AuthBaseFacade } from '../../facades/auth/auth-base-facade.service';
import { Result } from '../../models/common/result';
import { TokenDto } from '../../models/responses/auth.models';
import { AuthTokenService } from '../../services/token/auth-token.service';
import { parseRetryAfterSeconds } from '../../utils/retry-utils';
import { DEFAULT_API_CONFIG } from '../api/api-config';
import { ConnectivityService } from '../connectivity/connectivity.service';
import { AUTH_ERROR_TYPES, COMMON_ERRORS, ERROR_TYPES } from '../internal/error/error-codes';
import { ErrorHandlerCoreService } from '../internal/error/error-handler-core.service';
import { isSkipInterceptors } from './interceptors.skipping.utils';

const BEARER_PREFIX = 'Bearer ';

const MAX_RETRIES = 3;
const REQUEST_CATEGORIES = {
	IDEMPOTENT: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'],
	NON_IDEMPOTENT: ['POST', 'PATCH']
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	readonly #errorHandlerCore = inject(ErrorHandlerCoreService);
	readonly #identityBaseFacade = inject(AuthBaseFacade);
	readonly #authTokenService = inject(AuthTokenService);
	readonly #connectivityService = inject(ConnectivityService);

	#refreshTokenCache$: Observable<Result<TokenDto>> | null = null;

	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		// Skip interceptor logic (for now translation requests static assets)
		if (isSkipInterceptors(req)) return next.handle(req);

		// Drop API requests immediately if offline
		if (!this.#connectivityService.isOnline()) {
			return this.#errorHandlerCore.handleOfflineRequest();
		}

		// Early return for non-API requests
		if (!req.url.startsWith(DEFAULT_API_CONFIG.baseSubDomainApiUrl)) return this.nextWithRetry$(req, next);

		return from(this.#identityBaseFacade.getAccessToken()).pipe(
			switchMap((accessToken) => {
				if (!accessToken) {
					//LOGOUT request while accesstoken == null inconsistent state, logout from frontend skip api call
					if (req.url.includes(API_AUTH_ENDPOINTS.LOGOUT.path)) {
						this.#identityBaseFacade.logoutFromFrontend();
						return throwError(
							() =>
								new Error(
									'Inconsistent state token is null, user is unauthenticated. Logged out from frontend.'
								)
						);
					}

					return this.nextWithRetry$(req, next);
				}

				// Add authorization header
				const authReq = this.createAuthRequest(req, accessToken);

				return next.handle(authReq).pipe(
					catchError((error) => {
						const normalizedResult = this.#errorHandlerCore.normalizeError(error);

						// Only handle 401 Unauthorized errors, with COM_02_001
						//COM_02_001= jwt token expired or invalid
						if (
							error.status === HttpStatusCode.Unauthorized &&
							this.#errorHandlerCore.isResultInvalidAuth(normalizedResult.result)
						) {
							// CRITICAL: Never attempt token refresh for logout requests
							// Logout with expired token is valid, just cleanup frontend
							if (req.url.includes(API_AUTH_ENDPOINTS.LOGOUT.path)) {
								this.#identityBaseFacade.logoutFromFrontend();
								return throwError(() => error);
							}

							// Try refreshing tokens using the facade
							return this.tryRefreshTokenObs$(req, next, error);
						}

						return this.#errorHandlerCore.handleHttpError$(error);
						//return throwError(() => error);
					})
				);
			})
		);
	}

	// Helper function to create authenticated request
	private createAuthRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
		return req.clone({
			setHeaders: {
				Authorization: `${BEARER_PREFIX}${token}`
			}
		});
	}

	/**
	 * Helper function to apply smart retry logic
	 */
	private nextWithRetry$(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(req).pipe(
			retry(this.createRetryConfig(req)),
			catchError((error) => {
				// Normalize the error for consistent format
				//Know imperfection: handleHttpError$() does call normalizeError() as well, if we pass handleHttpError$(error)
				//and comment out the line below (normalized) the component will recieve and http reponse instead of sanitized Result and will break
				//solution i believe is in spliting the def of methods in errorHandlerCore
				const normalized = this.#errorHandlerCore.normalizeError(error);
				return this.#errorHandlerCore.handleHttpError$(normalized.result); // Return normalized error for component-level handling
			})
		);
	}

	/**
	 * Determines if a request should be retried based on error and request type
	 */
	private shouldRetry(req: HttpRequest<unknown>, error: HttpErrorResponse): boolean {
		// Don't retry non-idempotent methods unless explicitly marked as retryable
		if (REQUEST_CATEGORIES.NON_IDEMPOTENT.includes(req.method)) return false;

		// Don't retry if the server explicitly says not to with a Retry-After of 0
		const retryAfter = error.headers?.get('Retry-After');
		if (retryAfter === '0') {
			return false;
		}

		// Network errors and server errors can be retried
		return error.status === 0 || (error.status >= HttpStatusCode.InternalServerError && error.status < 600);
	}

	/**
	 * Creates a retry configuration with exponential backoff
	 */
	private createRetryConfig(req: HttpRequest<unknown>): RetryConfig {
		return {
			count: MAX_RETRIES,
			delay: (error: HttpErrorResponse, retryCount: number) => {
				if (!this.shouldRetry(req, error)) {
					return throwError(() => error);
				}

				// Check for Retry-After header (429 Too Many Requests)
				const retryAfter = error.headers?.get('Retry-After');
				if (error.status === HttpStatusCode.TooManyRequests && retryAfter) {
					// Parse the Retry-After value (can be seconds or HTTP date)
					const retryAfterSeconds = parseRetryAfterSeconds(retryAfter);

					// Use the suggested delay time from the server
					return timer(retryAfterSeconds * 1000);
				}

				// Exponential backoff with jitter
				const delay = Math.min(Math.pow(2, retryCount) * 100, 2000);
				const jitter = Math.random() * 100;
				return timer(delay + jitter);
			}
		};
	}

	private tryRefreshTokenObs$(
		previousFailedDueAuthReq: HttpRequest<unknown>,
		next: HttpHandler,
		error: HttpErrorResponse
	): Observable<HttpEvent<unknown>> {
		// Reuse existing refresh if in-flight
		if (!this.#refreshTokenCache$) {
			// First, handle refresh token - isolate this completely
			this.#refreshTokenCache$ = this.#identityBaseFacade.refreshToken$().pipe(
				// If refresh token fails, handle the error
				catchError((refreshError) => {
					const normalizedError = this.#errorHandlerCore.normalizeError(refreshError);
					const firstErrorCode = getFirstErrorCode(normalizedError.result);

					//if unauthrized or invalid & expired logout from frontend
					//we don't need to call the api if token is invalid or expired, backend already perform cleanup
					if (
						firstErrorCode === AUTH_ERROR_TYPES.INVALID_EXPIRED_TOKEN ||
						firstErrorCode === COMMON_ERRORS.UNKNOWN_ERROR ||
						firstErrorCode === ERROR_TYPES.SERVER_DOWN
					) {
						this.#identityBaseFacade.logoutFromFrontend();
						return throwError(() => error);
					}

					//logoutFromFrontend is called implicitly in logout$()
					return this.#identityBaseFacade.logout$().pipe(switchMap(() => throwError(() => error)));
				}),
				// Share the refresh observable across all concurrent subscribers
				shareReplay({ bufferSize: 1, refCount: true }),
				finalize(() => {
					// Clear cache when complete/error
					this.#refreshTokenCache$ = null;
				})
			);
		}

		// Then handle the successful refresh and retry logic
		return this.#refreshTokenCache$.pipe(
			switchMap((result) => {
				const tokens = result.value as TokenDto;
				if (!result.isSucceeded || !tokens || !tokens.accessToken) {
					return throwError(() => error);
				}

				// Wait for update the auth state and store new tokens and user profile before proceeding
				return this.#authTokenService.storeTokens$(tokens.accessToken, tokens.refreshToken).pipe(
					switchMap(() => {
						// Check if this is an auth API request
						if (previousFailedDueAuthReq.url.startsWith(DEFAULT_API_CONFIG.authApiUrl)) {
							// For auth requests, we DON'T want to retry the request
							// The refresh token has updated the tokens in storage already
							// Here we should transform the refresh token result into
							// a response that matches what the original request expected

							// Create a successful response with the token data
							const successResult = {
								isSucceeded: true,
								value: {
									accessToken: tokens.accessToken,
									refreshToken: tokens.refreshToken
								},
								errors: []
							} as Result<TokenDto>;

							// The caller will get the updated tokens and user info directly
							return this.#errorHandlerCore.createHttpResponseOfResult$(successResult);
						}

						// Since refresh token succeeded, retry original request with new access token
						const retryReq = this.createAuthRequest(previousFailedDueAuthReq, tokens.accessToken);
						return this.nextWithRetry$(retryReq, next);
					})
				);
			})
		);
	}
}
