import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { BackendResultComponent } from '@revlib/components/shared/backend-result.component';
import {
	BizPictures,
	BusinessOpeningHoursDto,
	BusinessSocialLinksDto,
	DayOfWeek,
	UpdateBizProfileDto
} from '@revlib/models';
import { ApplicationActions, AppState } from '@revlib/store';
import { getFirstErrorMessage, socialLinkValidator } from '@revlib/utils';
import { catchError, EMPTY, filter, finalize, tap } from 'rxjs';
import { BizProfileService } from '../../../../../../revly-lib/src/lib/services/profile/biz-profile.service';
import { OpeningHoursFormComponent } from '../../../core/shared/opening-hours-form/opening-hours-form.component';
import { timeRangeValidator } from '../../../core/shared/utils/validators';
import { BusinessCategory } from '../../../models/biz-category.model';
import { BusinessCategoryService } from '../../../services/business-category.service';
import { SocialLinksFormComponent } from '../../business-claim/socail-media-links/social-links-form.component';
import { BusinessPicturesComponent } from '../business-pictures/business-pictures.component';

@Component({
	selector: 'app-biz-update-profile',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatDividerModule,
		OpeningHoursFormComponent,
		SocialLinksFormComponent,
		BusinessPicturesComponent,
		MatTooltip,
		BackendResultComponent
	],
	templateUrl: './biz-update-profile.component.html'
})
export class BizUpdateProfileComponent extends BaseComponent implements OnInit {
	// Inject services
	readonly #fb = inject(FormBuilder);
	readonly #bizProfileService = inject(BizProfileService);
	readonly #categoryService = inject(BusinessCategoryService);

	readonly #location = inject(Location);
	readonly #store = inject(Store<AppState>);
	readonly #destroyRef = inject(DestroyRef);
	// Signals
	categories = signal<BusinessCategory[]>([]);
	pictures = signal<BizPictures[]>([]);
	// Constants
	readonly days: DayOfWeek[] = Object.values(DayOfWeek).filter(
		(value) => typeof value === 'number'
	) as DayOfWeek[];

	// Reactive Form
	profileForm = this.#fb.group({
		id: ['', Validators.required],
		idEnc: ['', Validators.required],
		displayName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
		description: ['', [Validators.maxLength(4000)]],
		fullAddress: ['', [Validators.required]],
		categoryValue: [{ value: null as number | null, disabled: true }, [Validators.required]],
		subCategoriesValues: [[] as number[], [Validators.required]],
		socialLinks: this.#fb.group({
			googleMaps: ['', [socialLinkValidator(false)]],
			facebook: ['', [socialLinkValidator(false)]],
			instagram: ['', [socialLinkValidator(false)]],
			website: ['', [socialLinkValidator(false)]]
		}),
		openingHours: this.#fb.group({
			hours: this.#fb.array([])
		})
	});

	// Getter for hours FormArray
	get hoursArray(): FormArray {
		return this.profileForm.get('openingHours.hours') as FormArray;
	}

	// Getter for selected category
	get selectedCategory(): BusinessCategory | null {
		const ctrl = this.profileForm.controls.categoryValue;
		const value = ctrl.value;
		return value == null ? null : (this.categories().find((c) => c.value === value) ?? null);
	}

	// Lifecycle hook
	ngOnInit(): void {
		this.loadCategories();
		const state = history.state as { pictures: BizPictures[] };
		if (state?.pictures) {
			this.pictures.set(state.pictures);
		}
	}

	loadCategories(): void {
		this.#categoryService
			.loadCategories()
			.pipe(
				takeUntilDestroyed(this.#destroyRef),
				filter((res) => !!res?.isSucceeded && !!res?.value),
				tap((res) => {
					this.categories.set(res.value!);
					const state = history.state as { profileData: UpdateBizProfileDto };
					if (state?.profileData) {
						this.patchForm(state.profileData);
					}
				}),
				catchError((err) => {
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
					return EMPTY;
				})
			)
			.subscribe();
	}

	private parseTime(timeStr: string): Date | null {
		if (!timeStr) return null;
		const [hours, minutes] = timeStr.split(':').map(Number);
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	}

	private formatTime(date: string | Date | null | undefined): string {
		if (!date) return '';
		if (typeof date === 'string') return date;
		if (date instanceof Date) {
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		}
		return '';
	}

	// Patch form with existing profile data
	patchForm(data: UpdateBizProfileDto): void {
		this.profileForm.patchValue({
			id: data.id,
			idEnc: data.idEnc,
			displayName: data.displayName,
			description: data.description,
			fullAddress: data.fullAddress,
			categoryValue: data.categoryValue,
			subCategoriesValues: data.subCategoriesValues,
			socialLinks: data.socialLinks
		});

		if (data.openingHours) {
			this.hoursArray.clear();
			data.openingHours.forEach((oh: BusinessOpeningHoursDto) => {
				this.hoursArray.push(
					this.#fb.group(
						{
							day: [oh.day, Validators.required],
							openingTime: [this.parseTime(oh.openingTime), Validators.required],
							closingTime: [this.parseTime(oh.closingTime), Validators.required]
						},
						{ validators: timeRangeValidator }
					)
				);
			});
		}
	}

	onCategoryChange(): void {
		this.profileForm.patchValue({ subCategoriesValues: [] }, { emitEvent: false });
	}

	// Handle form submission
	onSubmit(): void {
		if (this.profileForm.invalid) {
			this.profileForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		this.errorResult.set(null);

		const formValue = this.profileForm.value;

		const payload: UpdateBizProfileDto = {
			id: formValue.id!,
			idEnc: formValue.idEnc!,
			displayName: formValue.displayName!,
			description: formValue.description!,
			fullAddress: formValue.fullAddress!,
			categoryValue: formValue.categoryValue!,
			subCategoriesValues: formValue.subCategoriesValues || [],
			socialLinks: formValue.socialLinks as BusinessSocialLinksDto,
			openingHours: ((formValue.openingHours as { hours: BusinessOpeningHoursDto[] }).hours || []).map(
				(oh: BusinessOpeningHoursDto) => ({
					...oh,
					openingTime: this.formatTime(oh.openingTime),
					closingTime: this.formatTime(oh.closingTime)
				})
			)
		};

		this.#bizProfileService
			.updateProfile(payload)
			.pipe(
				tap((res) => {
					if (res.isSucceeded) {
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: 'Le profil a été mis à jour avec succès.'
							})
						);
						this.#location.back();
					}
				}),
				catchError((err) => {
					this.errorResult.set(err);
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue lors de la mise à jour du profil.';
					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
					return EMPTY;
				}),
				takeUntilDestroyed(this.#destroyRef),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	onCancel(): void {
		this.#location.back();
	}
}
