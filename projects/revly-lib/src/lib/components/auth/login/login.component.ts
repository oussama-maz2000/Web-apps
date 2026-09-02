import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	inject,
	NgZone,
	OnDestroy,
	PLATFORM_ID
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
//
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';
//
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
//
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { AUTH_PATHS, GOOGLE_CONFIG } from '../../../../public-api';
import { BaseComponent } from '../../../components/base.component';
import { AUTH_ERROR_TYPES } from '../../../core/internal/error/error-codes';
import { LoginFacade } from '../../../facades/auth/login-facade.service';
import { ErrorSuccessResponse, Result } from '../../../models/common/result';
import { AUTH_QUERY_PARAMS } from '../../../models/params/auth.query-params';
import { EmailVerifyQueryParams } from '../../../models/params/email-verify.types';
import { isAccountRecoveryDto, isAuthExtDto } from '../../../models/responses/auth-type-guards';
import { AccountRecoveryResDto, AuthExtResDto, SignupLoginResDto } from '../../../models/responses/auth.models';
import { emailPatternValidator, passwordValidators } from '../../../utils/validators';
import { BackendResultComponent } from '../../shared/backend-result.component';
import type { DialogConfirmAccountRecoveryData } from './dialog-confirm-account-recovery';
import { DialogConfirmAccountRecoveryComponent } from './dialog-confirm-account-recovery';

// Google auth window extension
declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		google: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		handleGoogleResponse: (response: any) => void;
	}
}

