import { BusinessOpeningHoursDto } from '@revlib/models';
export type OpenStatus = 'OPEN' | 'CLOSED';
export interface TopBusinessCardDto {
	id: string;
	idEnc: string;
	displayName: string;
	profilePicture?: {
		url: string;
	} | null;
	openStatus?: OpenStatus | null;
	todayOpeningHours?: BusinessOpeningHoursDto | null;
	rating: {
		averageRating: number;
		totalReviewsCount: number;
	};
	category: {
		nameFr: string;
	};
}
export const STATUS_LABELS: Record<OpenStatus, string> = {
	OPEN: 'Ouvert',
	CLOSED: 'Fermé'
};
