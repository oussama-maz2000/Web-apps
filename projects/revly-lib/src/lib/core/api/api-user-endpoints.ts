import { ApiEndpoint } from './api-config';

export const API_USER_ENDPOINTS = {
	UPDATE_USER_PROFILE: { path: 'user/UpdateUserProfile', httpVerb: 'PATCH' },
	GET_USER_PROFILE: { path: 'user/me', httpVerb: 'GET' },
	UPLOAD_USER_PROFILE_IMAGE: { path: 'user/UploadProfilePicture', httpVerb: 'POST' }
} satisfies Record<string, ApiEndpoint>;
