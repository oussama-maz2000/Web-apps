import { GenderEnum, LanguageEnum } from '@revlib/models';
import { LocationDto } from '../types/location.types';

export interface UserDto {
	idEnc: string;
	name: string;
	email: string;
	phoneNumber: string | null;
	isVerified: boolean;
	preferredLanguage: LanguageEnum;
	gender: GenderEnum;
	profilePictureUrl: string | null;
	location: LocationDto;
	isBizOwnerOrClaimer: boolean;
	isExternalUser: boolean;
	hasNameChanged: boolean;
	ownedBusinessesIds: string[] | null;
	claimedBusinessesIds: string[] | null;
}
