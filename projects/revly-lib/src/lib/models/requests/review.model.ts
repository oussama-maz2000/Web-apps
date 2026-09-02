import { PriceRangeEnum } from '../types/price-range.enum';
import { Rating } from '../types/review.types';

export interface ReviewPostReqDto {
	businessId: string;
	rating: Rating;
	text: string;
	priceRange: PriceRangeEnum;
}

export interface ReviewDelete {
	reviewId: string;
	businessId: string;
}
