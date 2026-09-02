import { Component, inject, model } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { APP_ROLES, AppRole } from '../../../../../../../revly-lib/src/lib/services/admin/model/app-role-type';
import { StaffUserDto } from '../../../../../../../revly-lib/src/lib/services/admin/model/StaffUserDto';

@Component({
	selector: 'add-role-user',
	templateUrl: `./user-roles-operation.html`,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatSelect,
		MatOption
	]
})
export class UserRolesOperationDialog {
	readonly dialogRef = inject(MatDialogRef<UserRolesOperationDialog>);
	readonly data = inject<{ user: StaffUserDto | null; type: 'add' | 'remove' }>(MAT_DIALOG_DATA);

	readonly staffUserDto = model<StaffUserDto | null>(this.data.user);
	readonly type = model<'add' | 'remove'>(this.data.type);

	readonly roles = Object.values(APP_ROLES);

	protected readonly dialogForm = new FormGroup({
		email: new FormControl(this.staffUserDto()?.email ?? '', {
			nonNullable: true,
			validators: [Validators.required, Validators.email]
		}),
		roles: new FormControl<AppRole[]>([], {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(1)]
		})
	});

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSubmitClick(): void {
		if (this.dialogForm.invalid) return;
		this.dialogRef.close(this.dialogForm.getRawValue());
	}
}
