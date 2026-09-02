import { inject } from '@angular/core';
import { IdentityStateService } from '@revlib/core';

// App initialization function for provideAppInitializer
export function initializeApp() {
	const identityStateService = inject(IdentityStateService);

	// Initialize identity state
	identityStateService.initialize();

	// Initialize the translation system
	// translationManager.initialize(); //future use
}
