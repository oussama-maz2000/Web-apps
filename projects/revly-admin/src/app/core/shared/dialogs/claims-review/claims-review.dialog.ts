import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ClaimModerationAction } from '../../../../../../../revly-lib/src/lib/services/admin/model/claims-review';
import { ClaimRejectionReason } from '../../../../../../../revly-lib/src/lib/models/types/claim-rejection-reason';

@Component({
	selector: 'dialog-claims-review',
	templateUrl: `./claims-review.dialog.html`,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogContent,
		MatDialogActions,
		MatSelect,
		MatOption
	]
})
export class ClaimsReviewDialog implements OnInit {
	readonly dialogRef = inject(MatDialogRef<ClaimsReviewDialog>);
	readonly id = inject<string>(MAT_DIALOG_DATA);

	protected readonly dialogForm = new FormGroup({
		claimId: new FormControl<string>({ value: this.id, disabled: true }),
		action: new FormControl<number | null>(null, {
			validators: [Validators.required]
		}),
		rejectionReason: new FormControl<number | null>(null),
		rejectionNote: new FormControl('', { nonNullable: true })
	});

	ngOnInit(): void {
		this.setupConditionalValidation();
	}

	onClose(): void {
		this.dialogRef.close();
	}

	onSubmitClick(): void {
		if (this.dialogForm.invalid) return;
		this.dialogRef.close(this.dialogForm.getRawValue());
	}

	readonly rejectionReasons = Object.entries(ClaimRejectionReason)
		.filter(([key]) => isNaN(Number(key)))
		.map(([label, value]) => ({
			label,
			value: value as number
		}));

	readonly actions = Object.entries(ClaimModerationAction)
		.filter(([key]) => isNaN(Number(key)))
		.map(([label, value]) => ({
			label,
			value: value as number
		}));

	private setupConditionalValidation(): void {
		this.dialogForm.get('action')?.valueChanges.subscribe((action) => {
			this.updateRejectionReasonValidation(action);
			this.updateRejectionNoteValidation(action, this.dialogForm.get('rejectionReason')?.value!);
		});
		this.dialogForm.get('rejectionReason')?.valueChanges.subscribe((reason) => {
			this.updateRejectionNoteValidation(this.dialogForm.get('action')?.value!, reason);
		});
	}

	private updateRejectionReasonValidation(action: number | null): void {
		const rejectionReasonControl = this.dialogForm.get('rejectionReason');
		if (action === ClaimModerationAction.Reject) {
			rejectionReasonControl?.setValidators([Validators.required]);
		} else {
			rejectionReasonControl?.clearValidators();
			rejectionReasonControl?.setValue(null);
		}

		rejectionReasonControl?.updateValueAndValidity();
	}

	private updateRejectionNoteValidation(action: number | null, rejectionReason: number | null): void {
		const rejectionNoteControl = this.dialogForm.get('rejectionNote');

		if (action === ClaimModerationAction.Reject && rejectionReason === ClaimRejectionReason.Other) {
			rejectionNoteControl?.setValidators([Validators.required]);
		} else {
			rejectionNoteControl?.clearValidators();
			rejectionNoteControl?.setValue('');
		}

		rejectionNoteControl?.updateValueAndValidity();
	}

	get shouldShowRejectionReason(): boolean {
		return this.dialogForm.get('action')?.value === ClaimModerationAction.Reject;
	}

	get shouldShowRejectionNote(): boolean {
		return (
			this.dialogForm.get('action')?.value === ClaimModerationAction.Reject &&
			this.dialogForm.get('rejectionReason')?.value === ClaimRejectionReason.Other
		);
	}
}
