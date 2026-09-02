import { inject, PLATFORM_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackbarService } from '@revlib/services';
import { EMPTY, of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { AccessControlService } from '../../services/admin/service/access-control.service';
import { AuthBaseService } from '../../services/auth/auth-base.service';
import { UserService } from '../../services/user/user.service';
import { AppState } from '../store.config';
import { UserActions } from '../user/user.action';
import { selectUser } from '../user/user.selector';
import { ApplicationActions } from './app.action';
import { selectApplicationProp } from './app.selector';
import { isPlatformBrowser } from '@angular/common';

export class AppEffects {
	#userService = inject(UserService);
	#authBaseService = inject(AuthBaseService);
	#actions$ = inject(Actions);
	#platformId = inject(PLATFORM_ID);
	#accessControlService = inject(AccessControlService);
	#store = inject(Store<AppState>);
	#snackBarService = inject(SnackbarService);

	bootstrap$ = createEffect(() =>
		this.#actions$.pipe(
			ofType(ApplicationActions.init),
			exhaustMap(() => {
				const isAuth: boolean = this.#authBaseService.isAuthenticated();
				const isBrowser = isPlatformBrowser(this.#platformId);

				if (!isAuth) {
					if (!isBrowser) {
						return EMPTY; // Don't dispatch anything
					} else {
						return [ApplicationActions.logOut()]; //we are in browser
					}
				}

				// Authenticated + Browser
				if (isBrowser) {
					const userProfile = this.#authBaseService.getProfile();
					// get auth info
					if (userProfile) {
						return [ApplicationActions.logIn(), UserActions.setUser({ user: userProfile })];
					}
				}

				// Fetch fresh profile
				return this.#userService.getUserProfile$().pipe(
					concatMap((result) => {
						if (!result.isSucceeded || !result.value) {
							return [ApplicationActions.logOut()];
						}

						return [
							ApplicationActions.logIn(),
							UserActions.setUser({ user: result.value }),
							ApplicationActions.checkIsStaff()
						];
					}),
					catchError(() => {
						this.#authBaseService.clearProfileAndTokens();
						return of(ApplicationActions.logOut());
					})
				);
			})
		)
	);

	checkIsStaff$ = createEffect(() =>
		this.#actions$.pipe(
			ofType(ApplicationActions.checkIsStaff),
			withLatestFrom(
				this.#store.select(selectApplicationProp('isAuthenticated')),
				this.#store.select(selectUser)
			),
			exhaustMap(([isAuthenticated, user]) => {
				if (isAuthenticated && user) {
					return this.#accessControlService
						.isStaff()
						.pipe(map((res) => ApplicationActions.staffCheckCompleted({ response: res })));
				}
				return EMPTY;
			})
		)
	);

	showSuccessSnackbar$ = createEffect(
		() => {
			return this.#actions$.pipe(
				ofType(ApplicationActions.showSuccessSnackbar),
				tap(({ message }) => {
					this.#snackBarService.success(message);
				})
			);
		},
		{ dispatch: false }
	);

	showErrorSnackbar$ = createEffect(
		() => {
			return this.#actions$.pipe(
				ofType(ApplicationActions.showErrorSnackbar),
				tap(({ message }) => {
					this.#snackBarService.error(message);
				})
			);
		},
		{ dispatch: false }
	);
}
