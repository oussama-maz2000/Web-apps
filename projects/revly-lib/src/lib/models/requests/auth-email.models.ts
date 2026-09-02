export interface ConfirmEmailReqDto {
	userIdEnc: string;
	token: string;
}

export interface ConfirmEmailChangeReqDto {
	oldEmail: string;
	newEmail: string;
	token: string;
}

export interface EmailDto {
	emailAddresse: string;
}

export interface ChangeEmailReqDto {
	newEmail: string;
	currentPassword: string;
}
