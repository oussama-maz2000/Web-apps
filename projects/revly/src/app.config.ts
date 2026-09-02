import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
	withViewTransitions
} from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { languageInterceptor, provideLibDiInterceptors } from '@revlib/core'; //import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { AppEffects } from '../../revly-lib/src/lib/store/application/app.effect';
import { storeApp } from '../../revly-lib/src/lib/store/store.config';
import { UserEffect } from '../../revly-lib/src/lib/store/user/user.effect';
import { initializeApp } from './app.init';
import { routes } from './app/routes/routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({
			eventCoalescing: true
		}),
		provideStore(storeApp),

		provideEffects([AppEffects, UserEffect]),

		// Configure translation service
		// provideTranslateService({
		//     defaultLanguage: 'en',
		//     /*
		//                 // compiler configuration
		//                 compiler: {
		//                     //Pluralization: parses messages using the ICU syntax
		//                     // needs more seup, *json params, template... to make it work
		//                     provide: TranslateCompiler,
		//                     useClass: TranslateMessageFormatCompiler
		//                 }
		//                     */
		// }),

		// Initialize app services before app starts
		provideAppInitializer(initializeApp),
		provideLibDiInterceptors(),

		// Configure HTTP with language interceptor
		provideHttpClient(withFetch(), withInterceptorsFromDi(), withInterceptors([languageInterceptor])),
		provideRouter(
			routes,
			/* This ensures: (fix issue where an SSR route redirect to CSR route through a guard)
				- Guards run before any component instantiation, preventing race conditions and ensuring content consistency.
				- Redirects short-circuit the render
				- CSR-only components are never touched on the server
				-  prevent UI flickering during client-side (hydration)
			 withEnabledBlockingInitialNavigation(), //NOT TO BE USED TOEGETER WITH provideClientHydration
			 */

			withComponentInputBinding(), // Enable route param binding to @Input() properties
			withViewTransitions(), // Enable smooth transitions between routes
			withInMemoryScrolling({
				anchorScrolling: 'enabled'
			})
		),
		provideClientHydration(
			withEventReplay(),
			//Prevent duplicate HTTP calls between server and client (after hydration)
			withHttpTransferCacheOptions({
				includePostRequests: false
				//temporary disabled will be restored once deployed to prod:
				// new URL(: generate error when we are using proxy for ssr test
				// filter: (req) => {
				// 	if (req.method !== 'GET') return false;
				//
				// 	const { pathname } = new URL(req.url, DEFAULT_API_CONFIG.baseApiUrl);
				// 	return !pathname.startsWith('/User/Me'); // catches /User/Me and /User/Me/...
				// }
			})
		)
	]
};
