import { inject, Injectable } from '@angular/core';
import { WINDOW } from '../../tokens/platform.tokens';

/**
 * Service for centralized storage operations
 * SSR-Compatible: Uses the WINDOW injection token to safely access browser storage
 */
@Injectable({
	providedIn: 'root'
})
export class StorageCoreService {
	// Inject the safe window token
	private window = inject(WINDOW);

	/**
	 * Get item from localStorage with type safety
	 */
	getItem<T>(key: string): T | null {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('LocalStorage access attempted during SSR');
		}

		const item = this.window.localStorage.getItem(key);
		if (!item) return null;

		try {
			return JSON.parse(item) as T;
		} catch {
			return item as unknown as T;
		}
	}

	/**
	 * Store item in localStorage with automatic serialization
	 */
	setItem(key: string, value: unknown): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('LocalStorage access attempted during SSR');
		}

		if (value === undefined || value === null) {
			this.window.localStorage.removeItem(key);
			return;
		}

		const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);

		this.window.localStorage.setItem(key, serialized);
	}

	/**
	 * Remove item from localStorage
	 */
	removeItem(key: string): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('LocalStorage access attempted during SSR');
		}

		this.window.localStorage.removeItem(key);
	}

	/**
	 * Clear all app-related items from localStorage
	 */
	clearAll(keyPrefix?: string): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('LocalStorage access attempted during SSR');
		}

		if (keyPrefix) {
			Object.keys(this.window.localStorage)
				.filter((key) => key.startsWith(keyPrefix))
				.forEach((key) => this.window?.localStorage.removeItem(key));
		} else {
			this.window.localStorage.clear();
		}
	}

	/**
	 * Get item from sessionStorage with type safety
	 */
	getSessionItem<T>(key: string): T | null {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('SessionStorage access attempted during SSR');
		}

		const item = this.window.sessionStorage.getItem(key);
		if (!item) return null;

		try {
			return JSON.parse(item) as T;
		} catch {
			return item as unknown as T;
		}
	}

	/**
	 * Store item in sessionStorage with automatic serialization
	 */
	setSessionItem(key: string, value: unknown): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('SessionStorage access attempted during SSR');
		}

		if (value === undefined || value === null) {
			this.window.sessionStorage.removeItem(key);
			return;
		}

		const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);

		this.window.sessionStorage.setItem(key, serialized);
	}

	/**
	 * Remove item from sessionStorage
	 */
	removeSessionItem(key: string): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('SessionStorage access attempted during SSR');
		}

		this.window.sessionStorage.removeItem(key);
	}

	/**
	 * Clear all app-related items from sessionStorage
	 */
	clearSessionAll(keyPrefix?: string): void {
		if (!this.window) {
			// Guard: Stop here if running on Server
			throw new Error('SessionStorage access attempted during SSR');
		}

		if (keyPrefix) {
			Object.keys(this.window.sessionStorage)
				.filter((key) => key.startsWith(keyPrefix))
				.forEach((key) => this.window?.sessionStorage.removeItem(key));
		} else {
			this.window.sessionStorage.clear();
		}
	}
}
