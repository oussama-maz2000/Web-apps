import { DayOfWeek } from '@revlib/models';
import { StateEnum } from '../../shared-constants/wilays-constants';
import { PriceRangeEnum } from '../types/price-range.enum';

export interface Business {
	bizFoodDetails: BizFood | null;
	category: ConfBizCategoryDto | null;
	categoryValue: number;
	claimedAt: Date | null;
	createdAt: string;
	description: string | null;
	displayName: string;
	fullAddress: string;
	id: string;
	idEnc: string;
	isClaimed: boolean;
	isOpen: boolean | null;
	isVerified: boolean;
	location: CoordinatesDto;
	municipalityCode: number;
	openingHours: OpeningHours[] | null;
	openStatus?: BusinessOpenStatus | null;
	phoneNumber: string;
	pictures: BizPictures[] | null;
	profilePicture: BizPictures | null;
	rating: BusinessRating | null;
	socialLinks: BusinessSocialLinks | null;
	stateCode: StateEnum;
	subCategories: ConfBizSubCategoryDto[] | null;
	todayOpeningHours: OpeningHours | null;
	verifiedAt: Date | null;
}
export interface BizFood {
	acceptsCardPayment: boolean;
	acceptsDelivery: boolean;
	acceptsReservations: boolean;
	cuisineTagsJson: string | null;
	DeliveryRadiusKm: number | null;
	hasFamilyRoom: boolean;
	hasWifiGuests: boolean;
	isBanquetOrganizer: boolean;
	isBirthdayOrganizer: boolean;
	menu: string | null;
	seatingCapacity: number | null;
}

export interface BusinessRating {
	averageRating: number;
	fiveStarCount: number;
	fourStarCount: number;
	oneStarCount: number;
	priceRange: PriceRangeEnum;
	priceRangeCount: number;
	priceRangeSum: number;
	threeStarCount: number;
	totalReviewsCount: number;
	twoStarCount: number;
}

export interface BizPictures {
	businessId: string;
	fileName: string;
	hasPassedModeration: boolean;
	id: string;
	isProfile: boolean;
	url: string | null;
}

export interface CoordinatesDto {
	coordinates: [number, number];
}

export interface BusinessSocialLinks {
	facebook: string | null;
	googleMaps: string | null;
	id: string;
	instagram: string | null;
	website: string | null;
}

export interface ConfBizSubCategoryDto {
	nameAr: string;
	nameEn: string;
	nameFr: string;
	value: number;
}

export interface ConfBizCategoryDto {
	nameAr: string;
	nameEn: string;
	nameFr: string;
	subCategories?: ConfBizSubCategoryDto[] | null;
	value: number;
}
type OpeningHours = {
	businessId: string;
	closingTime: string;
	day: DayOfWeek;
	id: string;
	openingTime: string;
};

export enum BusinessOpenStatus {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	OPENING_SOON = 'OPENING_SOON',
	CLOSING_SOON = 'CLOSING_SOON'
}
