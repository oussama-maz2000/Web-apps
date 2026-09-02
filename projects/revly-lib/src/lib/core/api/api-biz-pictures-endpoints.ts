import { ApiEndpoint } from './api-config';

export const API_BIZ_PICTURES_ENDPOINTS = {
	UPLOAD: { path: 'Biz/Images/UploadPictures', httpVerb: 'POST' },
	DELETE: { path: 'Biz/Images/DeletePicture', httpVerb: 'DELETE' },
	SET_PROFILE_PICTURE: { path: 'Biz/Images/SetProfilePicture', httpVerb: 'PATCH' }
} satisfies Record<string, ApiEndpoint>;
