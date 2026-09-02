import { ApiEndpoint } from './api-config';

export const API_REVIEW_ENDPOINTS = {
	POST_REVIEW: { path: 'Review/Post', httpVerb: 'POST' },
	DELETE_REVIEW: { path: 'Review/Delete', httpVerb: 'DELETE' }
} satisfies Record<string, ApiEndpoint>;
