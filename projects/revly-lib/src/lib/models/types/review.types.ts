// Review-related types

import { PriceRangeEnum } from './price-range.enum';

/**
 * Valid rating values for reviews (1-5 stars)
 * 0 = No rating/unset (initial Rating signal value)
 * 1-5 = Star rating
 */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export const PRICE_RANGE_LABELS: { [key: number]: string } = {
	[PriceRangeEnum.NOT_SET]: 'Non défini',
	[PriceRangeEnum.CHEAP]: 'Bon marché',
	[PriceRangeEnum.AFFORDABLE]: 'Abordable',
	[PriceRangeEnum.MODERATE]: 'Modéré',
	[PriceRangeEnum.EXPENSIVE]: 'Cher',
	[PriceRangeEnum.LUXURY]: 'Luxe'
};
