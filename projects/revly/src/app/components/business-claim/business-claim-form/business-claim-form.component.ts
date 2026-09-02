import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import { ApplicationActions, AppState } from '@revlib/store';
import { businessPhonePatternValidator, getFirstErrorMessage, socialLinkValidator } from '@revlib/utils';
import { BusinessCategory } from '../../../models/biz-category.model';
import { BusinessClaimRequest } from '../../../models/biz-claim-request.model';
import { BusinessCategoryService } from '../../../services/business-category.service';
import { BusinessClaimService } from '../../../services/business-claim.service';

@Component({
	selector: 'app-business-claim-form',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		BackendResultComponent
	],
	templateUrl: './business-claim-form.component.html'
})
export class BusinessClaimFormComponent extends BaseComponent implements OnInit, OnDestroy {
	readonly #fb = inject(FormBuilder);
	readonly #claimService = inject(BusinessClaimService);
	readonly #categoryService = inject(BusinessCategoryService);
	readonly #store = inject(Store<AppState>);
	private destroy = inject(DestroyRef);

	// Signals
	categories = signal<BusinessCategory[]>([]);
	selectedCategory = computed(
		() => this.categories().find((c) => c.value === this.form.value.categoryId!) ?? null
	);

	instructionNote = signal('');

	ngOnInit(): void {
		this.loadCategories();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	form = this.#fb.group({
		googleMapsLink: ['', [Validators.maxLength(150), socialLinkValidator(true)]],
		facebookLink: ['', [Validators.maxLength(150), socialLinkValidator(false)]],
		businessName: ['', [Validators.required, Validators.maxLength(150)]],
		businessPhone: ['', [Validators.required, businessPhonePatternValidator]],
		categoryId: [null],
		subCategoryId: [null],
		description: ['', Validators.maxLength(4000)]
	});

	constructor() {
		super();
		this.loadCategories();
	}

	loadCategories() {
		this.#categoryService
			.loadCategories()
			.pipe(takeUntilDestroyed(this.destroy))
			.subscribe({
				next: (res) => {
					if (res.isSucceeded && res.value) {
						this.categories.set(res.value);
					}
				},
				error: (err) => {
					const msg =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: msg
						})
					);
				}
			});
	}

	submit(isNewBusiness = true) {
		if (this.form.invalid) return;
		this.isLoading.set(true);
		const payload = this.form.value;

		let claimRequestObs$;
		if (isNewBusiness) {
			claimRequestObs$ = this.#claimService.addNewBusinessClaim(payload as BusinessClaimRequest).subscribe({
				next: (res) => {
					this.isLoading.set(false);
					if (res.isSucceeded && res.value) {
						this.successMessage.set(`
              Votre demande de revendication de commerce a bien été soumise pour examen.
              Pour finaliser la vérification, veuillez copier-coller le lien ci-dessous dans la section « bio », « À propos » d'un de vos comptes/pages officiels (Facebook, Instagram, etc.).
              ${window.location.origin}/business/${res.value}
              Vous pouvez le supprimer après validation.`);
					}
				},
				error: (err) => {
					this.isLoading.set(false);
					this.errorResult.set(err);
					const msg =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: msg
						})
					);
				}
			});
		} else {
			claimRequestObs$ = this.#claimService.addExistingClaim(payload as BusinessClaimRequest).subscribe({
				next: (res) => {
					this.isLoading.set(false);
					if (res.isSucceeded && res.value) {
						this.successMessage.set(`
              Votre demande de revendication de commerce a bien été soumise pour examen.
              Pour finaliser la vérification, veuillez copier-coller le lien ci-dessous dans la section « bio », « À propos » d'un de vos comptes/pages officiels (Facebook, Instagram, etc.).
              ${window.location.origin}/business/${res.value}
              Vous pouvez le supprimer après validation.`);
					}
				},
				error: (err) => {
					this.isLoading.set(false);
					this.errorResult.set(err);
					const msg =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: msg
						})
					);
				}
			});
		}

		this.subscriptions.add(claimRequestObs$);
	}
}
