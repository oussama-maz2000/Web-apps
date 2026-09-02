import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@revlib/components/base.component';

import { BusinessClaimStatusClassPipe } from '@revlib/components/pipes/business-claim-status-class.pipe';
import { BusinessClaimStatusLabelPipe } from '@revlib/components/pipes/business-claim-status-label.pipe';
import { ClaimRejectionReasonLabelPipe } from '@revlib/components/pipes/claim-rejection-reason-label.pipe';
import { getFirstErrorMessage } from '@revlib/utils';

import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { BusinessClaimDto } from '../../../../../../revly-lib/src/lib/models/types/business-claim-dto';
import { BusinessClaimStatus } from '../../../../../../revly-lib/src/lib/models/types/business-claim.status';
import { ClaimRejectionReason } from '../../../../../../revly-lib/src/lib/models/types/claim-rejection-reason';
import { BusinessClaimService } from '../../../services/business-claim.service';
import { CancelClaimConfirmDialogComponent } from '../business-claim-cancel/cancel-claim-confirm-dialog.component';

@Component({
	selector: 'app-business-claims-status',
	standalone: true,
	imports: [
		CommonModule,
		DatePipe,
		MatCardModule,
		MatIconModule,
		MatButtonModule,
		MatDialogModule,
		MatProgressSpinnerModule,
		BusinessClaimStatusLabelPipe,
		BusinessClaimStatusClassPipe,
		ClaimRejectionReasonLabelPipe
	],
	templateUrl: './business-claims-status.component.html'
})
export class BusinessClaimsStatusComponent extends BaseComponent implements OnInit, OnDestroy {
	private readonly dialog = inject(MatDialog);
	private readonly clipboard = inject(Clipboard);
	private readonly claimService = inject(BusinessClaimService);
	readonly #store = inject(Store<AppState>);
	readonly claims = signal<BusinessClaimDto[]>([]);

	BusinessClaimStatus = BusinessClaimStatus; // make enum accessible in template
	RejectonReason = ClaimRejectionReason; // make enum accessible in template

	ngOnInit(): void {
		this.loadClaims();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private loadClaims() {
		this.isLoading.set(true);
		const claimsObs$ = this.claimService.getClaimStatus().subscribe({
			next: (res) => {
				if (res.isSucceeded && res.value) {
					this.claims.set(res.value);
				}
			},
			error: () =>
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: 'Impossible de charger vos demandes.'
					})
				),

			complete: () => this.isLoading.set(false)
		});
		this.subscriptions.add(claimsObs$);
	}

	isCancelable(status: BusinessClaimStatus): boolean {
		return [
			BusinessClaimStatus.PendingModeration,
			BusinessClaimStatus.InReview,
			BusinessClaimStatus.AwaitingOtpVerification
		].includes(status);
	}

	openCancelDialog(claim: BusinessClaimDto) {
		const dialogRef = this.dialog.open(CancelClaimConfirmDialogComponent, {
			width: '400px',
			data: { claimId: claim.id, phone: claim.verificationPhone }
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed) {
				this.cancelClaim(claim.id);
			}
		});
	}

	private cancelClaim(claimId: string) {
		this.isLoading.set(true);

		const cancelObs$ = this.claimService.cancelClaim(claimId).subscribe({
			next: (res) => {
				if (res.isSucceeded) {
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Votre demande a été annulée avec succès.'
						})
					);
					this.loadClaims(); // refresh list
				}
			},
			error: (err) => {
				const msg = getFirstErrorMessage(err) || "Impossible d'annuler la demande.";

				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: msg
					})
				);
				this.isLoading.set(false);
			},
			complete: () => this.isLoading.set(false)
		});

		this.subscriptions.add(cancelObs$);
	}

	copyClaimId(id: string) {
		this.clipboard.copy(id);
		this.#store.dispatch(
			ApplicationActions.showSuccessSnackbar({
				message: 'ID copié !'
			})
		);
	}
}
