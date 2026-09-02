// opening-hours-form.component.ts
import { Component, inject, input } from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DayOfWeek } from '@revlib/models';
import { timeRangeValidator } from '../utils/validators';

@Component({
	selector: 'app-opening-hours-form',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatTimepickerModule,
		MatNativeDateModule
	],
	templateUrl: './opening-hours-form.component.html'
})
export class OpeningHoursFormComponent {
	form = input.required<FormGroup>();
	days = input.required<DayOfWeek[]>();
	DayOfWeek = DayOfWeek;

	private fb = inject(FormBuilder);

	get hoursArray(): FormArray {
		const hoursControl = this.form().get('hours');
		if (!hoursControl) {
			throw new Error('Control "hours" not found in form');
		}
		return hoursControl as FormArray;
	}

	addDay() {
		if (this.hoursArray.length >= 7) return;

		const dayGroup = this.fb.group(
			{
				day: [null, Validators.required],
				openingTime: ['', Validators.required],
				closingTime: ['', Validators.required]
			},
			{ validators: timeRangeValidator }
		); // ← Validation personnalisée

		this.hoursArray.push(dayGroup);
	}

	removeDay(index: number) {
		this.hoursArray.removeAt(index);
	}

	usedDays(): number[] {
		return this.hoursArray.controls
			.map((control) => control.get('day')?.value)
			.filter((day): day is number => day !== null);
	}

	// Helper pour afficher l'erreur dans le template
	hasTimeRangeError(group: AbstractControl): boolean | undefined {
		const formGroup = group as FormGroup;

		return (
			formGroup.hasError('timeRangeInvalid') &&
			(formGroup.get('openingTime')?.touched || formGroup.get('closingTime')?.touched)
		);
	}
}
