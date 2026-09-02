import { ApiEndpoint } from './api-config';

export const API_BIZ_PROFILE_ENDPOINTS = {
	UPDATE: { path: 'Biz/Account/UpdateProfile', httpVerb: 'PATCH' }
} satisfies Record<string, ApiEndpoint>;
