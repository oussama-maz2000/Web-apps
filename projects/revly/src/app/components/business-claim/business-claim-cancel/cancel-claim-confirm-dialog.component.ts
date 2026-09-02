import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef
} from '@angular/material/dialog';

@Component({
	selector: 'app-cancel-claim-confirm-dialog',
	standalone: true,
	imports: [MatButtonModule, MatDialogContent, MatDialogActions, MatDialogClose],
	template: `
		<div class="p-4">
			<h2 mat-dialog-title>Annuler la demande</h2>
			<mat-dialog-content>
				<p>Êtes-vous sûr de vouloir annuler cette demande de revendication ?</p>
				<p class="text-sm text-gray-600 mt-2">
					Téléphone : <strong>{{ data.phone }}</strong>
				</p>
			</mat-dialog-content>
			<mat-dialog-actions [align]="'end'">
				<button matButton [mat-dialog-close]="false">Non, garder</button>
				<button matButton="filled" color="warn" [mat-dialog-close]="true">Oui, annuler</button>
			</mat-dialog-actions>
		</div>
	`
})
export class CancelClaimConfirmDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<CancelClaimConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { claimId: string; phone: string }
	) {}
}
