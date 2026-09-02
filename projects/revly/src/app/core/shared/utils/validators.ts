import { AbstractControl, ValidationErrors } from '@angular/forms';

export function timeRangeValidator(group: AbstractControl): ValidationErrors | null {
	const opening = group.get('openingTime')?.value;
	const closing = group.get('closingTime')?.value;

	if (!opening || !closing) return null;

	const toMinutes = (val: Date | string): number => {
		if (val instanceof Date) {
			return val.getHours() * 60 + val.getMinutes();
		}
		const [hours, minutes] = String(val).split(':').map(Number);
		return hours * 60 + minutes;
	};

	return toMinutes(closing) <= toMinutes(opening) ? { timeRangeInvalid: true } : null;
}
