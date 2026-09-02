import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import {
	AbstractControl,
	AbstractControlOptions,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { AuthBaseFacade } from '../../../facades/auth/auth-base-facade.service';
import { AuthRecoveryFacade } from '../../../facades/auth/auth-recovery-facade.service';
import { ChangePasswordReqDto } from '../../../models/requests/auth-recovery.models';
import { passwordValidators } from '../../../utils/validators';
import { BaseComponent } from '../../base.component';
import { BackendResultComponent } from '../../shared/backend-result.component';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
	selector: 'app-revlib-password-change',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		PasswordFieldComponent,
		MatError,
		BackendResultComponent,
		MatExpansionPanel,
		MatExpansionPanelHeader,
		MatExpansionPanelTitle
	],
	templateUrl: './password-change.component.html'
})
export class PasswordChangeComponent extends BaseComponent implements OnDestroy {
	readonly #fb = inject(FormBuilder);
	readonly #authRecoveryFacade = inject(AuthRecoveryFacade);
	readonly #authBaseFacade = inject(AuthBaseFacade);
	readonly #store = inject(Store<AppState>);

	passwordForm!: FormGroup;
	get currentPasswordControl() {
		return this.passwordForm.get('currentPassword');
	}
	get newPasswordControl() {
		return this.passwordForm.get('newPassword');
	}
	get confirmPasswordControl() {
		return this.passwordForm.get('confirmNewPassword');
	}

	//#region Lifecycle Hooks
	constructor() {
		super();
		this.initForm();
	}

	ngOnDestroy(): void {
		this.subscriptions?.unsubscribe();
	}
	//#endaregion

	private initForm(): void {
		const options: AbstractControlOptions = {
			validators: this.passwordValidatorGroup,
			updateOn: 'change'
		};

		this.passwordForm = this.#fb.group(
			{
				currentPassword: ['', passwordValidators],
				newPassword: ['', passwordValidators],
				confirmNewPassword: ['', passwordValidators]
			},
			options
		);
	}

	onSubmit(): void {
		this.errorResult.set(null);
		this.successMessage.set(null);

		if (!this.passwordForm.valid || this.isLoading()) return;

		this.isLoading.set(true);

		const { currentPassword, newPassword } = this.passwordForm.value;
		const payload: ChangePasswordReqDto = { currentPassword, newPassword };

		const changePasswordSub = this.#authRecoveryFacade
			.changePassword$(payload)
			.pipe(
				tap((result) => {
					if (result.isSucceeded)
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: result?.success?.message || 'Mot de passe modifié avec succès'
							})
						);
				}),
				switchMap(() => {
					return this.#authBaseFacade.logout$(); // perform logout
				}),
				catchError((error) => {
					this.errorResult.set(error);
					this.isLoading.set(false);
					return EMPTY; // ensure observable completes gracefully
				}),
				finalize(() => {
					this.isLoading.set(false); // always called, success or error
				})
			)
			.subscribe();

		this.subscriptions?.add(changePasswordSub);
	}

	reset(): void {
		this.passwordForm.reset();
		this.errorResult.set(null);
		this.successMessage.set(null);
	}

	private passwordValidatorGroup(control: AbstractControl): ValidationErrors | null {
		if (!(control instanceof FormGroup)) return null;

		const current = control.get('currentPassword')?.value;
		const newPass = control.get('newPassword')?.value;
		const confirm = control.get('confirmNewPassword')?.value;

		const errors: ValidationErrors = {};

		if (newPass && confirm && newPass !== confirm) errors['passwordMismatch'] = true;

		if (current && newPass && current === newPass) errors['sameAsCurrent'] = true;

		return Object.keys(errors).length ? errors : null;
	}
}
