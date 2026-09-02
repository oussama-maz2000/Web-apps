export interface BusinessCategory {
	id: number;
	value: number;
	nameAr: string;
	nameEn: string;
	nameFr: string;
	subCategories: BusinessSubCategory[];
}

export interface BusinessSubCategory {
	id: number;
	value: number;
	nameAr: string;
	nameEn: string;
	nameFr: string;
}
