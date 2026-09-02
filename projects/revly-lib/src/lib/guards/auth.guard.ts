import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AUTH_PATHS } from '../core/routes/auth.routes';
import { AuthTokenService } from '../services/token/auth-token.service';
import { AUTH_QUERY_PARAMS } from '../models/params/auth.query-params';

export const denyUnauthenticated: CanActivateFn = (_, state): boolean | UrlTree => {
	const router = inject(Router);
	const authTokenService = inject(AuthTokenService);
	const isAuth = authTokenService.isAuthenticated();

	if (isAuth) return true;

	return router.createUrlTree([AUTH_PATHS.LOGIN], {
		queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: state.url }
	});
};

export const denyAuthenticated: CanActivateFn = (_, _state): boolean | UrlTree => {
	const router = inject(Router);
	const authTokenService = inject(AuthTokenService);
	const isAuth: boolean = authTokenService.isAuthenticated();

	if (!isAuth) return true;

	return router.createUrlTree(['/']);
};
