import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	inject,
	NgZone,
	OnDestroy,
	OnInit,
	signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import { ApplicationActions, AppState } from '@revlib/store';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { BaseComponent } from '../../../../exports/public-components';
import { GOOGLE_CONFIG } from '../../../core/api/api-config';
import { SignUpFacade } from '../../../facades/auth/signup-facade.service';
import { LocationFacade } from '../../../facades/location/location-facade.service';
import { Result } from '../../../models/common/result';
import { AUTH_QUERY_PARAMS } from '../../../models/params/auth.query-params';
import { GoogleAuthCompeleteSignUpReqDto, SignupReqDto } from '../../../models/requests/auth.models';
import { isAccountRecoveryDto, isAuthExtDto } from '../../../models/responses/auth-type-guards';
import { AccountRecoveryResDto, AuthExtResDto, SignupLoginResDto } from '../../../models/responses/auth.models';
import { Genders, Languages } from '../../../models/types/common.types';
import { LocationCoordinates } from '../../../models/types/location.types';
import { SnackbarService } from '../../../services/Wrappers/snack-bar.service';
import { emailPatternValidator, nameValidator, passwordValidators } from '../../../utils/validators';
import {
	DialogConfirmAccountRecoveryComponent,
	DialogConfirmAccountRecoveryData
} from '../login/dialog-confirm-account-recovery';

