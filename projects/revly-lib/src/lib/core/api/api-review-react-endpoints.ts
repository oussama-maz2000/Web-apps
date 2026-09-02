import { ApiEndpoint } from './api-config';

export const API_REVIEW_REACT_ENDPOINTS = {
	REACT: { path: 'Review/React', httpVerb: 'POST' }
} satisfies Record<string, ApiEndpoint>;
