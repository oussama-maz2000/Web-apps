import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogModule,
	MatDialogRef,
	MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { LocalDateTimePipe } from '../../../../lib/components/pipes/local-datetime.pipe';
import { AccountRecoveryResDto } from '../../../models/responses/auth.models';

@Component({
	selector: 'app-dialog-confirm-account-recovery',
	templateUrl: 'dialog-confirm-account-recovery.html',
	standalone: true,
	imports: [
		...COMMON_IMPORTS,
		MatDialogModule,
		MatFormFieldModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		LocalDateTimePipe
	]
})
export class DialogConfirmAccountRecoveryComponent {
	readonly dialogRef = inject(MatDialogRef<DialogConfirmAccountRecoveryComponent>);
	readonly data = inject<DialogConfirmAccountRecoveryData>(MAT_DIALOG_DATA);

	onNoClick(): void {
		this.dialogRef.close();
	}
}

export interface DialogConfirmAccountRecoveryData {
	recovery: AccountRecoveryResDto;
	message: string;
}
