import { ApiEndpoint } from '@revlib/core';

export const API_ROLES_ENDPOINTS = {
	GET_STAFF_LIST: { path: 'Admin/Roles/GetStaff', httpVerb: 'GET' },
	ADD_ROLE_USER: { path: 'Admin/Roles/AddUserToRole', httpVerb: 'POST' },
	REMOVE_ROLE_USER: { path: 'Admin/Roles/RemoveUserFromRole', httpVerb: 'POST' }
} satisfies Record<string, ApiEndpoint>;
