export function parseRetryAfterSeconds(retryAfter: string): number {
	if (!isNaN(Number(retryAfter))) return Number(retryAfter);

	// It's an HTTP date format
	try {
		const retryDate = new Date(retryAfter);
		const secondsToWait = Math.ceil((retryDate.getTime() - Date.now()) / 1000);

		if (isNaN(secondsToWait)) return 0;

		return Math.max(0, secondsToWait); // Ensure non-negative
	} catch {
		// If parsing fails, use a default
		return 60; // Default to 1 minute
	}
}

export function parseRetryAfterToOptimalTimeUnit(retryAfter: string): RetryAfterType {
	const seconds = parseRetryAfterSeconds(retryAfter);

	if (seconds > 3600)
		return { value: Math.max(seconds / 3600, 1), unit: TimeUnit.Hours }; //convert to hours
	else if (seconds > 60)
		return { value: Math.max(seconds / 60, 1), unit: TimeUnit.Minutes }; //convert to minutes
	else return { value: seconds, unit: TimeUnit.Seconds };
}

export interface RetryAfterType {
	value: number;
	unit: TimeUnit;
}

export enum TimeUnit {
	Seconds = 'Secondes', //'shared.common.units.seconds',
	Minutes = 'Minutes', //'shared.common.units.minutes',
	Hours = 'Heures' //'shared.common.units.hours'
}
