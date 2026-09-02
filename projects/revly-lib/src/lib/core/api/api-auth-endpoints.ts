import { ApiEndpoint } from './api-config';

// Group endpoints by domain
export const API_AUTH_ENDPOINTS = {
	SIGNUP: { path: 'auth/signup' },
	LOGIN: { path: 'auth/login' },
	REFRESH_TOKEN: { path: 'auth/refreshToken' },
	DELETE: { path: 'auth/DeleteAccount', httpVerb: 'DELETE' },
	LOGOUT: { path: 'auth/logout' }
} satisfies Record<string, ApiEndpoint>;

export const API_AUTH_EXT_ENDPOINTS = {
	GoogleAuth: { path: 'auth/ext/googleauth' },
	GoogleCompleteSignUp: { path: 'auth/ext/googlecompletesignup' }
} satisfies Record<string, ApiEndpoint>;

export const API_AUTH_EMAIL_ENDPOINTS = {
	CHANGE: { path: 'auth/email/change', httpVerb: 'PATCH' },
	CONFIRM: { path: 'auth/email/confirm', httpVerb: 'GET' },
	CONFIRM_CHANGE: { path: 'auth/email/confirmchange', httpVerb: 'GET' },
	RESEND_CONFIRMATION: { path: 'auth/email/resendconfirmation' }
} satisfies Record<string, ApiEndpoint>;

export const API_AUTH_PHONE_ENDPOINTS = {
	ADD: { path: 'auth/phone/add' },
	VALIDATE: { path: 'auth/phone/validate' },
	RESEND_VERIFICATION: { path: 'auth/phone/resendverification' },
	CHANGE: { path: 'auth/phone/change', httpVerb: 'PUT' }

	//disabled in purpose
	//DELETE: { path: 'auth/phone/delete', httpVerb: 'DELETE' },
} satisfies Record<string, ApiEndpoint>;

export const API_AUTH_RECOVERY_ENDPOINTS = {
	FORGOT_PASSWORD: { path: 'auth/recovery/forgotpassword' },
	RESET_PASSWORD: { path: 'auth/recovery/resetpassword' },
	CHANGE_PASSWORD: { path: 'auth/recovery/changepassword', httpVerb: 'PATCH' },
	RECOVER_DELETED_ACCOUNT: { path: 'auth/recovery/recoverdeletedaccount', httpVerb: 'GET' }
} satisfies Record<string, ApiEndpoint>;
