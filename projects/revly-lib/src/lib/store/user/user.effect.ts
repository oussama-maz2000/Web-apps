import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getFirstErrorMessage } from '@revlib/utils';
import { exhaustMap, filter, mergeMap, of, withLatestFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserFacade } from '../../facades/user/user-facade.service';
import { Result } from '../../models/common/result';
import { AuthBaseService } from '../../services/auth/auth-base.service';
import { ApplicationActions } from '../application/app.action';
import { AppState } from '../store.config';
import { UserActions } from './user.action';
import { selectUser } from './user.selector';

export class UserEffect {
	#userFacade = inject(UserFacade);
	#actions = inject(Actions);
	uploadProfilePicture = createEffect(() =>
		this.#actions.pipe(
			ofType(UserActions.uploadUserImage),
			exhaustMap(({ file }) =>
				this.#userFacade.uploadUserProfilePicture$(file).pipe(
					mergeMap((response: Result<string>) => {
						if (response.isSucceeded && response.value)
							return of(
								UserActions.uploadUserImageSuccess({
									uploadedImageUrl: response.value
								}),
								ApplicationActions.showSuccessSnackbar({
									message: response.success?.message ?? 'Succès'
								})
							);

						return of(
							UserActions.uploadUserImageFailure(),
							ApplicationActions.showErrorSnackbar({
								message: getFirstErrorMessage(response) ?? "Une erreur s'est produite."
							})
						);
					}),
					catchError(() => of(UserActions.uploadUserImageFailure()))
				)
			)
		)
	);

	#authBaseService = inject(AuthBaseService);
	readonly #store = inject(Store<AppState>);
	readonly #platfomId = inject(PLATFORM_ID);

	// Auto-persist user changes to storage
	syncUserStorage = createEffect(
		() =>
			this.#actions.pipe(
				ofType(
					UserActions.clearUser,
					UserActions.setUser,
					UserActions.setUserLanguage,
					UserActions.setUserLocation,
					UserActions.uploadUserImageSuccess,
					UserActions.uploadUserImageFailure
				),
				withLatestFrom(this.#store.select(selectUser)),
				filter(() => isPlatformBrowser(this.#platfomId)),
				tap(([_, user]) => {
					if (user) {
						this.#authBaseService.storeProfile(user);
					}
				})
			),
		{ dispatch: false }
	);
}