@Component({
	selector: 'app-revlib-signup',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		...COMMON_IMPORTS,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		MatSelectModule,
		MatCheckboxModule,
		MatRadioModule,
		MatTooltipModule,
		MatProgressSpinnerModule,
		BackendResultComponent,
		PasswordFieldComponent
	],
	templateUrl: './signup.component.html',
	styleUrl: './signup.component.scss'
})
export class SignupComponent extends BaseComponent implements OnDestroy, AfterViewInit, OnInit {
	//#region Dependency injection
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);
	private readonly ngZone = inject(NgZone);
	private readonly dialog = inject(MatDialog);
	private readonly activatedRoute = inject(ActivatedRoute);
	readonly #snackbarService = inject(SnackbarService);
	readonly #store = inject(Store<AppState>);
	// Facades
	readonly signupFacade = inject(SignUpFacade);
	readonly locationFacade = inject(LocationFacade);
	//#endregion

	//#region Properties
	// Form controls
	signupForm!: FormGroup;
	googleSignupForm!: FormGroup;

	// UI state management
	isGoogleSignup = signal<boolean>(false);
	isGoogleButonShaking = signal(false);

	//types & constants
	readonly genders = Genders;
	readonly languages = Languages;

	// Location coordinates
	private coordinates = signal<LocationCoordinates | null>(null);
	private returnUrl: string | null = null;

	//#endregion

	//#region Getters
	get emailControl() {
		return this.signupForm.get('email');
	}
	get passwordControl() {
		return this.signupForm.get('password');
	}
	get stateControl() {
		return this.currentForm.get('state');
	}
	get municipalityControl() {
		return this.currentForm.get('municipality');
	}
	get preferredLanguageControl() {
		return this.currentForm.get('preferredLanguage');
	}
	get nameControl() {
		return this.currentForm.get('name');
	}
	get genderControl() {
		return this.currentForm.get('gender');
	}
	get acceptTermsControl() {
		return this.currentForm.get('acceptTerms');
	}
	get currentForm(): FormGroup {
		// Returns current form based on state
		return this.isGoogleSignup() ? this.googleSignupForm : this.signupForm;
	}
	//#endregion

	//#region validators
	private readonly VALIDATORS = {
		EMAIL: [Validators.required, Validators.email, emailPatternValidator],
		PASSWORD: passwordValidators,
		NAME: [Validators.required, Validators.minLength(5), Validators.maxLength(60), nameValidator]
	};
	//#endregion

	//#region Lifecycle
	constructor() {
		super();
		this.initForms();
		this.checkForPendingGoogleSignup();
		// Bind Google callback to window
		window.handleGoogleSignupResponse = this.handleGoogleResponse.bind(this);
	}

	ngOnInit(): void {
		this.returnUrl = this.activatedRoute.snapshot.queryParams[AUTH_QUERY_PARAMS.RETURN_URL] || null;
		this.loadLocationData();
	}

	ngAfterViewInit(): void {
		this.loadGoogleScript().then(() => {
			// Only render the Google button if not in Google signup flow
			if (!this.isGoogleSignup() && window.google && window.google.accounts && window.google.accounts.id) {
				window.google.accounts.id.initialize({
					client_id: GOOGLE_CONFIG.clientId,
					callback: this.handleGoogleResponse.bind(this),
					auto_prompt: true
				});
				window.google.accounts.id.renderButton(document.getElementById('google-signup-button'), {
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

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		if (window.handleGoogleSignupResponse === this.handleGoogleResponse)
			// Remove global window reference
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			delete (window as any).handleGoogleSignupResponse; // Clean up window object
	}
	//#endregion

	//#region Initialization
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

	private initForms(): void {
		// Regular signup form
		this.signupForm = this.fb.group({
			email: ['', [...this.VALIDATORS.EMAIL]],
			password: ['', [...this.VALIDATORS.PASSWORD]],
			name: ['', [...this.VALIDATORS.NAME]],
			state: [null, Validators.required],
			municipality: [null, Validators.required],
			preferredLanguage: [{ value: this.languages[2].value, disabled: true }, Validators.required],
			gender: ['', Validators.required],
			acceptTerms: [false, Validators.requiredTrue]
		});

		// Google signup form (when user is new)
		const googleUserName = this.signupFacade.sessionGetGoogleUserName();
		this.googleSignupForm = this.fb.group({
			name: [googleUserName ?? '', [...this.VALIDATORS.NAME]],
			state: [null, Validators.required],
			municipality: [null, Validators.required],
			preferredLanguage: [{ value: this.languages[2].value, disabled: true }, Validators.required],
			gender: ['', Validators.required],
			acceptTerms: [false, Validators.requiredTrue]
		});
	}

	private checkForPendingGoogleSignup(): void {
		const googleToken = this.signupFacade.sessionGetGoogleToken();
		if (googleToken) this.isGoogleSignup.set(true);
	}

	/**
	 * Loads location data (wilayas/states) from backend
	 */
	loadLocationData(): void {
		if (this.locationFacade.wilayasLoading()) return;
		const locationSub = this.locationFacade.loadWilayas().subscribe();
		this.subscriptions.add(locationSub);
	}
	//#endregion

	//#region events
	onEmailBlur(): void {
		if (this.emailControl?.valid && this.emailControl?.value.includes('@gmail.com')) {
			this.isGoogleButonShaking.set(false); // reset
			// Re-trigger on next microtask (ensures CSS animation restarts)
			queueMicrotask(() => this.isGoogleButonShaking.set(true));
		}
	}

	onAnimationEnd(): void {
		this.isGoogleButonShaking.set(false); // clean up
	}

	/**
	 * Handles wilaya/state selection and loads its municipalities
	 */
	onWilayaChange(wilayaCode: number, municipalityCode?: number): void {
		if (!wilayaCode) return;

		const wilaya = this.locationFacade.wilayas()?.find((w) => w.code === wilayaCode);
		if (wilaya) {
			this.locationFacade.selectWilaya(wilaya);
			this.municipalityControl?.updateValueAndValidity();
			const municipalitiesSub = this.locationFacade.loadMunicipalities(wilayaCode).subscribe();
			this.subscriptions.add(municipalitiesSub);

			if (municipalityCode) this.municipalityControl?.setValue(municipalityCode);
		}
	}

	/**
	 * Gets user's current location and updates the form
	 */
	detectLocation(): void {
		if (!navigator.geolocation) {
			this.#snackbarService.warning("La géolocalisation n'est pas supportée par votre navigateur", {
				duration: 3000
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const coords: LocationCoordinates = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				};

				this.coordinates.set(coords);

				// Use the location facade to detect location based on coordinates
				// Backend handles that automatically if state/municipality=0 and fallback resolution from coordinate but this is for ui
				const locationSub = this.locationFacade.detectLocationByCoordinates(coords).subscribe({
					complete: () => {
						const location = this.locationFacade.currentLocation();
						if (location) {
							// Update form with detected location
							this.stateControl?.setValue(location.stateCode);

							// Trigger wilaya change to load municipalities
							this.onWilayaChange(location.stateCode, location.municipalityCode);
						}
					},
					error: () => {
						this.#store.dispatch(
							ApplicationActions.showErrorSnackbar({
								message:
									'Échec de la détection de votre emplacement. Veuillez sélectionner manuellement.'
							})
						);
					}
				});

				this.subscriptions.add(locationSub);
			},
			() => {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: 'Échec de la détection de votre emplacement. Veuillez sélectionner manuellement.'
					})
				);
			}
		);
	}
	//#endregion

	//#region Form Submission
	onSubmit(): void {
		if (this.currentForm.invalid || this.isLoading()) return;

		this.errorResult.set(null);
		this.successMessage.set(null);
		this.isLoading.set(true);
		let authObs$: Observable<Result<SignupLoginResDto | AccountRecoveryResDto | AuthExtResDto> | null>;

		if (this.isGoogleSignup()) authObs$ = this.handleGoogleSignupCompletion$();
		else authObs$ = this.handleRegister$();

		const authSub = authObs$.subscribe({
			next: (result) => {
				this.isLoading.set(true);
				if (result) {
					if (this.isGoogleSignup()) {
						this.signupFacade.sessionRemoveGoogleData();

						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: result?.success?.message || 'Compte créé avec succès !'
							})
						);
						// Redirect to login after successful signup
						this.goToLogin();
					} else {
						this.successMessage.set(
							result?.success?.message ||
								'Compte créé avec succès ! Nous vous avons envoyé un e-mail de vérification.'
						);
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message:
									result?.success?.message ||
									'Compte créé avec succès ! Nous vous avons envoyé un e-mail de vérification.'
							})
						);
					}
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

	private handleRegister$(): Observable<Result<SignupLoginResDto> | null> {
		const formValues = this.signupForm.value;
		const coords = this.coordinates() || { latitude: 0, longitude: 0 };

		const signupData: SignupReqDto = {
			email: formValues.email,
			password: formValues.password,
			name: formValues.name,
			location: {
				stateCode: formValues.state,
				municipalityCode: formValues.municipality,
				latitude: coords.latitude,
				longitude: coords.longitude
			},
			preferredLanguage: formValues.preferredLanguage,
			gender: formValues.gender
		};

		return this.signupFacade.signUp$(signupData);
	}

	private handleGoogleSignupCompletion$(): Observable<Result<
		SignupLoginResDto | AccountRecoveryResDto | AuthExtResDto
	> | null> {
		// Get stored token from session storage
		const googleToken = this.signupFacade.sessionGetGoogleToken();
		if (!googleToken) {
			return of(null); // No token available
		}

		const formValues = this.googleSignupForm.value;
		const coords = this.coordinates() || { latitude: 0, longitude: 0 };

		const completeSignupData: GoogleAuthCompeleteSignUpReqDto = {
			idToken: googleToken,
			name: formValues.name,
			location: {
				stateCode: formValues.state,
				municipalityCode: formValues.municipality,
				latitude: coords.latitude,
				longitude: coords.longitude
			},
			gender: formValues.gender,
			preferredLanguage: formValues.preferredLanguage
		};

		return this.signupFacade.googleSignUp$(completeSignupData);
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

			const googleAuthSub = this.signupFacade
				.googleAuth$({ idToken: response.credential })
				.pipe(switchMap((result) => this.handlePossibleRecovery$(result)))
				.subscribe({
					next: (result) => {
						if (!result) return;

						// Check if this is a new user needing to complete registration
						if (result.value && isAuthExtDto(result.value)) {
							const authExtDtoResult = result.value;
							// Store token temporarily, we need it for registration completion
							this.signupFacade.sessionStoreGoogleData(
								response.credential,
								authExtDtoResult.nameFromExtProvider
							);
							this.googleSignupForm.get('name')?.setValue(authExtDtoResult.nameFromExtProvider);
							// Switch to Google signup form
							this.isGoogleSignup.set(true);
						} else {
							// This is returning user, redirect to login page
							this.goToLogin();
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
				const dialogRef = this.dialog.open(DialogConfirmAccountRecoveryComponent, {
					data: {
						recovery: recoveryData,
						message: result.success?.message
					} as DialogConfirmAccountRecoveryData,
					disableClose: true
				});

				return dialogRef.afterClosed().pipe(
					switchMap((dialogResult) => {
						if (dialogResult === 'true')
							return this.signupFacade.recoverDeletedAccount$(recoveryData.recoveryUrl);

						// Return null if recovery declined to avoid navigation to home
						return of(null);
					})
				);
			}
		}

		// No recovery needed, just return the original result
		return of(result);
	}
	//#endregion

	// Navigate to login page
	goToLogin(): void {
		const queryParams = this.returnUrl ? { [AUTH_QUERY_PARAMS.RETURN_URL]: this.returnUrl } : {};
		this.router.navigate(['/auth/login'], { queryParams });
	}
}

// Add Google callback type to window
declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		google: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		handleGoogleSignupResponse: (response: any) => void;
	}
}
