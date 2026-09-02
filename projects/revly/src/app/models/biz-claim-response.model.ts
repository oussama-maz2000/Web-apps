import { LocationDto } from '@revlib/models';

export interface BusinessClaimResponse {
	idEnc: string;
	displayName: string;
	categoryValue: number;
	phoneNumber: string;
	fullAddress: string;
	location: LocationDto;
}
