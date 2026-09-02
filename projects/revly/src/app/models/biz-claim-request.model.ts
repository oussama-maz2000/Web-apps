import { BusinessOpeningHoursDto, BusinessSocialLinksDto, LocationDto } from '@revlib/models';

export interface BusinessClaimRequest {
	businessId?: number; // only for existing claim
	displayName?: string; // only for new business creation
	description?: string; // optional, max 4000
	categoryValue?: number;
	subCategoriesValues?: number[];
	phoneNumber?: string;
	fullAddress?: string;
	location?: Partial<LocationDto>;
	socialLinks?: BusinessSocialLinksDto;
	openingHours?: BusinessOpeningHoursDto[]; // optional
}

export interface ExistingBizClaimRequest {
	bizIdEnc: string;
	verificationPhone: string;
}
