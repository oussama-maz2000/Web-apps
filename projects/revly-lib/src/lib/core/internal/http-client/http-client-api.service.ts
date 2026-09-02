import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Result } from '../../../models/common/result';
import { buildQueryParams } from '../../../utils/query.utils';
import { ApiConfig, ApiEndpoint, ApiPayloadParams, DEFAULT_API_CONFIG } from '../../api/api-config';

@Injectable({
	providedIn: 'root'
})
export class HttpClientApi {
	private readonly http = inject(HttpClient);

	private config: ApiConfig = DEFAULT_API_CONFIG;

	configure(config: Partial<ApiConfig>): void {
		this.config = { ...this.config, ...config };
	}

	buildUrl(endpoint: ApiEndpoint): string {
		const version = endpoint.versionOverride || this.config.defaultVersion;
		return `${this.config.baseApiUrl}/v${version}/${endpoint.path}`;
	}

	processRequest$<T>(endpoint: ApiEndpoint, options?: ApiPayloadParams): Observable<Result<T>> {
		let url = this.buildUrl(endpoint);
		const { pathParams, queryParams, body } = options || {};

		// Process path parameters
		if (pathParams) {
			Object.entries(pathParams).forEach(([key, value]) => {
				url = url.replace(`:${key}`, encodeURIComponent(String(value)));
			});
		}

		let request$: Observable<Result<T>>;

		switch (endpoint.httpVerb) {
			case 'GET':
				request$ = this.get$<T>(url, queryParams);
				break;

			case 'POST':
				request$ = this.post$<T>(url, body, queryParams);
				break;

			case 'PATCH':
				request$ = this.patch$<T>(url, body);
				break;

			case 'PUT':
				request$ = this.put$<T>(url, body);
				break;

			case 'DELETE':
				request$ = this.delete$<T>(url, body);
				break;

			default:
				request$ = this.post$<T>(url, body, queryParams);
				break;
		}

		// Error handling now happens in the interceptor, not here
		return request$;
	}

	get$<T>(url: string, queryParams?: Record<string, string | number | boolean>): Observable<Result<T>> {
		const params = buildQueryParams(queryParams);
		return this.http.get<Result<T>>(url, params ? { params } : undefined);
	}

	post$<T>(
		url: string,
		body: unknown,
		queryParams?: Record<string, string | number | boolean>
	): Observable<Result<T>> {
		const params = buildQueryParams(queryParams);
		//withCredentials: instructs the browser to include credentials (used for cookies here)
		const options: { params?: HttpParams; withCredentials: boolean } = {
			withCredentials: true
		};
		if (params) options.params = params;

		return this.http.post<Result<T>>(url, body, options);
	}

	patch$<T>(url: string, body: unknown): Observable<Result<T>> {
		return this.http.patch<Result<T>>(url, body, { withCredentials: true });
	}

	put$<T>(url: string, body: unknown): Observable<Result<T>> {
		return this.http.put<Result<T>>(url, body, { withCredentials: true });
	}

	delete$<T>(url: string, body?: unknown): Observable<Result<T>> {
		const options = {
			body: body,
			withCredentials: true
		};

		return this.http.delete<Result<T>>(url, options);
	}
}
