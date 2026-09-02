/**
 * Application storage keys
 * Centralizing storage keys prevents duplication and typos
 */

export const STORAGE_PREFIX = 'revly_';

//this prefix will be used for data wanted to be persistent
export const STORAGE_PERSISTANCE_PREFIX = 'revlyP_';

export const STORAGE_KEYS = {
	// Auth related
	ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
	REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
	USER_PROFILE: `${STORAGE_PREFIX}user_profile`,
	//ACCESS_TOKEN_COOKIE: `ssr-dev-auth-cookie`, //name from backend
	ACCESS_TOKEN_COOKIE: `auth-token`, //name from backend
	//todo replace above in prody

	// User preferences
	PREFERRED_LANGUAGE: `${STORAGE_PREFIX}preferred_language`,

	// Session storage keys
	RECOVERY_DATA: `${STORAGE_PREFIX}recovery_data`,
	GOOGLE_AUTH_TOKEN: `${STORAGE_PREFIX}google_auth_token`,
	GOOGLE_USER_NAME: `${STORAGE_PREFIX}google_user_name` //name retuened by google
};
