import { ApiEndpoint } from '@revlib/core';

export const API_ACCESS_ENDPOINTS = {
	IS_STAFF: { path: 'Admin/Roles/IsStaff', httpVerb: 'GET' }
} satisfies Record<string, ApiEndpoint>;
