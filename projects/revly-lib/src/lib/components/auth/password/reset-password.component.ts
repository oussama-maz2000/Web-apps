import { Component, DestroyRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { BaseComponent } from '../../../../exports/public-components';
import { AUTH_PATHS } from '../../../core/routes/auth.routes';
import { AuthRecoveryFacade } from '../../../facades/auth/auth-recovery-facade.service';
import { Result } from '../../../models/common/result';
import { MyErrorStateMatcher } from '../../../utils/my-error-state-matcher';
import { getFirstErrorMessage } from '../../../utils/result-utils';
import { passwordValidators } from '../../../utils/validators';
import { BackendResultComponent } from '../../shared/backend-result.component';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
	selector: 'app-revlib-reset-password',
	standalone: true,
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	imports: [
		...COMMON_IMPORTS,
		ReactiveFormsModule,
		BackendResultComponent,
		PasswordFieldComponent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatProgressSpinnerModule
	]
})
export class ResetPasswordComponent extends BaseComponent implements OnInit, OnDestroy {
	//#region Inputs
	readonly Email = input.required<string>();
	readonly Token = input.required<string>();
	//#endregion

	//#region Getters
	get newPasswordControl() {
		return this.resetPasswordForm.get('newPassword');
	}
	get confirmNewPasswordControl() {
		return this.resetPasswordForm.get('confirmNewPassword');
	}
	//#endregion

	//#region Properties
	resetPasswordForm!: FormGroup;
	readonly instantMatcher = new MyErrorStateMatcher();
	//#endregion

	//#region DI
	readonly #fb = inject(FormBuilder);
	readonly #authRecoveryFacade = inject(AuthRecoveryFacade);
	readonly #store = inject(Store<AppState>);
	readonly #router = inject(Router);
	readonly destroy = inject(DestroyRef);
	//#endregion

	//#region Lifecycle hooks
	constructor() {
		super();
		this.#initForm();
	}

	ngOnInit(): void {
		if (!this.Email() || !this.Token()) this.goToHome();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
	//#endregion

	//#region  initialization
	#initForm(): void {
		this.resetPasswordForm = this.#fb.group({
			newPassword: ['', passwordValidators],
			confirmNewPassword: ['', passwordValidators]
		});
		// Add the cross-field validator separately
		this.resetPasswordForm.addValidators(this.#checkPasswords);
	}

	// Custom validator to check if password and confirm password match
	#checkPasswords(group: AbstractControl) {
		const formGroup = group as FormGroup;
		const password = formGroup.get('newPassword')?.value;
		const confirmPassword = formGroup.get('confirmNewPassword')?.value;

		return password === confirmPassword ? null : { passwordMismatch: true };
	}
	//#endregion

	onSubmit(): void {
		if (this.resetPasswordForm.invalid) return;
		this.#authRecoveryFacade
			.resetPassword$(this.Email(), this.resetPasswordForm.value.newPassword, this.Token())
			.pipe(takeUntilDestroyed(this.destroy))
			.subscribe({
				next: (result) => {
					if ((result as Result)?.isSucceeded) {
						this.successMessage.set(result?.success?.message as string);

						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: this.successMessage() as string
							})
						);
						this.goToLogin();
					}
				},
				error: (errorResult) => {
					const errorMessage = getFirstErrorMessage(errorResult);
					this.errorResult.set(errorResult as Result);
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: errorMessage as string
						})
					);
					this.goToForgotPassword();
				}
			});
	}

	//#region Navigation
	goToLogin(): void {
		this.#router.navigate([AUTH_PATHS.LOGIN]);
	}

	goToForgotPassword(): void {
		this.#router.navigate([AUTH_PATHS.FORGOT_PASSWORD]);
	}

	goToHome(): void {
		this.#router.navigate(['/']);
	}
	//#endregion
}
