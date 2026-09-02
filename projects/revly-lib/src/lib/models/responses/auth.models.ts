import { UserDto } from './userDto.model';

export interface SignupLoginResDto {
	tokens: TokenDto;
	user: UserDto;
}

export interface AuthExtResDto {
	tokens: TokenDto | null;
	user: UserDto | null;
	isNewUser: boolean;
	nameFromExtProvider: string | null;
}

export interface AccountRecoveryResDto {
	recoveryUrl: string;
	expiresAt: string;
}

export interface TokenDto {
	accessToken: string;
	refreshToken: string;
}
