import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DateTimeService {
	/**
	 * Converts a UTC date string to local timezone
	 * @param utcDate UTC date string
	 * @returns Date object in local timezone
	 */
	toLocalTime(utcDate: string): Date {
		return new Date(utcDate);
	}

	/**
	 * Formats a UTC date string to local time string with specified format
	 * @param utcDate UTC date string
	 * @param format Optional format string for Angular DatePipe
	 * @returns Formatted date string in local timezone
	 */
	formatLocalTime(utcDate: string): string {
		//, format: string = 'medium'
		const localDate = this.toLocalTime(utcDate);
		return localDate.toLocaleString();
	}

	/**
	 * Gets current timezone offset
	 * @returns string representation of timezone offset (e.g., "UTC+2")
	 */
	getCurrentTimezoneOffset(): string {
		const offset = new Date().getTimezoneOffset();
		const hours = Math.abs(Math.floor(offset / 60));
		const minutes = Math.abs(offset % 60);
		const sign = offset <= 0 ? '+' : '-';

		return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`;
	}
}
