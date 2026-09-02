export interface BusinessOpeningHoursDto {
	id?: string;
	day: DayOfWeek;
	openingTime: string; // "09:00"
	closingTime: string; // "18:00"
}

export enum DayOfWeek {
	Sunday = 0,
	Monday = 1,
	Tuesday = 2,
	Wednesday = 3,
	Thursday = 4,
	Friday = 5,
	Saturday = 6
}
