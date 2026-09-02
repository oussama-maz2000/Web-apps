import { inject, Injectable } from '@angular/core';
import { forkJoin, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageCoreService } from '../../core/internal/storage/storage-core.service';
import { STORAGE_KEYS } from '../../core/internal/storage/storage-keys';
import { NAVIGATOR, WINDOW } from '../../core/tokens/platform.tokens';
import { AuthCookieService } from '../auth/auth-cookie.service';

//todo add expiration token check
/**
 * Service responsible for token management operations.
 * Handles storage, retrieval and clearing of auth tokens.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthTokenService {
	private storageCoreService = inject(StorageCoreService);
	private authCookieService = inject(AuthCookieService);

	// Store the fingerprint as a buffer for reuse
	private fingerprintBuffer: Promise<ArrayBuffer> | null = null;

	// 1. Inject our safe tokens
	private window = inject(WINDOW);
	private navigator = inject(NAVIGATOR);

	/**
	 * Stores both access and refresh tokens in local storage
	 */
	storeTokens$(accessToken: string, refreshToken: string): Observable<void> {
		return forkJoin([from(this.#encryptToken(accessToken)), from(this.#encryptToken(refreshToken))]).pipe(
			map(([encryptedAccess, encryptedRefresh]) => {
				this.storageCoreService.setItem(STORAGE_KEYS.ACCESS_TOKEN, encryptedAccess);
				this.storageCoreService.setItem(STORAGE_KEYS.REFRESH_TOKEN, encryptedRefresh);
			})
		);
	}

	/**
	 * Retrieves both access and refresh tokens as a tuple
	 * @returns Promise resolving to [accessToken, refreshToken]
	 */
	async getTokens(): Promise<[string | null, string | null]> {
		// Await both promises and return as a tuple
		const [accessToken, refreshToken] = await Promise.all([this.getAccessToken(), this.#getRefreshToken()]);
		return [accessToken, refreshToken];
	}

	/**
	 * Retrieves current access token from storage or cookie
	 */
	async getAccessToken(): Promise<string | null> {
		// Server-side (SSR): localStorage is unavailable, read from cookie
		//No window found, reading from cookie
		if (!this.window) {
			return this.authCookieService.getCookie(STORAGE_KEYS.ACCESS_TOKEN_COOKIE);
		}

		// Client-side: Try encrypted localStorage first (primary)
		const encryptedToken = this.storageCoreService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
		if (encryptedToken) {
			try {
				const decrypted = await this.#decryptToken(encryptedToken);
				if (decrypted) return decrypted;
			} catch {
				// Decryption failed (e.g. fingerprint changed), fallback to cookie
			}
		}

		// Fallback to cookie if localStorage is empty or decryption failed
		return this.authCookieService.getCookie(STORAGE_KEYS.ACCESS_TOKEN_COOKIE);
	}

	/**
	 * Retrieves current refresh token from storage
	 */
	async #getRefreshToken(): Promise<string | null> {
		const encryptedToken = this.storageCoreService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);

		if (!encryptedToken) return null;
		try {
			return await this.#decryptToken(encryptedToken);
		} catch {
			return null;
		}
	}

	/**
	 * Encryption implementation using a browser fingerprint
	 */
	async #getBrowserFingerprintKey(): Promise<CryptoKey | null> {
		// 2. Guard: If no navigator or crypto (Server), we can't generate a key
		if (!this.navigator || !this.window?.crypto) {
			return null;
		}

		const components = [
			this.navigator.userAgent,
			this.navigator.language,
			this.navigator.maxTouchPoints,
			new Date().getTimezoneOffset()
		];
		const fingerprintStr = components.join('|');

		const encoder = new TextEncoder();
		const data = encoder.encode(fingerprintStr);

		if (!this.fingerprintBuffer) {
			this.fingerprintBuffer = this.window.crypto.subtle.digest('SHA-256', data);
		}

		return this.window.crypto.subtle.importKey(
			'raw',
			await this.fingerprintBuffer,
			{ name: 'AES-GCM' },
			false,
			['encrypt', 'decrypt']
		);
	}

	// Encrypt token using Web Crypto API
	async #encryptToken(token: string): Promise<string> {
		const key = await this.#getBrowserFingerprintKey();

		// 3. Guard: If no key or no window (Server), return the plain token or empty string
		if (!key || !this.window?.crypto) return '';

		const encoder = new TextEncoder();
		const data = encoder.encode(token);

		// Generate IV (initialization vector)
		const iv = this.window.crypto.getRandomValues(new Uint8Array(12));

		// Encrypt the data
		const encryptedData = await this.window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

		// Combine IV and encrypted data for storage
		const result = new Uint8Array(iv.length + encryptedData.byteLength);
		result.set(iv);
		result.set(new Uint8Array(encryptedData), iv.length);

		return btoa(String.fromCharCode.apply(null, [...new Uint8Array(result)]));
	}

	// Decrypt token using Web Crypto API
	async #decryptToken(encryptedToken: string): Promise<string> {
		// 1. Guard for Server (SSR)
		if (!this.window?.crypto) return '';

		try {
			// Convert Base64 string back to ArrayBuffer
			const binaryStr = atob(encryptedToken);
			const bytes = new Uint8Array(binaryStr.length);
			for (let i = 0; i < binaryStr.length; i++) {
				bytes[i] = binaryStr.charCodeAt(i);
			}

			// Extract IV and encrypted data
			const iv = bytes.slice(0, 12);
			const encryptedData = bytes.slice(12); // This is what we are decrypting

			// Get the key
			const key = await this.#getBrowserFingerprintKey();
			if (!key) throw new Error('Key generation failed');

			// 2. Perform Decryption
			// We pass 'encryptedData' HERE to create the 'decryptedData'
			const decryptedBuffer = await this.window.crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv },
				key,
				encryptedData
			);

			// Convert back to string
			return new TextDecoder().decode(decryptedBuffer);
		} catch (error) {
			this.clearTokens();
			return '';
		}
	}

	/**
	 * Clears all authentication tokens from storage and cookies
	 */
	clearTokens(): void {
		this.storageCoreService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
		this.storageCoreService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
	}

	/**
	 * Checks if user is authenticated (has valid access token)
	 */
	isAuthenticated(): boolean {
		// Server-side (SSR): Check cookie
		if (!this.window) {
			return this.authCookieService.getCookie(STORAGE_KEYS.ACCESS_TOKEN_COOKIE) !== null;
		}

		// Client-side: Check localStorage first (faster), then fallback to cookie
		const encryptedToken = this.storageCoreService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
		if (encryptedToken !== null) return true;

		return this.authCookieService.getCookie(STORAGE_KEYS.ACCESS_TOKEN_COOKIE) !== null;
	}

	/**
	 * Temporarily stores Google auth token
	 */
	sessionStoreGoogleToken(token: string) {
		this.storageCoreService.setSessionItem(STORAGE_KEYS.GOOGLE_AUTH_TOKEN, token);
	}

	/**
	 * Retrieves Google auth token
	 */
	sessionGetGoogleToken(): string | null {
		return this.storageCoreService.getSessionItem<string>(STORAGE_KEYS.GOOGLE_AUTH_TOKEN);
	}

	/**
	 * Retrieves Google user name
	 */
	sessionGetGoogleUserName(): string | null {
		return this.storageCoreService.getSessionItem<string>(STORAGE_KEYS.GOOGLE_USER_NAME);
	}

	/**
	 * Removes Google auth token
	 */
	sessionRemoveGoogleToken() {
		this.storageCoreService.removeSessionItem(STORAGE_KEYS.GOOGLE_AUTH_TOKEN);
		this.storageCoreService.removeSessionItem(STORAGE_KEYS.GOOGLE_USER_NAME);
	}
}
