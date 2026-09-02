import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { PasswordFieldComponent } from '../../../../exports/public-components';
import { BackendResultComponent } from '../../../components/shared/backend-result.component';
import { AuthPhoneFacade } from '../../../facades/auth/auth-phone-facade.service';
import { Result } from '../../../models/common/result';
import { mobilePhonePatternValidator, passwordValidator, sameAsCurrentValidator } from '../../../utils/validators';
import { BaseComponent } from '../../base.component';
import { DialogOtpConfirmComponent, DialogOtpConfirmData } from './dialog-otp-confirm';

@Component({
	selector: 'app-revlib-phone-management',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		ReactiveFormsModule,
		MatIcon,
		MatError,
		PasswordFieldComponent,
		BackendResultComponent,
		MatExpansionPanel,
		MatExpansionPanelHeader,
		MatExpansionPanelTitle
	],
	templateUrl: './phone-management.component.html'
})
export class PhoneManagementComponent extends BaseComponent implements OnInit, OnDestroy {
	isVerified = input.required<boolean>();
	currentPhoneNumber = input.required<string | undefined>();

	//#region DI
	readonly #AuthPhoneFacade = inject(AuthPhoneFacade);
	readonly #fb = inject(FormBuilder);
	private readonly dialog = inject(MatDialog);
	//#endregion

	private dialogRef: MatDialogRef<DialogOtpConfirmComponent> | null = null;
	phoneChangeForm!: FormGroup;
	phoneAddForm!: FormGroup;

	//#region getters
	get currentForm(): FormGroup {
		// Returns current form based on state
		return this.isVerified() ? this.phoneChangeForm : this.phoneAddForm;
	}

	get phoneControl() {
		return this.currentForm.get('phoneNumber');
	}
	get passwordControl() {
		return this.phoneChangeForm.get('password');
	}
	//#endregion

	//#region Lifecycle Hooks
	constructor() {
		super();
	}

	ngOnInit() {
		const normalizedCurrentPhone = this.currentPhoneNumber()?.replace(/^0/, '');

		this.phoneChangeForm = this.#fb.group({
			phoneNumber: [
				'',
				[Validators.required, mobilePhonePatternValidator, sameAsCurrentValidator(normalizedCurrentPhone)]
			],
			password: ['', passwordValidator]
		});

		this.phoneAddForm = this.#fb.group({
			phoneNumber: ['', [Validators.required, mobilePhonePatternValidator]]
		});
	}

	ngOnDestroy(): void {
		this.subscriptions?.unsubscribe();
		this.dialogRef?.close();
	}
	//#endregion

	//#region Form Submission
	onPhoneVerify(): void {
		this.errorResult.set(null);
		this.successMessage.set(null);

		if (this.currentForm.invalid || this.isLoading()) return;

		this.isLoading.set(true);
		let phoneObs$: Observable<Result>;

		if (this.isVerified())
			phoneObs$ = this.#AuthPhoneFacade.change$(this.phoneControl?.value, this.passwordControl?.value);
		else phoneObs$ = this.#AuthPhoneFacade.add$(this.phoneControl?.value);

		const authSub = phoneObs$.subscribe({
			next: (result) => {
				if (result.isSucceeded) {
					const dialogData: DialogOtpConfirmData = {
						phoneNumber: this.phoneControl?.value,
						message: result.success?.message || ''
					};
					this.dialogRef = this.dialog.open(DialogOtpConfirmComponent, {
						data: dialogData,
						disableClose: true
					});
				}
			},
			error: (error) => {
				this.errorResult.set(error);
				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});

		this.subscriptions.add(authSub);
	}
	//#endregion
}
