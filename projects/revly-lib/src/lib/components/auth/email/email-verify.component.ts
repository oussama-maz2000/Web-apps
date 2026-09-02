import { Component, inject, input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { AUTH_ERROR_TYPES, ERROR_TYPES, RATE_LIMIT_ERROR_TYPES } from '../../../core/internal/error/error-codes';
import { AUTH_PATHS } from '../../../core/routes/auth.routes';
import { CONTROL_PATHS } from '../../../core/routes/control.routes';
import { AuthEmailFacade } from '../../../facades/auth/auth-email-facade.service';
import { Result } from '../../../models/common/result';
import { EmailVerifyQueryParams } from '../../../models/params/email-verify.types';
import { createErrorResult, getFirstErrorCode, getFirstErrorMessage } from '../../../utils/result-utils';
import { BaseComponent } from '../../base.component';

type UiState = 'resend' | 'confirm';

@Component({
	selector: 'app-email-verify',
	templateUrl: './email-verify.component.html',
	styleUrls: ['./email-verify.component.scss'],
	standalone: true,
	imports: [MatButtonModule, RouterLink, MatProgressSpinnerModule]
})
export class EmailVerifyComponent extends BaseComponent implements OnInit, OnDestroy {
	//#region Inputs
	readonly UserIdEnc = input<EmailVerifyQueryParams['UserIdEnc']>('');
	readonly Token = input<EmailVerifyQueryParams['Token']>('');
	readonly Email = input.required<EmailVerifyQueryParams['Email']>();
	readonly ResendState = input<EmailVerifyQueryParams['ResendState']>('false');
	//#endregion

	//#region DI
	private readonly authEmailFacade = inject(AuthEmailFacade);
	private readonly router = inject(Router);
	readonly #store = inject(Store<AppState>);
	//#endregion

	//#region Properties
	uiState: WritableSignal<UiState> = signal<UiState>('resend');
	resendDisabled = signal<boolean>(false);
	countdown = signal<number>(0);
	private countdownSubscription?: Subscription;

	readonly RESEND_DURATION_SECONDS = 120;
	readonly LOGIN_PATH = '/' + AUTH_PATHS.LOGIN;
	//#endregion

	// #region Lifecycle Hooks
	ngOnInit(): void {
		const resendState = this.ResendState();
		if (resendState !== 'true') {
			this.uiState.set('confirm');
			this.confirmEmail();
		}
	}

	ngOnDestroy(): void {
		this.clearCountdownSubscription();
		this.subscriptions?.unsubscribe();
	}
	//#endregion

	confirmEmail(): void {
		this.isLoading.set(true);

		const userIdEnc = this.UserIdEnc();
		const token = this.Token();

		if (!userIdEnc || !token) {
			this.errorResult.set(createErrorResult('Une erreur est survenue. Veuillez réessayer plus tard.'));
			this.uiState.set('resend');
			this.isLoading.set(false);
			return;
		}

		const confirmEmailSub = this.authEmailFacade.confirmEmail$(userIdEnc, token).subscribe({
			next: () => {
				this.#store.dispatch(
					ApplicationActions.showSuccessSnackbar({
						message: 'Votre email a été vérifié avec succès.'
					})
				);
				this.router.navigate([CONTROL_PATHS.LATEST_APP]);
			},
			error: (error: Result) => {
				let errorMessage: string | undefined;
				const errorCode = getFirstErrorCode(error);

				if (errorCode === AUTH_ERROR_TYPES.INVALID_OP) {
					errorMessage =
						"La vérification a échoué, le lien a peut-être expiré, veuillez réessayer de renvoyer l'e-mail de vérification.";
					this.errorResult.set(createErrorResult(errorMessage));
				} else errorMessage = getFirstErrorMessage(error);

				this.uiState.set('resend');
				this.errorResult.set(createErrorResult(errorMessage!));
				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});

		this.subscriptions.add(confirmEmailSub);
	}

	resendVerificationEmail(): void {
		this.isLoading.set(true);
		this.resendDisabled.set(true);
		this.countdown.set(this.RESEND_DURATION_SECONDS);
		this.errorResult.set(null);

		// Cancel any existing countdown
		this.clearCountdownSubscription();

		// Start a new countdown
		this.countdownSubscription = timer(0, 1000)
			.pipe(take(this.RESEND_DURATION_SECONDS + 1))
			.subscribe((sec) => {
				const left = this.RESEND_DURATION_SECONDS - sec;
				this.countdown.set(left);
				if (left === 0) this.resendDisabled.set(false);
			});

		const resendConfirmationSub = this.authEmailFacade.resendConfirmation$(this.Email()).subscribe({
			next: () => {
				this.#store.dispatch(
					ApplicationActions.showSuccessSnackbar({
						message: "L'email de vérification a été renvoyé dans votre boîte de réception."
					})
				);
				this.isLoading.set(false);
			},
			error: (error: Result) => {
				const errorCode = getFirstErrorCode(error);
				const errorMessage = getFirstErrorMessage(error);

				// Only enable resend if it's not rate limited
				if (errorCode !== RATE_LIMIT_ERROR_TYPES.EMAIL && errorCode !== ERROR_TYPES.RATE_LIMITED) {
					this.resendDisabled.set(false);
					this.clearCountdownSubscription();
					this.countdown.set(0);
				}

				this.errorResult.set(error);

				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message:
							errorMessage ||
							"Échec de l'envoi de l'email de vérification. Veuillez réessayer plus tard."
					})
				);
				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});

		this.subscriptions.add(resendConfirmationSub);
	}

	private clearCountdownSubscription(): void {
		if (this.countdownSubscription) {
			this.countdownSubscription.unsubscribe();
			this.countdownSubscription = undefined;
		}
	}
}
