import { inject, Injectable, PLATFORM_ID, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { NAVIGATOR } from '@revlib/core';
import { LanguageEnum } from '../../../models/types/common.types';
import { AppState } from '../../../store/store.config';
import { UserActions } from '../../../store/user/user.action';
import { selectUserProp } from '../../../store/user/user.selector';
import { StorageCoreService } from '../storage/storage-core.service';
import { STORAGE_KEYS } from '../storage/storage-keys';
import { isPlatformBrowser } from '@angular/common';

export const DEFAULT_LANGUAGE = LanguageEnum.French;

@Injectable({
	providedIn: 'root'
})
export class LanguageCoreService {
	readonly #storageCoreService = inject(StorageCoreService);
	readonly #store = inject(Store<AppState>);
	// Inject safe navigator
	readonly #navigator = inject(NAVIGATOR);
	readonly #platformId = inject(PLATFORM_ID);

	// Signal for reactive language changes
	readonly language: Signal<LanguageEnum> = this.#store.selectSignal(selectUserProp('preferredLanguage'));

	constructor() {
		this.initialize();
	}

	/*Notes for later:
	* Under SSR, the language should typically be resolved before this method is called, from one (or more) of:
		- Accept-Language header
		- A cookie (best option for persistence across requests)
		- URL segment (/en, /fr)
	* */

	storePreferredLanguage(prefLanguage: LanguageEnum): void {
		if (isPlatformBrowser(this.#platformId)) {
			this.#storageCoreService.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, prefLanguage.toString());
		}

		// Always update runtime state
		this.#store.dispatch(UserActions.setUserLanguage({ language: prefLanguage }));
	}

	getBrowserDefaultLanguage(): LanguageEnum | null {
		// Safely access navigator. Returns null on Server
		if (!this.#navigator) return null;

		const lang = this.#navigator?.language?.split('-')[0]?.toLowerCase(); // e.g., 'en-US' → 'en'

		// Map of supported browser language codes to LanguageEnum values
		const supportedLanguages: Record<string, LanguageEnum> = {
			fr: LanguageEnum.French,
			en: LanguageEnum.English,
			ar: LanguageEnum.Arabic
		};

		return supportedLanguages[lang] ? supportedLanguages[lang] : null;
	}

	// Helper method to validate language values
	isValidLanguage(lang: number): boolean {
		return Object.values(LanguageEnum).includes(lang);
	}

	protected initialize(): void {
		const lang = this.getPreferredLanguage();
		this.#store.dispatch(UserActions.setUserLanguage({ language: Number(lang) as LanguageEnum }));
	}

	private getPreferredLanguage(): string {
		if (isPlatformBrowser(this.#platformId)) {
			const lang = this.#storageCoreService.getItem<string>(STORAGE_KEYS.PREFERRED_LANGUAGE);
			if (lang && Object.values(LanguageEnum).includes(lang)) return lang;

			// Try browser default if nothing stored or invalid
			const prefLang = this.getBrowserDefaultLanguage() ?? DEFAULT_LANGUAGE;

			return prefLang.toString();
		}

		//todo improve later, for now on the server we always return DEFAULT_LANGUAGE
		return DEFAULT_LANGUAGE.toString();
	}
}
