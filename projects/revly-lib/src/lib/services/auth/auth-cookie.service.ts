import { inject, Injectable, InjectionToken } from '@angular/core';
import { Request } from 'express';
import { REVLY_REQUEST } from '../../core/tokens/platform.tokens';

@Injectable({
	providedIn: 'root'
})
export class AuthCookieService {
	//private window = inject(WINDOW);

	/**
	 * Get the current request object (SSR only)
	 */
	private get request(): Request | null {
		// 1. Try DI first
		try {
			const req = inject<Request | null>(new InjectionToken<Request | null>(REVLY_REQUEST));
			//[AuthCookieService] Request found via DI
			if (req) {
				return req;
			}
		} catch {
			// ignore
		}

		// 2. Fallback to Global Context (AsyncLocalStorage)
		const context = globalThis.revlySsrContext;
		if (context) {
			const store = context.getStore();
			//[AuthCookieService] Request found via AsyncLocalStorage
			if (store?.req) {
				return store.req;
			}
		}

		//[AuthCookieService] Request NOT found (neither DI nor Context)
		return null;
	}

	/**
	 * Get cookie value by name
	 */
	public getCookie(name: string): string | null {
		// Client-side: read from document.cookie
		/*
		//this will alwyas return null because we are using HTTP only cookies, only enable if that change.
		if (this.window) {
			const ca = this.window.document.cookie.split(';');
			return this.parseCookieValue(name, ca);
		}
		 */

		// Server-side: read from REQUEST headers
		const req = this.request;
		if (!req) {
			return null;
		}

		const cookies = req.headers?.cookie;
		if (!cookies) {
			return null;
		}

		const ca = cookies.split(';');
		const value = this.#parseCookieValue(name, ca);
		if (!value) {
		}
		return value;
	}

	/**
	 * Parse cookie value from cookie string array
	 */
	#parseCookieValue(name: string, cookies: string[]): string | null {
		const nameEQ = name + '=';

		for (const c of cookies) {
			let cookie = c;
			while (cookie.charAt(0) === ' ') {
				cookie = cookie.substring(1);
			}
			if (cookie.indexOf(nameEQ) === 0) {
				const value = cookie.substring(nameEQ.length);
				return value;
			}
		}
		return null;
	}
}
