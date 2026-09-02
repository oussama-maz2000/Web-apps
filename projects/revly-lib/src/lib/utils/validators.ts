import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	if (!value) return null;

	const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
	return regex.test(value) ? null : { invalidPassword: true };
}

export const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
	const password = control.get('password')?.value;
	const confirmPassword = control.get('confirmPassword')?.value;

	return password === confirmPassword ? null : { passwordMismatch: true };
};

export function nameValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	if (!value) return null;

	const regex = /^[a-zA-Z0-9\s-]+$/;
	return regex.test(value) ? null : { invalidUsername: 'Invalid name.' };
}

export const emailPatternValidator = Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
export const passwordValidators = [
	Validators.required,
	Validators.minLength(8),
	Validators.maxLength(20),
	passwordValidator
];

export function mobilePhonePatternValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	if (!value) return null;

	const regex = /^(5|6|7)\d{8}$/; // Algerian mobile phone numbers
	return regex.test(value) ? null : { invalidPhoneNumber: true };
}

export function landlinePhonePatternValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	if (!value) return null;

	const regex = /^(?:\+213|0)[2-5]\d{7}$/; // Algerian landline phone numbers
	return regex.test(value) ? null : { invalidPhoneNumber: true };
}

export function businessPhonePatternValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	if (!value) {
		return null; // Let Validators.required handle emptiness
	}

	const mobileRegex = /^(5|6|7)\d{8}$/; // Algerian mobile
	const landlineRegex = /^(?:\+213|0)[2-5]\d{7}$/; // Algerian landline

	if (mobileRegex.test(value) || landlineRegex.test(value)) {
		return null; // Valid if it matches either
	}
	return { invalidPhoneNumber: true }; // Invalid otherwise
}

export function sameAsCurrentValidator(currentValue: string | undefined | null): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const newValue = control.value;
		// If either value is null/undefined/empty, don't validate
		if (!newValue || !currentValue) return null;

		return newValue === currentValue ? { sameAsCurrent: true } : null;
	};
}

/**
 * Validates that a control contains a valid URL.
 * - If the field is required, it must be non-empty and a valid URL.
 * - If the field is optional, empty is allowed, otherwise must be valid URL.
 */
export function socialLinkValidator(isRequired: boolean = false) {
	return (control: AbstractControl): ValidationErrors | null => {
		const value: string = control.value?.trim();

		// Optional field is empty → valid
		if (!value && !isRequired) return null;

		// Required field is empty → invalid
		if (!value && isRequired) return { required: true };

		// URL regex: must start with http:// or https://
		const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

		return urlRegex.test(value) ? null : { invalidUrl: true };
	};
}
