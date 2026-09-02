import { Gender, Language, LanguageEnum } from '../types/common.types';
import { LocationDto } from '../types/location.types';

export interface SignupReqDto {
	email: string;
	password: string;
	name: string;
	location: LocationDto;
	preferredLanguage: Language;
	gender: Gender;
}

export interface LoginReqDto {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface RefreshTokenReqDto {
	accessToken: string;
	refreshToken: string;
}

export interface GoogleAuthReqDto {
	idToken: string;
}

export interface GoogleAuthCompeleteSignUpReqDto {
	idToken: string;
	name: string;
	location: LocationDto;
	gender: Gender;
	preferredLanguage: Language;
}

export interface DeleteAccountReqDto {
	passwordOrIdToken: string;
}

export interface UpdateUserProfileReqDto {
	name: string;
	preferredLanguage: LanguageEnum;
	location: LocationDto;
}
