import { HttpRequest } from '@angular/common/http';
import { API_COMMON_ENDPOINTS } from '../api/api-common-endpoints';

//global skipping of interceptors defined here

export function isSkipInterceptors(req: HttpRequest<unknown>): boolean {
	return isTranslationRequest(req) || isHealthCheckRequest(req);
}

//private, interpcetors don't need to know about it
function isTranslationRequest(req: HttpRequest<unknown>): boolean {
	// Check if the request is for our translation files by verifying the URL pattern
	// and ensuring it's a local request (not to external services)
	return (
		(req.url.startsWith('/') || req.url.startsWith('./') || req.url.startsWith('../')) &&
		req.url.includes('/i18n/')
	);
}

function isHealthCheckRequest(req: HttpRequest<unknown>): boolean {
	return req.url.includes(API_COMMON_ENDPOINTS.HEALTH_CHECK);
}
