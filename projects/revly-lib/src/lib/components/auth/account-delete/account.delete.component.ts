import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PasswordFieldComponent } from '@revlib/components/shared/password-field/password-field.component';
import { passwordValidators } from '@revlib/utils';
import { gracePeriodDays } from '../../../shared-constants/auth-constants';

@Component({
	selector: 'app-delete-account-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		PasswordFieldComponent
	],
	templateUrl: './account.delete.component.html'
})
export class DeleteAccountDialogComponent implements OnInit {
	readonly dialogRef = inject(MatDialogRef<DeleteAccountDialogComponent>);
	passwordForm!: FormGroup;
	readonly #fb = inject(FormBuilder);

	readonly gracePeriodDays: number = gracePeriodDays;

	ngOnInit(): void {
		this.passwordForm = this.#fb.group({
			password: ['', passwordValidators]
		});
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onConfirm(): void {
		if (this.passwordForm.valid) {
			this.dialogRef.close(this.passwordForm.get('password')?.value);
		}
	}
}
