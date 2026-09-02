import { PriceRangeEnum } from '../types/price-range.enum';
import type { Rating } from '../types/review.types';

export interface ReviewDto {
	id: string;
	idEnc: string;
	bizIdEnc: string;
	rating: Rating;
	text: string;
	isMyReview: boolean;
	createdAt: string;
	editedAt: string;
	helpfulCount: number;
	notHelpfulCount: number;
	isPinned: boolean;
	hasBusinessReply: boolean;
	priceRange: PriceRangeEnum;
	reviewReply?: {
		text: string;
		createdAt: string;
	};
	myReaction?: boolean | null;
	reviewer?: {
		id: string;
		name: string;
		profilePictureUrl: string | null;
	};
}
