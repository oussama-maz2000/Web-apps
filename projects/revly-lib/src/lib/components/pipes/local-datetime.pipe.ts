import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateTimeService } from '../../services/datetime/datetime.service';

@Pipe({
	name: 'localDateTime',
	standalone: true
})
export class LocalDateTimePipe implements PipeTransform {
	readonly #dateTimeService = inject(DateTimeService);
	//todo integrate LanguageCoreService and grab current local from language, then change medium format to whatever custom because day and month names will be localized propely then 'MMM dd, yyyy HH:mm'
	private datePipe = new DatePipe('en-US');

	/**
	 * Transform a UTC date string to local date time string
	 * @param value UTC date string
	 * @param format Optional date format (uses Angular's DatePipe format)
	 * @returns Formatted date string in local timezone
	 * Usage example:
	 * {{ someutcDateString | localDateTime }}  <!-- uses 'MM dd, yyyy HH:mm' format by default -->
	 * {{ someutcDateString | localDateTime:'full' }} localDateTime= 'full, medium, short, [custom]'
	 */
	transform(value: string | null | undefined, format: string = 'short'): string | null {
		if (!value) return null;

		const localDate = this.#dateTimeService.toLocalTime(value);
		return this.datePipe.transform(localDate, format);
	}
}
