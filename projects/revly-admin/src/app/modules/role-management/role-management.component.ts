import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { RoleOperationsReqDto } from '../../../../../revly-lib/src/lib/services/admin/model/app-role-type';
import { StaffUserDto } from '../../../../../revly-lib/src/lib/services/admin/model/StaffUserDto';
import { RoleManagementService } from '../../../../../revly-lib/src/lib/services/admin/service/manage-role.service';
import { UserRolesOperationDialog } from '../../core/shared/dialogs/user-roles/user-roles-operation.dialog';

@Component({
	selector: 'app-role-management',
	imports: [NgClass],
	standalone: true,
	templateUrl: './role-management.component.html'
})
export class RoleManagementComponent {
	#roleManagementService = inject(RoleManagementService);
	readonly dialog = inject(MatDialog);
	readonly #destroyRef = inject(DestroyRef);

	readonly #usersSignal = signal<StaffUserDto[] | null>(null);
	readonly staffUsers = this.#usersSignal.asReadonly();

	constructor() {
		this.#loadUsers();
	}

	#loadUsers(): void {
		this.#roleManagementService
			.getStaffList()
			.pipe(takeUntilDestroyed(this.#destroyRef))
			.subscribe((result) => {
				if (result.isSucceeded && result.value) {
					this.#usersSignal.set(result.value);
				}
			});
	}

	upsertRole(user: StaffUserDto | null, type: 'add' | 'remove'): void {
		this.dialog
			.open(UserRolesOperationDialog, {
				data: { user, type }
			})
			.afterClosed()
			.pipe(
				filter((result): result is RoleOperationsReqDto => !!result),
				switchMap((result) =>
					type === 'add'
						? this.#roleManagementService.addRoleToUser(result)
						: this.#roleManagementService.removeRoleToUser(result)
				),
				takeUntilDestroyed(this.#destroyRef)
			)
			.subscribe((res) => {
				if (!res?.isSucceeded || !res.value) return;

				const currentUsers = this.#usersSignal();
				if (!currentUsers) return;

				const updatedUser = res.value;
				const existingIndex = currentUsers.findIndex((u) => u.email === updatedUser.email);

				if (type === 'remove' && updatedUser.roles!.length === 0) {
					// Remove user from list if no roles remain
					this.#usersSignal.set(currentUsers.filter((u) => u.email !== updatedUser.email));
				} else if (existingIndex >= 0) {
					// Update existing user
					const updated = [...currentUsers];
					updated[existingIndex] = updatedUser;
					this.#usersSignal.set(updated);
				} else {
					// Add new user to list (for add operation on previously unlisted user)
					this.#usersSignal.set([...currentUsers, updatedUser]);
				}
			});
	}
}
