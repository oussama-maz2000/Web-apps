import { BusinessOpeningHoursDto, BusinessSocialLinksDto } from '@revlib/models';

export interface UpdateBizProfileDto {
	id: string;
	idEnc: string;
	displayName: string;
	categoryValue: number;
	subCategoriesValues: number[];
	fullAddress: string;
	description: string;
	socialLinks: BusinessSocialLinksDto;
	openingHours: BusinessOpeningHoursDto[];
}
