import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import { BizFoodUpdateReqDto } from '@revlib/models';
import { BizFoodService } from '@revlib/services';
import { ApplicationActions, AppState } from '@revlib/store';
import { getFirstErrorMessage } from '@revlib/utils';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

@Component({
	selector: 'app-update-biz-food',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		BackendResultComponent
	],
	templateUrl: './update-biz-food.component.html'
})
export class UpdateBizFoodComponent extends BaseComponent implements OnInit {
	readonly #fb = inject(FormBuilder);
	readonly #bizFoodService = inject(BizFoodService);
	readonly #store = inject(Store<AppState>);
	readonly destroy$ = inject(DestroyRef);
	readonly #location = inject(Location);

	bizFoodForm = this.#fb.group({
		businessId: [''],
		// idEnc: ['', Validators.required],
		acceptsCardPayment: [false],
		acceptsDelivery: [false],
		acceptsReservations: [false],
		// cuisineTagsJson: [''],
		deliveryRadiusKm: [null as number | null],
		hasFamilyRoom: [false],
		hasWifiGuests: [false],
		isBanquetOrganizer: [false],
		isBirthdayOrganizer: [false],
		// menu: [''],
		seatingCapacity: [null as number | null]
	});

	ngOnInit(): void {
		const state = history.state as { bizFoodData: BizFoodUpdateReqDto };
		if (state?.bizFoodData) {
			this.patchForm(state.bizFoodData);
		}
	}

	patchForm(data: BizFoodUpdateReqDto): void {
		this.bizFoodForm.patchValue({
			businessId: data.businessId,
			// idEnc: data.idEnc,
			acceptsCardPayment: data.acceptsCardPayment,
			acceptsDelivery: data.acceptsDelivery,
			acceptsReservations: data.acceptsReservations,
			// cuisineTagsJson: data.cuisineTagsJson,
			deliveryRadiusKm: data.DeliveryRadiusKm,
			hasFamilyRoom: data.hasFamilyRoom,
			hasWifiGuests: data.hasWifiGuests,
			isBanquetOrganizer: data.isBanquetOrganizer,
			isBirthdayOrganizer: data.isBirthdayOrganizer,
			// menu: data.menu,
			seatingCapacity: data.seatingCapacity
		});
	}

	onSubmit(): void {
		if (this.bizFoodForm.invalid) {
			this.bizFoodForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		this.errorResult.set(null);

		const payload = this.bizFoodForm.value as BizFoodUpdateReqDto;

		this.#bizFoodService
			.updateBizFood(payload)
			.pipe(
				tap((res) => {
					if (res.isSucceeded) {
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: 'Les informations ont été mises à jour avec succès'
							})
						);
						this.onCancel();
					}
				}),
				catchError((err) => {
					this.errorResult.set(err);
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message:
								getFirstErrorMessage(err) ||
								'Une erreur est survenue lors de la mise à jour des informations.'
						})
					);
					return EMPTY;
				}),
				takeUntilDestroyed(this.destroy$),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	onCancel(): void {
		this.#location.back();
	}
}
