import { inject, Injectable } from '@angular/core';
import { GuardResult, MaybeAsync, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectApplicationProp } from '@revlib/store';

@Injectable({
	providedIn: 'root'
})
export class RolesGuard {
	private router = inject(Router);
	#store = inject(Store);

	DenyIfNotAdmin(): MaybeAsync<GuardResult> {
		let isAdmin = this.#store.selectSignal(selectApplicationProp('isAppAdmin'));
		if (isAdmin()) return true;

		this.router.navigate(['/']);
		return false;
	}
}
