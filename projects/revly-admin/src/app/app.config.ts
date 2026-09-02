import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
	withViewTransitions
} from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { IdentityStateService, languageInterceptor, provideLibDiInterceptors } from '@revlib/core';
import { ErrorInterceptor } from '../../../revly-lib/src/lib/core/interceptors/error.interceptor';
import { ApplicationActions } from '../../../revly-lib/src/lib/store/application/app.action';

import { AppEffects } from '../../../revly-lib/src/lib/store/application/app.effect';
import { AppState, storeApp } from '../../../revly-lib/src/lib/store/store.config';
import { routes } from './routes/routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({
			eventCoalescing: true
		}),
		// Initialize identity state before app starts
		provideAppInitializer(initializeApp),
		provideLibDiInterceptors(),
		provideHttpClient(withInterceptorsFromDi(), withInterceptors([languageInterceptor, ErrorInterceptor])),
		provideRouter(
			routes,
			//no need for ActivatedRoute when passing params, auto bind -> @input by name convention
			withComponentInputBinding(), // Enable route param binding to @Input() properties
			withViewTransitions(), // Enable smooth transitions between routes
			withInMemoryScrolling({ anchorScrolling: 'enabled' })
		),
		/* STORE  */
		provideStore(storeApp),

		provideEffects(AppEffects)
	]
};

export function initializeApp() {
	const identityStateService = inject(IdentityStateService);
	identityStateService.initialize();
	const store = inject(Store<AppState>);
	store.dispatch(ApplicationActions.checkIsStaff());
}
