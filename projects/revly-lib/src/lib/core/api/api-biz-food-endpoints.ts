import { ApiEndpoint } from './api-config';

export const API_BIZ_FOOD_ENDPOINTS = {
	UPDATE: { path: 'Biz/food/Update', httpVerb: 'PATCH' }
} satisfies Record<string, ApiEndpoint>;
