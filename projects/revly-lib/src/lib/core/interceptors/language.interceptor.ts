import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IdentityStateService } from '../../state/identity-state.service';
import { ConnectivityService } from '../connectivity/connectivity.service';
import { ErrorHandlerCoreService } from '../internal/error/error-handler-core.service';
import { isSkipInterceptors } from './interceptors.skipping.utils';

//todo unify and centrialize custom headers in one place
const PREFERRED_LANGUAGE_HEADER = 'X-Pref-Lang';

export function languageInterceptor(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
	const identityStateService = inject(IdentityStateService);
	const connectivityService = inject(ConnectivityService);
	const errorHandlerCore = inject(ErrorHandlerCoreService);

	const prefLang = identityStateService.language();

	// Skip interceptor logic (for now translation requests static assets)
	if (isSkipInterceptors(req)) return next(req);

	// Drop API requests immediately if offline
	if (!connectivityService.isOnline()) {
		return errorHandlerCore.handleOfflineRequest();
	}

	const updatedReq = req.clone({
		setHeaders: {
			[PREFERRED_LANGUAGE_HEADER]: prefLang.toString()
		}
	});

	return next(updatedReq);
}
