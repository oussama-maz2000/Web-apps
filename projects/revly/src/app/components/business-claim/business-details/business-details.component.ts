import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AvatarComponent } from '@revlib/components/shared/avatar/avatar.component';
import { IdentityStateService } from '@revlib/core';
import { BizFoodUpdateReqDto, DayOfWeek, UpdateBizProfileDto } from '@revlib/models';
import { ApplicationActions, AppState, selectApplicationProp, selectUserProp } from '@revlib/store';
import { buildImageUrl } from '@revlib/utils';
import { filter, switchMap } from 'rxjs';
import { AUTH_QUERY_PARAMS } from '../../../../../../revly-lib/src/lib/models/params/auth.query-params';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
	Business,
	BusinessOpenStatus,
	ConfBizSubCategoryDto
} from '../../../../../../revly-lib/src/lib/models/responses/business.model';
import { BusinessClaimService } from '../../../services/business-claim.service';
import { ExistingClaimDialogComponent } from '../existing-claim/existing-claim-dialog.component';

@Component({
	selector: 'app-business-details',
	standalone: true,
	imports: [CommonModule, AvatarComponent],
	templateUrl: './business-details.component.html'
})
export class BusinessDetailsComponent {
	businessDetails = input.required<Business>();

	// Dependencies Injection
	readonly #sanitizer = inject(DomSanitizer);
	readonly #dialog = inject(MatDialog);
	readonly #router = inject(Router);

	// Services
	readonly #claimService = inject(BusinessClaimService);
	readonly #identityState = inject(IdentityStateService);
	// Signals from IdentityStateService
	readonly isVerified = this.#identityState.isVerified;
	readonly user = this.#identityState.user;
	private store = inject(Store<AppState>);
	private ownedBusinessIds = this.store.selectSignal(selectUserProp('ownedBusinessesIds'));
	protected isOwner = computed(() => {
		const ids = this.ownedBusinessIds() ?? [];
		const bizId = this.businessDetails().id;
		return !!bizId && ids.includes(bizId);
	});
	readonly isAuthenticated = this.store.selectSignal(selectApplicationProp('isAuthenticated'));

	protected readonly BusinessOpenStatus = BusinessOpenStatus;
	protected readonly buildImageUrl = buildImageUrl;
	readonly destroy = inject(DestroyRef);

	navigateToUpdateProfile(): void {
		const business = this.businessDetails();

		const profileData: UpdateBizProfileDto = {
			id: business.id,
			idEnc: business.idEnc,
			displayName: business.displayName,
			categoryValue: business.categoryValue,

			description: business.description || '',
			fullAddress: business.fullAddress,
			subCategoriesValues: business.subCategories?.map((s: ConfBizSubCategoryDto) => s.value) || [],
			socialLinks: {
				facebook: business.socialLinks?.facebook || '',
				googleMaps: business.socialLinks?.googleMaps || '',
				instagram: business.socialLinks?.instagram || '',
				website: business.socialLinks?.website || ''
			},
			openingHours:
				business.openingHours?.map((oh: any) => ({
					day: this.mapDayStringToEnum(oh.day),
					openingTime: oh.openingTime.substring(0, 5),
					closingTime: oh.closingTime.substring(0, 5)
				})) || []
		};

		const pictures = business.pictures;

		this.#router.navigate(['/biz/update-profile'], {
			state: { profileData, pictures }
		});
	}

	navigateToUpdateBizFood(): void {
		const business = this.businessDetails();
		if (!business.bizFoodDetails) return;

		const bizFoodData: BizFoodUpdateReqDto = {
			...business.bizFoodDetails,
			businessId: business.id
			// idEnc: business.idEnc
		};

		this.#router.navigate(['/biz/update-food'], {
			state: {
				bizFoodData: bizFoodData
			}
		});
	}

	private mapDayStringToEnum(dayStr: string): DayOfWeek {
		const dayMap: Record<string, DayOfWeek> = {
			SUNDAY: DayOfWeek.Sunday,
			MONDAY: DayOfWeek.Monday,
			TUESDAY: DayOfWeek.Tuesday,
			WEDNESDAY: DayOfWeek.Wednesday,
			THURSDAY: DayOfWeek.Thursday,
			FRIDAY: DayOfWeek.Friday,
			SATURDAY: DayOfWeek.Saturday
		};
		return dayMap[dayStr.toUpperCase()] ?? DayOfWeek.Monday;
	}
	formatDate(date: string | null): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString();
	}

	getMapEmbedUrl(): SafeResourceUrl {
		const [lng, lat] = this.businessDetails().location.coordinates;
		const alternativeUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
		return this.#sanitizer.bypassSecurityTrustResourceUrl(alternativeUrl);
	}

	getMapLink(): string {
		const [lng, lat] = this.businessDetails().location.coordinates;
		return `https://www.google.com/maps?q=${lat},${lng}`;
	}

	getDayName(day: DayOfWeek): string {
		return DayOfWeek[day];
	}

	openClaimDialog() {
		const isAuthenticated = this.#identityState.isAuthenticated();
		const isVerified = this.#identityState.isVerified();

		if (!isAuthenticated) {
			this.store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: 'Vous devez être connecté pour revendiquer un commerce.'
				})
			);

			return;
		}
		if (!isVerified) {
			this.store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: 'Votre compte doit être vérifié pour revendiquer un commerce.'
				})
			);
			return;
		}

		this.#dialog
			.open(ExistingClaimDialogComponent, {
				data: { verificationPhone: this.businessDetails().phoneNumber },
				width: '400px'
			})
			.afterClosed()
			.pipe(
				filter(Boolean),
				switchMap((phone) =>
					this.#claimService.claimExistingBusiness({
						bizIdEnc: this.businessDetails().idEnc,
						verificationPhone: phone
					})
				),
				takeUntilDestroyed(this.destroy)
			)
			.subscribe({
				next: () => {
					this.store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Votre demande de revendication a été envoyée avec succès.'
						})
					);
				},
				error: () => {
					this.store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: "Une erreur est survenue lors de l'envoi de la demande."
						})
					);
				}
			});
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
