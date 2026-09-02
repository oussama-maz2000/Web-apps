import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_ENDPOINTS } from '../../core/api/api-auth-endpoints';
import { STORAGE_KEYS } from '../../core/internal/storage/storage-keys';
import { Result } from '../../models/common/result';
import { LoginReqDto } from '../../models/requests/auth.models';
import { SignupLoginResDto } from '../../models/responses/auth.models';
import { HttpClientApi } from '@revlib/core';
import { StorageCoreService } from '../../core/internal/storage/storage-core.service';

@Injectable({
	providedIn: 'root'
})
export class LoginService {
	readonly #httpClientApi = inject(HttpClientApi);
	readonly #storageCoreService = inject(StorageCoreService);

	/**
	 * Authenticates a user using username/password
	 */
	login$(payload: LoginReqDto): Observable<Result<SignupLoginResDto>> {
		return this.#httpClientApi.processRequest$<SignupLoginResDto>(API_AUTH_ENDPOINTS.LOGIN, {
			body: payload,
			queryParams: { useCookies: true }
		});
	}

	/**
	 * Clears the account recovery data
	 */
	clearAccountRecoveryData(): void {
		this.#storageCoreService.removeSessionItem(STORAGE_KEYS.RECOVERY_DATA);
	}
}
