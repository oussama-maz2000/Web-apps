import { isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';

// 1. WINDOW Token
export const WINDOW = new InjectionToken<Window | null>('WindowToken', {
	factory: () => {
		const platformId = inject(PLATFORM_ID);
		return isPlatformBrowser(platformId) ? window : null;
	}
});

// 2. NAVIGATOR Token
export const NAVIGATOR = new InjectionToken<Navigator | null>('NavigatorToken', {
	factory: () => {
		const platformId = inject(PLATFORM_ID);
		return isPlatformBrowser(platformId) ? navigator : null;
	}
});

// 3. LOCATION Token
export const LOCATION = new InjectionToken<Location | null>('LocationToken', {
	factory: () => {
		const platformId = inject(PLATFORM_ID);
		return isPlatformBrowser(platformId) ? window.location : null;
	}
});

// 4. REQUEST Token (SSR)
// Using a string instead of InjectionToken to avoid instance mismatch across different bundles/contexts
export const REVLY_REQUEST = 'REVLY_REQUEST_TOKEN';

// 5. RESPONSE Token (SSR)
export const REVLY_RESPONSE = 'REVLY_RESPONSE_TOKEN';
