import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { MatHint, MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import { ApplicationActions, AppState } from '@revlib/store';
import { getFirstErrorCode, getFirstErrorMessage } from '@revlib/utils';
import { interval, Subject, takeUntil } from 'rxjs';
import { BaseComponent } from '../../../../exports/public-components';
import { ERROR_TYPES, OTP_ERRORS } from '../../../core/internal/error/error-codes';
import { AuthPhoneFacade } from '../../../facades/auth/auth-phone-facade.service';
import { Result } from '../../../models/common/result';

@Component({
	selector: 'app-dialog-confirm-account-recovery',
	templateUrl: './dialog-otp-confirm.html',
	styleUrls: ['./dialog-otp-confirm.scss'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatHint,
		BackendResultComponent
	]
})
export class DialogOtpConfirmComponent extends BaseComponent implements OnDestroy, OnInit {
	//#region DI
	readonly #authPhoneFacade = inject(AuthPhoneFacade);
	readonly #fb = inject(FormBuilder);
	readonly #dialogRef = inject(MatDialogRef<DialogOtpConfirmComponent>);
	readonly #store = inject(Store<AppState>);
	readonly data = inject<DialogOtpConfirmData>(MAT_DIALOG_DATA);
	//#endregion

	//#region Constants
	readonly MAX_OTP_ATTEMPTS = 3;
	readonly COUNTDOWN_DURATION_SECONDS = 150; // 2.5min
	//#endregion

	//#region Signals
	readonly remainingAttempts = signal(this.MAX_OTP_ATTEMPTS);
	readonly countdownSeconds = signal(0);
	//#endregion

	//#region Computed
	readonly canResend = computed(() => this.countdownSeconds() > 0 || this.isLoading());

	readonly isSubmitDisabled = computed(() => this.isLoading() || this.remainingAttempts() === 0);
	//#endregion

	otpForm!: FormGroup;
	readonly #destroy$ = new Subject<void>();

	constructor() {
		super();
	}

	ngOnInit(): void {
		this.initializeForm();
		this.startCountdown();
	}

	ngOnDestroy(): void {
		this.#destroy$.next();
		this.#destroy$.complete();
	}

	private initializeForm(): void {
		this.otpForm = this.#fb.group({
			otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$'), Validators.minLength(6)]]
		});
	}

	private startCountdown(): void {
		this.countdownSeconds.set(this.COUNTDOWN_DURATION_SECONDS);
		interval(1000)
			.pipe(takeUntil(this.#destroy$))
			.subscribe(() => {
				const current = this.countdownSeconds();
				if (current > 0) this.countdownSeconds.set(current - 1);
			});
	}

	resendOtp(): void {
		if (this.canResend()) return;

		this.isLoading.set(true);
		this.errorResult.set(null);

		this.#authPhoneFacade
			.resendOtp$()
			.pipe(takeUntil(this.#destroy$))
			.subscribe({
				next: (result) => {
					if (result.isSucceeded) {
						this.startCountdown();

						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: 'Un SMS contenant un nouveau code OTP a été envoyé à votre téléphone'
							})
						);
					} else this.errorResult.set(result);
				},
				error: (error) => {
					this.handleResendError(error);
				},
				complete: () => {
					this.isLoading.set(false);
				}
			});
	}

	onOtpConfirm(): void {
		if (this.isSubmitDisabled()) return;

		this.isLoading.set(true);
		this.errorResult.set(null);

		const otpValue = this.otpForm.get('otp')?.value;

		this.#authPhoneFacade
			.confirmOtp$(this.data.phoneNumber, otpValue)
			.pipe(takeUntil(this.#destroy$))
			.subscribe({
				next: (result) => {
					if (result.isSucceeded) {
						this.#dialogRef.close(true);
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: result.success?.message || 'Otp Confirme'
							})
						);
					}
				},
				error: (error) => {
					this.handleConfirmError(error);
				},
				complete: () => {
					this.isLoading.set(false);
				}
			});
	}

	private handleResendError(error: Result): void {
		const errorCode = getFirstErrorCode(error);

		if (errorCode === OTP_ERRORS.NO_ACTIVE_VERIFICATION) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: 'Le code OTP a expiré. Veuillez en demander un nouveau.'
				})
			);

			this.#dialogRef.close(false);
			return;
		}

		this.errorResult.set(error);
		this.isLoading.set(false);
	}

	private handleConfirmError(error: Result<number>): void {
		this.errorResult.set(error);
		this.isLoading.set(false);
		const errorCode = getFirstErrorCode(error);

		if (errorCode === OTP_ERRORS.OTP_INVALID) {
			// Update remaining attempts
			const remaining = error.value !== undefined ? error.value : this.MAX_OTP_ATTEMPTS - 1;
			this.remainingAttempts.set(remaining);

			if (remaining === 0) {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: 'Nombre maximum de tentatives atteint. Veuillez réessayer plus tard.'
					})
				);
				this.#dialogRef.close(false);
			} else this.otpForm.get('otp')?.setValue(''); // Clear the OTP field for retry

			return;
		}

		if (errorCode === ERROR_TYPES.RATE_LIMITED) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: getFirstErrorMessage(error) || 'Trop de requêtes. Veuillez réessayer plus tard.'
				})
			);
			this.#dialogRef.close(false);
			return;
		}
	}
}

export interface DialogOtpConfirmData {
	phoneNumber: string;
	message: string;
}
