import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';
import { AuthInterceptor } from './auth.interceptor';

/**
 * Provides all HTTP DI interceptors for the application
 * This should be included in the providers array of the app module
 */
export function provideLibDiInterceptors(): Provider[] {
	return [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
}
