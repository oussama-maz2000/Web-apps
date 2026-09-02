export interface Wilaya {
	code: number;
	name: string;
}

export enum GenderEnum {
	Undefined = 0,
	Male = 1,
	Female = 2
}

// Gender
export const Genders = [
	{ label: 'Undefined', value: GenderEnum.Undefined },
	{ label: 'Male', value: GenderEnum.Male },
	{ label: 'Female', value: GenderEnum.Female }
] as const;

export type Gender = (typeof Genders)[number]['value'];

// Language
export enum LanguageEnum {
	Arabic = 1,
	English = 2,
	French = 3
}

//Order is important here, it should match the order of LanguageEnum
export const Languages = [
	{ label: 'العربية', value: LanguageEnum.Arabic, code: 'ar' },
	{ label: 'English', value: LanguageEnum.English, code: 'en' },
	{ label: 'Français', value: LanguageEnum.French, code: 'fr' }
] as const;

export type Language = (typeof Languages)[number]['value'];

export const SUPPORTED_LANGUAGES_CODES = ['en', 'fr', 'ar'];
