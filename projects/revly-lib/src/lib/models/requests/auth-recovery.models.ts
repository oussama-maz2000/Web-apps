export interface ChangePasswordReqDto {
	currentPassword: string;
	newPassword: string;
}

export interface RecoveryTokenReqDto {
	email: string;
	recoveryToken: string;
}

export interface PasswordResetReqDto {
	email: string;
	newPassword: string;
	token: string;
}
