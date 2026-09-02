import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import { IdentityStateService } from '@revlib/core';
import { BusinessSocialLinksDto, DayOfWeek, Result } from '@revlib/models';
import { ApplicationActions, AppState } from '@revlib/store';
import { businessPhonePatternValidator, getFirstErrorMessage, socialLinkValidator } from '@revlib/utils';
import { AUTH_QUERY_PARAMS } from '../../../../../../revly-lib/src/lib/models/params/auth.query-params';
import { LocationFormComponent } from '../../../core/shared/location-form/location-form.component';
import { OpeningHoursFormComponent } from '../../../core/shared/opening-hours-form/opening-hours-form.component';
import { BusinessCategory } from '../../../models/biz-category.model';
import { BusinessClaimRequest } from '../../../models/biz-claim-request.model';
import { BusinessClaimResponse } from '../../../models/biz-claim-response.model';
import { BusinessCategoryService } from '../../../services/business-category.service';
import { BusinessClaimService } from '../../../services/business-claim.service';
import { BusinessClaimSuccessComponent } from '../business-claim-success/business-claim-success.component';
import { SocialLinksFormComponent } from '../socail-media-links/social-links-form.component';

@Component({
	selector: 'app-business-claim-stepper',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatStepperModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		OpeningHoursFormComponent,
		LocationFormComponent,
		BusinessClaimSuccessComponent,
		SocialLinksFormComponent,
		BackendResultComponent
	],
	templateUrl: './business-claim-stepper.component.html',
	styles: [
		`
			::ng-deep .mat-horizontal-stepper-header-container {
				margin-bottom: 24px;
			}
			.leaflet-control-attribution a {
				display: none !important;
			}
		`
	]
})
export class BusinessClaimStepperComponent extends BaseComponent implements OnInit, OnDestroy {
	readonly #fb = inject(FormBuilder);
	readonly #claimService = inject(BusinessClaimService);
	readonly #categoryService = inject(BusinessCategoryService);
	readonly #store = inject(Store<AppState>);
	readonly #router = inject(Router);
	readonly #identityState = inject(IdentityStateService);

	// Signals from IdentityStateService
	readonly isAuthenticated = this.#identityState.isAuthenticated;
	readonly isVerified = this.#identityState.isVerified;
	readonly user = this.#identityState.user;

	readonly days: DayOfWeek[] = Object.values(DayOfWeek).filter(
		(value) => typeof value === 'number'
	) as DayOfWeek[];

	readonly idEnc = signal<string>('');

	categories = signal<BusinessCategory[]>([]);

	// compute selectedCategory from categories signal and categoryValue()
	readonly selectedCategory = computed(
		() => this.categories().find((c) => c.value === this.categoryValue()) ?? null
	);
	constructor() {
		super();
	}

	ngOnInit(): void {
		this.loadCategories();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	// --- Step 1: Basic Info ---
	basicInfoForm = this.#fb.group({
		displayName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
		phoneNumber: ['', [Validators.required, businessPhonePatternValidator]],
		categoryValue: [null, Validators.required],
		subCategoriesValues: [[], Validators.required],
		description: ['', Validators.required]
	});
	categoryValue = toSignal(this.basicInfoForm.get('categoryValue')!.valueChanges, {
		initialValue: this.basicInfoForm.get('categoryValue')!.value
	});

	// --- Step 2: Social Links ---
	private atLeastOneSocialLinkValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		// If you need FormGroup-specific API, cast locally (safe because this validator will be attached to a FormGroup)
		const group = control as FormGroup;
		const hasOne = Object.values(group.controls).some(
			(c) => !c.disabled && typeof c.value === 'string' && c.value.trim().length > 0
		);

		return hasOne ? null : { atLeastOneRequired: true };
	};

	socialLinksForm = this.#fb.group(
		{
			googleMaps: ['', [socialLinkValidator(false)]],
			facebook: ['', [socialLinkValidator(false)]],
			instagram: ['', [socialLinkValidator(false)]],
			website: ['', [socialLinkValidator(false)]]
		},
		{ validators: this.atLeastOneSocialLinkValidator }
	); // Optionnel : on peut le garder ici ou le laisser dans le composant enfant

	// --- Step 3: Opening Hours ---
	openingHoursForm: FormGroup = this.#fb.group({
		hours: this.#fb.array([])
	});

	// --- Step 4: Location ---
	locationForm = this.#fb.group({
		latitude: [null, [Validators.required]],
		longitude: [null, [Validators.required]],
		stateCode: [null],
		municipalityCode: [null],
		fullAddress: ['', Validators.required]
	});

	loadCategories() {
		const catObs$ = this.#categoryService.loadCategories().subscribe({
			next: (res) => {
				if (res.isSucceeded && res.value) {
					this.categories.set(res.value);
				}
			},
			error: (err) => {
				const msg = getFirstErrorMessage(err) || 'Erreur, veuillez réessayer.';
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: msg || 'Une erreur est survenue. Veuillez réessayer plus tard.'
					})
				);
			}
		});
		this.subscriptions.add(catObs$);
	}

	isValid() {
		return (
			this.basicInfoForm.valid &&
			this.socialLinksForm.valid &&
			this.locationForm.valid &&
			this.openingHoursForm.valid
		);
	}

	submit() {
		if (!this.isValid()) return;

		this.isLoading.set(true);
		this.errorResult.set(null);

		const location = {
			latitude: this.locationForm.value.latitude!,
			longitude: this.locationForm.value.longitude!,
			// actualy we set nulls handled in the backend
			stateCode: 0,
			municipalityCode: 0
		};

		const payload: BusinessClaimRequest = {
			displayName: this.basicInfoForm.value.displayName!,
			phoneNumber: this.basicInfoForm.value.phoneNumber!,
			categoryValue: this.basicInfoForm.value.categoryValue!,
			subCategoriesValues: this.basicInfoForm.value.subCategoriesValues ?? [],
			// get the full address from the location form
			fullAddress: this.locationForm.value.fullAddress!,
			description: this.basicInfoForm.value.description || undefined,
			socialLinks: this.socialLinksForm.value as BusinessSocialLinksDto,
			location,
			openingHours: this.openingHoursForm.value.hours
		};

		const claimObs$ = this.#claimService.addNewBusinessClaim(payload).subscribe({
			next: (res) => {
				if (res.isSucceeded && res.value) {
					this.successMessage.set(res.success?.message || '');
					this.idEnc.set(res.value.idEnc);
				}
			},
			error: (errorResult: Result<BusinessClaimResponse>) => {
				if (errorResult?.errors?.length === 1) {
					const msg =
						getFirstErrorMessage(errorResult) ||
						'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: msg
						})
					);
				} else {
					//f only one error display snackbar, if mutlple dispatch erroresult signal
					this.errorResult.set(errorResult);
				}
				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});
		this.subscriptions.add(claimObs$);
	}

	goToLogin() {
		this.#router.navigate(['/auth/login'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.#router.url }
		});
	}

	goToPhoneVerify() {
		this.#router.navigate(['/auth/phone-verify'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.#router.url }
		});
	}
}
