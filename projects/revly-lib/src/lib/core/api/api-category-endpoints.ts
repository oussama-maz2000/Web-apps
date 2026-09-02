import { ApiEndpoint } from './api-config';

export const API_CATEGORY_ENDPOINTS = {
	CATEGORIES: { path: 'Biz/Cat', httpVerb: 'GET' }
} satisfies Record<string, ApiEndpoint>;
