import { inject, Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { UserDto } from '../models/responses/userDto.model';
import { LanguageEnum } from '../models/types/common.types';
import { LocationDto } from '../models/types/location.types';
import { AuthBaseService } from '../services/auth/auth-base.service';
import { ApplicationActions } from '../store/application/app.action';
import { selectApplicationProp } from '../store/application/app.selector';
import { AppState } from '../store/store.config';
import { UserActions } from '../store/user/user.action';
import { selectUser, selectUserProp } from '../store/user/user.selector';

/**
 * Central auth state management
 * Single source of truth for authentication state and user data
 *
 * This service maintains the application's auth state using signals
 * Other services should depend on this service, not the other way around
 * to avoid circular dependencies
 */
@Injectable({
	providedIn: 'root'
})
export class IdentityStateService {
	readonly #authBaseService = inject(AuthBaseService);
	readonly #store = inject(Store<AppState>);
	// Public readonly signals
	readonly user = this.#store.selectSignal(selectUser);
	readonly isAuthenticated = this.#store.selectSignal(selectApplicationProp('isAuthenticated'));
	readonly isVerified = this.#store.selectSignal(selectUserProp('isVerified'));
	readonly language = this.#store.selectSignal(selectUserProp('preferredLanguage'));
	readonly currentLocation = this.#store.selectSignal(selectUserProp('location'));

	/**
	 * Initialize application state on startup
	 * Synchronously checks for tokens to ensure store is ready for guards
	 */
	initialize() {
		this.#store.dispatch(ApplicationActions.init());
	}

	/**
	 * Update authentication state after successful login/registration
	 */
	updateAuthenticatedState(user: UserDto): void {
		this.#store.dispatch(ApplicationActions.logIn());
		this.#store.dispatch(UserActions.setUser({ user: user }));
	}

	/**
	 * Update user profile data - single source of truth
	 * Automatically handles storage persistence via effect
	 */
	updateUserProfile(updates: Partial<UserDto>): void {
		const currentUser = this.user();
		if (!currentUser) return;

		const updatedUser = { ...currentUser, ...updates };
		//  this.#user.set(updatedUser);
		this.#store.dispatch(UserActions.setUser({ user: updatedUser }));
	}

	/**
	 * Set the current detected/selected location
	 */
	setCurrentLocation(location: LocationDto | null): void {
		if (location) this.#store.dispatch(UserActions.setUserLocation({ location }));
	}

	/**
	 * Update user language
	 */
	updateLanguage(language: LanguageEnum): void {
		this.#store.dispatch(UserActions.setUserLanguage({ language }));
	}

	/**
	 * Log out user and clear state
	 */
	updateLogoutState(): void {
		this.#authBaseService.clearProfileAndTokens();
		this.#store.dispatch(ApplicationActions.logOut());
		this.#store.dispatch(UserActions.clearUser());
		// Don't clear current location on logout as it's based on device, not user
	}
}
