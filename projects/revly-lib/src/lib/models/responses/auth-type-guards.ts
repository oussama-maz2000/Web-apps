import { PhoneNumDto } from '../requests/auth-phone.models';
import { AccountRecoveryResDto, AuthExtResDto, SignupLoginResDto } from './auth.models';

export function isSignupLoginDto(value: unknown): value is SignupLoginResDto {
	return (
		value !== null &&
		typeof value === 'object' &&
		'tokens' in value &&
		typeof (value as SignupLoginResDto).tokens === 'object'
	);
}

export function isAccountRecoveryDto(value: unknown): value is AccountRecoveryResDto {
	return (
		value !== null &&
		typeof value === 'object' &&
		'recoveryUrl' in value &&
		typeof (value as AccountRecoveryResDto).recoveryUrl === 'string'
	);
}

export function isPhoneNumDto(value: unknown): value is PhoneNumDto {
	return (
		value !== null &&
		typeof value === 'object' &&
		'phoneNumber' in value &&
		typeof (value as PhoneNumDto).phoneNumber === 'string'
	);
}

export function isAuthExtDto(
	value: AuthExtResDto | AccountRecoveryResDto | SignupLoginResDto
): value is AuthExtResDto {
	return value !== null && 'isNewUser' in value && value.isNewUser;
}
