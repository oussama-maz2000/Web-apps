import { effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_PATHS, IdentityStateService } from '../../public-api';
import { BaseComponent } from './base.component';

// Base class for protected components
export abstract class AuthenticatedComponent extends BaseComponent {
	protected router = inject(Router);
	protected identityStateService = inject(IdentityStateService);

	constructor() {
		super();
		//  redirect if authentication state change to unauthenticated
		effect(() => {
			if (!this.identityStateService.isAuthenticated()) {
				this.router.navigate([AUTH_PATHS.LOGIN]);
			}
		});
	}
}
