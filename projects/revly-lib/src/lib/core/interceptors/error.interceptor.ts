import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { DEFAULT_API_CONFIG, ErrorHandlerCoreService } from '@revlib/core';
import { ConnectivityService } from '@revlib/services';
import { catchError, throwError } from 'rxjs';
import { ApplicationActions } from '../../store/application/app.action';
import { isSkipInterceptors } from './interceptors.skipping.utils';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const store = inject(Store);
	const connectivityService = inject(ConnectivityService);
	const errorHandler = inject(ErrorHandlerCoreService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			//In testing/watch phase, risk? snackbar error spamming UI
			if (
				!isSkipInterceptors(req) &&
				connectivityService.isOnline() &&
				req.url.startsWith(DEFAULT_API_CONFIG.baseApiUrl)
			) {
				const normalized = errorHandler.normalizeError(error);
				const message = errorHandler.getSingleErrorMessageOrNull(normalized);
				if (message) {
					store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
				}
			}

			//safer to avoid swallowing the HTTP error for downstream subscribers
			return throwError(() => error);
		})
	);
};
