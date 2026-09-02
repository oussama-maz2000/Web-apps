export interface EmailVerifyQueryParams {
	Email: string;
	ResendState: 'true' | 'false';
	UserIdEnc?: string;
	Token?: string;
}
