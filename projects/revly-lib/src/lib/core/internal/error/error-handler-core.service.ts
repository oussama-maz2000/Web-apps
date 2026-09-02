import { HttpErrorResponse, HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { Result } from '../../../models/common/result';
import { parseRetryAfterToOptimalTimeUnit, RetryAfterType } from '../../../utils/retry-utils';
import { AUTH_ERROR_TYPES, ERROR_TYPES } from './error-codes';

export interface NormalizedError {
	result: Result;
	metadata?: ErrorMetadata;
}

export interface ErrorMetadata {
	retryAfter?: number;
}

@Injectable({
	providedIn: 'root'
})
export class ErrorHandlerCoreService {
	/**
	 * Normalizes HTTP errors into consistent Result objects
	 */
	handleHttpError$(error: HttpErrorResponse | Result): Observable<never> {
		const { result, metadata } = this.normalizeError(error);

		// Attach metadata to the error for interceptors or other services
		Object.defineProperty(result, 'metadata', {
			value: metadata,
			enumerable: false
		});

		return throwError(() => result);
	}

	/**
	 * Creates a successful HTTP response from a Result object
	 * Used to transform results when bypassing HTTP requests
	 */
	createHttpResponseOfResult$<T>(result: Result<T>): Observable<HttpEvent<T>> {
		// Create a synthetic HttpResponse with the result value
		return of(
			new HttpResponse<T>({
				body: result as unknown as T,
				status: 200,
				statusText: 'OK'
			})
		);
	}

	/**
	 * Converts any error into a Result type for consistent handling
	 * Handles both Result objects and HttpErrorResponse objects
	 */
	normalizeError(error: HttpErrorResponse | Result): NormalizedError {
		const metadata: ErrorMetadata = {};

		// Case 0: Error is already a Result object (direct call with Result)
		if (this.isBackendResult(error)) {
			return { result: error, metadata };
		}

		// Case 1: Backend already returned a Result object inside HttpErrorResponse
		if (error.error && this.isBackendResult(error.error)) {
			return { result: error.error as Result, metadata };
		}

		// Handle various error scenarios based on status code
		switch (true) {
			// Case 1: Unauthorized (401), handled in Result, occurs on graphql authenticated queries
			case error.status === HttpStatusCode.Unauthorized:
				return this.handleAuthError();

			// Case 2: Rate limiting (429), handled in Result
			case error.status === HttpStatusCode.TooManyRequests:
				return this.handleRateLimitingError(error);

			// Case 3: Network/connection error (no server response)
			case error.status === 0 || error.error instanceof Error:
				return this.handleNetworkError(error);

			// Case 4: Server error
			case error.status >= HttpStatusCode.InternalServerError && error.status < 600:
				return this.handleServerError();

			default:
				return this.handleGenericHttpError(error);
		}
	}

	/**
	 * Check if error requires logout
	 */
	isResultInvalidAuth(result: Result): boolean {
		return (
			result &&
			(result.errors?.some(
				(error) =>
					error.errorCode.code === AUTH_ERROR_TYPES.UNAUTHORIZED ||
					error.errorCode.code === AUTH_ERROR_TYPES.INVALID_EXPIRED_TOKEN
			) ??
				false)
		);
	}

	handleOfflineRequest(): Observable<HttpEvent<unknown>> {
		return this.createHttpResponseOfResult$({
			isSucceeded: false,
			errors: [
				{
					errorCode: { code: ERROR_TYPES.OFFLINE },
					message: 'La connexion au serveur est perdue'
				}
			]
		});
	}

	//#region Errors handlers
	/**
	 * Handles rate limiting (429) errors
	 */
	private handleRateLimitingError(error: HttpErrorResponse): NormalizedError {
		const metadata: ErrorMetadata = {};
		const retryAfter = this.extractRetryAfterValue(error);

		if (retryAfter) metadata.retryAfter = retryAfter.value;

		return {
			result: {
				isSucceeded: false,
				errors: [
					{
						errorCode: {
							code: ERROR_TYPES.RATE_LIMITED
						},
						message: this.formatTooManyRequestsErrorMessage(retryAfter)
					}
				]
			} as Result,
			metadata
		};
	}

	/**
	 * Handles unauthorized (401) errors (work around map to backend error)
	 */
	//todo to be revised and refactored in future, whole error handling pipeline
	private handleAuthError(): NormalizedError {
		const metadata: ErrorMetadata = {};

		return {
			result: {
				isSucceeded: false,
				errors: [
					{
						errorCode: {
							code: AUTH_ERROR_TYPES.UNAUTHORIZED
						}
						//message:
					}
				]
			} as Result,
			metadata
		};
	}

	/**
	 * Extracts and parses the Retry-After header value
	 * Returns seconds to wait or undefined if not present
	 */
	private extractRetryAfterValue(error: HttpErrorResponse): RetryAfterType | undefined {
		const retryAfter = error.headers.get('Retry-After') ?? error.error.retryAfter;
		if (!retryAfter) return undefined;

		return parseRetryAfterToOptimalTimeUnit(retryAfter);
	}

	/**
	 * Handles network-level errors (status 0 or Error objects)
	 */
	private handleNetworkError(error: HttpErrorResponse): NormalizedError {
		const errorType = error.error instanceof TimeoutError ? ERROR_TYPES.TIMEOUT : ERROR_TYPES.NETWORK;

		return {
			result: {
				isSucceeded: false,
				errors: [
					{
						errorCode: {
							code: errorType
						},
						message:
							errorType === ERROR_TYPES.TIMEOUT
								? 'The request timed out. Please try again.'
								: 'Unable to connect to server. Please check your connection and try again.'
					}
				]
			} as Result,
			metadata: {}
		};
	}
	//#endregion

	/**
	 * Handles server errors (5xx status codes)
	 */
	private handleServerError(): NormalizedError {
		return {
			result: {
				isSucceeded: false,
				errors: [
					{
						errorCode: {
							code: ERROR_TYPES.SERVER_DOWN
						},
						message:
							'The server is currently unavailable. Our team has been notified and is working on it.'
					}
				]
			} as Result,
			metadata: {}
		};
	}

	/**
	 * Handles generic HTTP errors not covered by specialized handlers
	 */
	private handleGenericHttpError(error: HttpErrorResponse): NormalizedError {
		return {
			result: {
				isSucceeded: false,
				errors: [
					{
						errorCode: {
							code: `HTTP_${error.status}`
						},
						message: 'Something went wrong, Unexpected error'
					}
				]
			} as Result,
			metadata: {}
		};
	}

	/**
	 * Type guard to check if an object matches our Result interface
	 */
	private isBackendResult(obj: unknown): obj is Result {
		return (
			obj !== null &&
			obj !== undefined &&
			typeof obj === 'object' &&
			'isSucceeded' in obj &&
			typeof obj.isSucceeded === 'boolean' &&
			'errors' in obj &&
			Array.isArray(obj.errors)
		);
	}

	//translate future
	private formatTooManyRequestsErrorMessage(retryAfter: RetryAfterType | undefined): string {
		//const unitMessageTranslated = retryAfter?.unit ? retryAfter.unit : '';

		return !retryAfter || retryAfter?.value === 0
			? 'Trop de requêtes. Veuillez réessayer plus tard.'
			: 'Trop de requêtes. Veuillez réessayer dans {{ retryAfter.value }} {{ unitMessageTranslated }}.';
	}

	//if many erros, it means it's validation errors does not make sense to get the first one without the others whatever the use case
	getSingleErrorMessageOrNull(error: NormalizedError): string | null {
		const errors = error.result?.errors;
		if (!errors || errors.length !== 1) {
			return null;
		}
		return errors[0]?.message ?? null;
	}
}
