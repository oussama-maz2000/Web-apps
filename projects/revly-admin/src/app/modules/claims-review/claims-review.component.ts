import { NgClass } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { exhaustMap, filter, tap } from 'rxjs';
import { BizModClaimReviewReqDto } from '../../../../../revly-lib/src/lib/services/admin/model/claims-review';
import { ClaimsReviewDialog } from '../../core/shared/dialogs/claims-review/claims-review.dialog';
import { ModBizClaimsService } from '../../../../../revly-lib/src/lib/services/admin/service/mod-biz-claims.service';
import { BusinessClaimDto } from '../../../../../revly-lib/src/lib/models/types/business-claim-dto';
import { ClaimRejectionReason } from '../../../../../revly-lib/src/lib/models/types/claim-rejection-reason';

@Component({
	selector: 'app-claims-review',
	imports: [NgClass, MatIcon],
	standalone: true,
	templateUrl: './claims-review.component.html'
})
export class ClaimsReviewComponent {
	readonly claims = signal<BusinessClaimDto[]>([]);
	readonly currentClaim = computed(() => this.claims()[0] ?? null);
	readonly hasNoClaims = computed(() => this.claims().length === 0);

	private readonly modBizClaimsService = inject(ModBizClaimsService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly dialog = inject(MatDialog);
	private readonly store = inject(Store<AppState>);

	constructor() {
		this.loadClaims();
	}

	private loadClaims(): void {
		this.modBizClaimsService
			.getPendingBizClaims$()
			.pipe(
				tap((claims) => this.claims.set(claims.value ?? [])),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe();
	}

	getRejectionReason(num: number): string {
		return ClaimRejectionReason[num] ?? 'Unknown';
	}

	getStatusLabel(status: number): string {
		const labels: Record<number, string> = {
			1: 'Pending Moderation',
			2: 'In Review',
			3: 'Awaiting OTP Verification',
			4: 'Verified',
			5: 'Rejected',
			10: 'Canceled By Claimer',
			11: 'Expired'
		};
		return labels[status] ?? 'Unknown';
	}
	openClaimsReviewDialog(): void {
		const claim = this.currentClaim();
		if (!claim?.id) return;

		this.dialog
			.open(ClaimsReviewDialog, { data: claim.id })
			.afterClosed()
			.pipe(
				filter((result): result is BizModClaimReviewReqDto => !!result),
				exhaustMap((result) => this.modBizClaimsService.reviewBizClaim(result)),
				tap(() => {
					this.store.dispatch(
						ApplicationActions.showSuccessSnackbar({ message: 'Review passed successfuly ' })
					);
					this.loadClaims();
				}),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe();
	}
}
