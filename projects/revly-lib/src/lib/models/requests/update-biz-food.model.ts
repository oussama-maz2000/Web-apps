export interface BizFoodUpdateReqDto {
	businessId: string;
	acceptsCardPayment: boolean;
	acceptsDelivery: boolean;
	acceptsReservations: boolean;
	// cuisineTagsJson: string | null;
	DeliveryRadiusKm: number | null;
	hasFamilyRoom: boolean;
	hasWifiGuests: boolean;
	isBanquetOrganizer: boolean;
	isBirthdayOrganizer: boolean;
	// menu: string | null;
	seatingCapacity: number | null;
}
