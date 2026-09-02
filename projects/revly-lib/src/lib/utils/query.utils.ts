import { HttpParams } from '@angular/common/http';

export function buildQueryParams(queryParams?: Record<string, string | number | boolean>): HttpParams | undefined {
	if (!queryParams) return undefined;
	return Object.entries(queryParams)
		.filter(([, value]) => value != null)
		.reduce((httpParams, [key, value]) => httpParams.set(key, value), new HttpParams());
}
