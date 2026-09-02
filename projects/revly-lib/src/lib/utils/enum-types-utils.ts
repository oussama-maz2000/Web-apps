import { GenderEnum, Genders, LanguageEnum } from '../models/types/common.types';

export function toLanguageCode(lang: LanguageEnum): string {
	switch (lang) {
		case LanguageEnum.English:
			return 'en';
		case LanguageEnum.French:
			return 'fr';
		case LanguageEnum.Arabic:
			return 'ar';
		default:
			return 'en';
	}
}

export function getGenderLabel(gender: GenderEnum | undefined): string {
	return Genders.find((g) => g.value === gender)?.label || Genders[0].label; //0= "undefined"
}
