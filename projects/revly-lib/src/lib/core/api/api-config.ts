//flexible api version, http verb per endpoint, if not supplied fallback default
export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
	path: string;
	httpVerb?: HttpVerb; //default fallback consider is POST (HttpClientApiService)
	versionOverride?: string | number;
}

export interface ApiConfig {
	baseApiUrl: string;
	defaultVersion: number | string;
	defaultHttpVerb: HttpVerb;
}

export const DEFAULT_API_CONFIG = {
	/*
	//Please DO NOT REMOVE THIS: useful for local SSR dev test
	baseApiUrl: '/api',
	authApiUrl: '/api/auth',
	 */
	baseSubDomainApiUrl: 'https://api.userevly.com/',
	graphqlApiUrl: 'https://api.userevly.com/graphql/',
	baseApiUrl: 'https://api.userevly.com/api',
	authApiUrl: 'https://api.userevly.com/api/auth',

	defaultVersion: 1,
	defaultHttpVerb: 'POST' as HttpVerb
};

export const TOKENS_NAME = {
	accessToken: 'acc_auth_token',
	refreshToken: 're_auth_token'
};

export interface ApiPayloadParams {
	body?: unknown;
	queryParams?: Record<string, string | number | boolean>;
	pathParams?: Record<string, string | number>;
}

export const GOOGLE_CONFIG = {
	clientId: '756713183317-1f8s54olcgdccba25imp10guvt4kf2a7.apps.googleusercontent.com'
};
