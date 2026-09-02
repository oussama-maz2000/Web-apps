import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { AUTH_ERROR_TYPES } from '../../../core/internal/error/error-codes';
import { AUTH_PATHS } from '../../../core/routes/auth.routes';
import { AuthEmailFacade } from '../../../facades/auth/auth-email-facade.service';
import { Result } from '../../../models/common/result';
import { EmailConfirmChangeQueryParams } from '../../../models/params/email-confirm-change.types';
import { UserDto } from '../../../models/responses/userDto.model';
import { IdentityStateService } from '../../../state/identity-state.service';
import { createErrorResult, getFirstErrorCode, getFirstErrorMessage } from '../../../utils/result-utils';
import { BaseComponent } from '../../base.component';

@Component({
	selector: 'app-email-confirm-change',
	templateUrl: './email-confirm-change.component.html',
	styleUrls: ['./email-confirm-change.component.scss'],
	standalone: true,
	imports: [MatButtonModule, RouterLink, MatProgressSpinnerModule]
})
export class EmailConfirmChangeComponent extends BaseComponent implements OnInit, OnDestroy {
	//#region Inputs
	readonly OldEmail = input.required<EmailConfirmChangeQueryParams['OldEmail']>();
	readonly NewEmail = input.required<EmailConfirmChangeQueryParams['NewEmail']>();
	readonly Token = input.required<EmailConfirmChangeQueryParams['Token']>();
	//#endregion
	readonly LOGIN_PATH = '/' + AUTH_PATHS.LOGIN;
	//#region Properties
	protected readonly isConfirming = signal<boolean>(false);
	//#region DI
	private readonly authEmailFacade = inject(AuthEmailFacade);
	private readonly identityStateService = inject(IdentityStateService);
	//#endregion
	private readonly router = inject(Router);
	readonly #store = inject(Store<AppState>);
	//#endregion

	// #region Lifecycle Hooks
	ngOnInit(): void {
		this.confirmEmailChange();
	}

	ngOnDestroy(): void {
		this.subscriptions?.unsubscribe();
	}
	//#endregion

	private confirmEmailChange(): void {
		this.isLoading.set(true);
		this.isConfirming.set(true);

		const oldEmail = this.OldEmail();
		const newEmail = this.NewEmail();
		const token = this.Token();

		const confirmChangeEmailSub = this.authEmailFacade
			.confirmChangeEmail$(oldEmail, newEmail, token)
			.subscribe({
				next: () => {
					// If user is logged in, update their profile
					if (this.identityStateService.isAuthenticated()) {
						const updatedPartialUser: Partial<UserDto> = { email: newEmail };
						this.identityStateService.updateUserProfile(updatedPartialUser);
					}

					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: "Changement d'email confirmé avec succès !"
						})
					);
					this.router.navigate(['/']);
				},
				error: (error: Result) => {
					let errorMessage: string | undefined;
					const errorCode = getFirstErrorCode(error);

					if (errorCode === AUTH_ERROR_TYPES.INVALID_OP) {
						errorMessage = "Échec de la confirmation du changement d'email";
						this.errorResult.set(createErrorResult(errorMessage));
					} else {
						errorMessage = getFirstErrorMessage(error);
					}

					if (errorMessage) this.errorResult.set(createErrorResult(errorMessage));
					this.isLoading.set(false);
				},
				complete: () => {
					this.isLoading.set(false);
				}
			});

		this.subscriptions?.add(confirmChangeEmailSub);
	}
}
