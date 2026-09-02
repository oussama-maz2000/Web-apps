import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'revlib-review-reply-delete-dialog',
	standalone: true,
	imports: [MatDialogModule, MatButtonModule],
	template: `
		<h2 mat-dialog-title class="text-lg font-semibold text-gray-900">Supprimer la réponse</h2>
		<mat-dialog-content class="mt-2">
			<p class="text-gray-700">
				Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.
			</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end" class="gap-2 mt-4">
			<button matButton type="button" (click)="onCancel()" class="px-4 py-2">Annuler</button>
			<button
				mat-raised-button
				type="button"
				(click)="onConfirm()"
				class="!bg-red-600 !text-white hover:!bg-red-700 px-4 py-2">
				Confirmer
			</button>
		</mat-dialog-actions>
	`,
	styles: [
		`
			:host {
				display: block;
			}
		`
	]
})
export class ReviewReplyDeleteDialogComponent {
	constructor(private dialogRef: MatDialogRef<ReviewReplyDeleteDialogComponent>) {}

	onCancel(): void {
		this.dialogRef.close(false);
	}

	onConfirm(): void {
		this.dialogRef.close(true);
	}
}
