export interface ValidateSmsOtpReqDto {
	phoneNumber: string;
	otp: string;
}

export interface PhoneNumDto {
	phoneNumber: string;
}

export interface PhoneNumChangeDto {
	phoneNumber: string;
	password: string;
}
