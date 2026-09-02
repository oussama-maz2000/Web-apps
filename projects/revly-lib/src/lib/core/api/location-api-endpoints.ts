import { ApiEndpoint } from './api-config';

export const API_LOCATION_ENDPOINTS = {
	WILAYAS: { path: 'Location/wilayas', httpVerb: 'GET' },
	MUNICIPALITIES: { path: 'Location/wilayas/:wilayaCode/municipalities', httpVerb: 'GET' },
	MUNICIPALITY_BY_LOCATION: { path: 'Location/coordinates/municipality', httpVerb: 'GET' }
} satisfies Record<string, ApiEndpoint>;
