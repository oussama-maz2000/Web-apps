import { inject, Injectable } from '@angular/core';
import { HttpClientApi } from '@revlib/core';
import { Result } from '@revlib/models';
import { Observable } from 'rxjs';
import { API_ACCESS_ENDPOINTS } from '../api/api-access-endpoint';

@Injectable({
	providedIn: 'root'
})
export class AccessControlService {
	protected readonly httpClientApi = inject(HttpClientApi);
	isStaff(): Observable<Result<string[]>> {
		return this.httpClientApi.processRequest$<string[]>(API_ACCESS_ENDPOINTS.IS_STAFF);
	}
}
