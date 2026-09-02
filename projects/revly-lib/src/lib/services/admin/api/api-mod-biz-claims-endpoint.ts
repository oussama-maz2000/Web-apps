import { ApiEndpoint } from '@revlib/core';

export const API_MOD_BIZ_CLAIMS_ENDPOINTS = {
	GET_CLAIMS: { path: 'mod/claims', httpVerb: 'GET' },
	REVIEW_CLAIM: { path: 'mod/claims/review', httpVerb: 'POST' }
} satisfies Record<string, ApiEndpoint>;