@Component({
	selector: 'app-revlib-login',
	imports: [
		...COMMON_IMPORTS,
		ReactiveFormsModule,
		MatFormFieldModule,
		RouterLink,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		BackendResultComponent,
		PasswordFieldComponent
	],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements AfterViewInit, OnDestroy {
	//#region Dependency injection
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);
	private readonly ngZone = inject(NgZone);
	private readonly dialog = inject(MatDialog);
	private readonly activatedRoute = inject(ActivatedRoute);
	readonly #store = inject(Store<AppState>);
	private platformId = inject(PLATFORM_ID);

	// Facades
	readonly loginFacade = inject(LoginFacade);
	//#endregion

	//#region Properties
	private dialogRef: MatDialogRef<DialogConfirmAccountRecoveryComponent> | null = null;
	// Form controls
	loginForm!: FormGroup;

	//#endregion

	//#region Getters
	get emailControl() {
		return this.loginForm.get('email');
	}
	get passwordControl() {
		return this.loginForm.get('password');
	}
	get forgotPasswordLink() {
		return '/' + AUTH_PATHS.FORGOT_PASSWORD;
	}
	//#endregion

	//#region validators
	private readonly VALIDATORS = {
		EMAIL: [Validators.required, Validators.email, emailPatternValidator],
		PASSWORD: passwordValidators
	};
	//#endregion

	//#region ctor & life cycle hooks
	constructor() {
		super();
		// Initialize login form
		this.initForm();

		if (isPlatformBrowser(this.platformId)) {
			// Bind Google callback to window
			window.handleGoogleResponse = this.handleGoogleResponse.bind(this);
		}
	}

	ngAfterViewInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			this.loadGoogleScript().then(() => {
				// Explicitly render the Google button after script loads
				if (window.google && window.google.accounts && window.google.accounts.id) {
					window.google.accounts.id.initialize({
						client_id: GOOGLE_CONFIG.clientId,
						callback: this.handleGoogleResponse.bind(this),
						auto_prompt: true
					});
					window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
						type: 'standard',
						size: 'large',
						theme: 'filled_blue',
						shape: 'pill',
						text: 'continue_with',
						logo_alignment: 'left'
					});
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		// Remove global window reference
		if (isPlatformBrowser(this.platformId)) {
			if (window.handleGoogleResponse === this.handleGoogleResponse)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				delete (window as any).handleGoogleResponse;
		}

		this.dialogRef?.close();
	}
	//#endregion

	//#region Initialization methods
	private loadGoogleScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (window.google && window.google.accounts) {
				resolve(); // Google API already loaded
				return;
			}

			const existingScript = document.getElementById('google-client-script');
			if (existingScript) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.id = 'google-client-script';
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject('Failed to load Google script');
			document.head.appendChild(script);
		});
	}

	private initForm(): void {
		// Login form
		this.loginForm = this.fb.group({
			email: ['', [...this.VALIDATORS.EMAIL]],
			password: ['', [...this.VALIDATORS.PASSWORD]]
		});
	}
	//#endregion

	//#region Form Submission
	onSubmit(): void {
		if (this.loginForm.invalid || this.isLoading()) return;

		this.errorResult.set(null);
		this.successMessage.set(null);
		this.isLoading.set(true);

		const authSub = this.handleLogin$().subscribe({
			next: (result) => {
				if (result) {
					this.successMessage.set(result?.success?.message as string);

					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: this.successMessage() as string
						})
					);
					this.redirectAfterLogin();
				}
			},
			error: (result) => {
				const firstError = result.errors?.[0] as ErrorSuccessResponse;
				if (firstError?.errorCode?.code === AUTH_ERROR_TYPES.EMAIL_NOT_VERIFIED) {
					const queryParams: EmailVerifyQueryParams = {
						Email: this.loginForm.value.email,
						ResendState: 'true'
					};

					this.router.navigate([AUTH_PATHS.EMAIL_CONFIRM], { queryParams });
				}

				this.errorResult.set(result);
				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});

		this.subscriptions.add(authSub);
	}

	// Google callback handler
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleGoogleResponse(response: any): void {
		// Run inside Angular zone
		this.ngZone.run(() => {
			if (!response?.credential) {
				this.errorResult.set({
					isSucceeded: false,
					errors: [{ message: 'Invalid Google response' }]
				} as Result);
				return;
			}
			this.errorResult.set(null);

			const googleAuthSub = this.loginFacade
				.googleAuth$({ idToken: response.credential })
				.pipe(
					tap(() => this.isLoading.set(true)),
					switchMap((result) => this.handlePossibleRecovery$(result))
				)
				.subscribe({
					next: (result) => {
						if (!result) return;

						// Check if this is a new user needing to complete registration
						if (result.value && isAuthExtDto(result.value)) {
							const authExtDtoResult = result.value;

							// Store token temporarily, we need it for registration completion
							this.loginFacade.sessionStoreGoogleData(
								response.credential,
								authExtDtoResult.nameFromExtProvider
							);

							// Redirect to signup page for completion
							this.goToSignup();
						} else {
							// Save login response and handle successful login
							this.successMessage.set(result?.success?.message as string);

							this.#store.dispatch(
								ApplicationActions.showSuccessSnackbar({
									message: result?.success?.message || 'Compte créé avec succès ! '
								})
							);

							this.redirectAfterLogin();
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

			this.subscriptions.add(googleAuthSub);
		});
	}

	//AuthExtResDto  just to satisfy compiler won't returned here
	private handleLogin$(): Observable<Result<SignupLoginResDto | AccountRecoveryResDto | AuthExtResDto> | null> {
		const { email, password } = this.loginForm.value;
		return this.loginFacade
			.login$(email, password)
			.pipe(switchMap((result) => this.handlePossibleRecovery$(result)));
	}
	//#endregion

	/**
	 * Handles a possible account recovery scenario
	 * This method maintains the Observable chain without creating subscriptions
	 */
	private handlePossibleRecovery$(
		result: Result<SignupLoginResDto | AccountRecoveryResDto | AuthExtResDto> | null
	): Observable<Result<SignupLoginResDto | AccountRecoveryResDto | AuthExtResDto> | null> {
		// If result is null, just return it as an observable
		if (!result) return of(null);

		// Check if the result contains recovery data
		if (result.value && isAccountRecoveryDto(result.value)) {
			const recoveryData = result.value as AccountRecoveryResDto;
			if (recoveryData?.recoveryUrl && recoveryData?.expiresAt) {
				// Open dialog and continue the Observable chain
				this.dialogRef = this.dialog.open(DialogConfirmAccountRecoveryComponent, {
					data: {
						recovery: recoveryData,
						message: result.success?.message
					} as DialogConfirmAccountRecoveryData,
					disableClose: true
				});

				return this.dialogRef.afterClosed().pipe(
					switchMap((dialogResult) => {
						if (dialogResult === 'true')
							return this.loginFacade.recoverDeletedAccount$(recoveryData.recoveryUrl);

						// Return null if recovery declined to avoid navigation to home
						return of(null);
					})
				);
			}
		}
		// No recovery needed, just return the original result
		return of(result);
	}

	// Navigate to signup page
	goToSignup(): void {
		const returnUrl = this.activatedRoute.snapshot.queryParams[AUTH_QUERY_PARAMS.RETURN_URL] || null;
		const queryParams = returnUrl ? { [AUTH_QUERY_PARAMS.RETURN_URL]: returnUrl } : {};
		this.router.navigate([AUTH_PATHS.SIGNUP], { queryParams });
	}

	redirectAfterLogin(): void {
		const returnUrl = this.activatedRoute.snapshot.queryParams[AUTH_QUERY_PARAMS.RETURN_URL] || '/';
		this.router.navigate([returnUrl]);
	}
}
