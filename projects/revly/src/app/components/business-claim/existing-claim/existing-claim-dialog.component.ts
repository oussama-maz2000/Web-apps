import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { businessPhonePatternValidator } from '../../../../../../revly-lib/src/lib/utils/validators';

@Component({
	selector: 'app-business-claim-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatFormFieldModule,
		MatInputModule
	],
	template: `
		<div class="p-4">
			<h2 mat-dialog-title>Revendiquer ce commerce</h2>
			<mat-dialog-content>
				<p class="mb-4">Pour revendiquer ce commerce, veuillez vérifier le numéro de téléphone associé.</p>

				<form [formGroup]="form" class="flex flex-col gap-4">
					<mat-form-field class="w-full">
						<mat-label>Numéro de téléphone</mat-label>
						<input matInput formControlName="verificationPhone" placeholder="+33 6 12 34 56 78" />
						@if (form.get('verificationPhone')?.hasError('required')) {
							<mat-error>Le numéro de téléphone est requis</mat-error>
						}
						@if (form.get('verificationPhone')?.hasError('invalidPhoneNumber')) {
							<mat-error>Numéro de téléphone invalide</mat-error>
						}
					</mat-form-field>
				</form>
			</mat-dialog-content>
			<mat-dialog-actions [align]="'end'">
				<button matButton [mat-dialog-close]="null">Annuler</button>
				<button matButton="filled" color="primary" [disabled]="form.invalid" (click)="submit()">
					Valider
				</button>
			</mat-dialog-actions>
		</div>
	`
})
export class ExistingClaimDialogComponent {
	private fb = inject(FormBuilder);
	form: FormGroup;
	readonly dialogRef = inject(MatDialogRef<ExistingClaimDialogComponent>);
	readonly data = inject<{ verificationPhone: string }>(MAT_DIALOG_DATA);

	constructor() {
		this.form = this.fb.group({
			verificationPhone: [
				this.data.verificationPhone || '',
				[Validators.required, businessPhonePatternValidator]
			]
		});
	}

	submit() {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value.verificationPhone);
		}
	}
}
