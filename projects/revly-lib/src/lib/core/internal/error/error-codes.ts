export const AUTH_ERROR_TYPES = {
	UNAUTHORIZED: 'COM_02_001',
	INVALID_EXPIRED_TOKEN: 'COM_02_003',
	EMAIL_NOT_VERIFIED: 'COM_02_002',
	INVALID_OP: 'COM_00_003'
};

export const COMMON_ERRORS = {
	UNKNOWN_ERROR: 'COM_00_001'
};

export const RATE_LIMIT_ERROR_TYPES = {
	EMAIL: 'INF_20_001'
};

// Constants for error types
export const ERROR_TYPES = {
	NETWORK: 'NETWORK_ERROR',
	TIMEOUT: 'TIMEOUT_ERROR',
	SERVER_DOWN: 'SERVER_DOWN',
	RATE_LIMITED: 'RATE_LIMITED',
	OFFLINE: 'OFFLINE'
} as const;

export const OTP_ERRORS = {
	NO_ACTIVE_VERIFICATION: 'USER_04_002', //need to initiate the verification first, probably otp expired
	OTP_INVALID: 'COM_02_004' // OTP is invalid
};
