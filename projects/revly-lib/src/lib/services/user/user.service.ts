import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientApi } from '../../../public-api';
import { API_USER_ENDPOINTS } from '../../core/api/api-user-endpoints';
import { Result } from '../../models/common/result';
import { UpdateUserProfileReqDto } from '../../models/requests/auth.models';
import { UserDto } from '../../models/responses/userDto.model';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private readonly httpClientApi = inject(HttpClientApi);
	/**
	 * Update user profile
	 */
	updateUserProfile$(data: UpdateUserProfileReqDto): Observable<Result<UserDto>> {
		return this.httpClientApi.processRequest$(API_USER_ENDPOINTS.UPDATE_USER_PROFILE, { body: data });
	}

	getUserProfile$(): Observable<Result<UserDto>> {
		return this.httpClientApi.processRequest$(API_USER_ENDPOINTS.GET_USER_PROFILE);
	}

	uploadProfilePicture$(formData: FormData): Observable<Result<string>> {
		return this.httpClientApi.processRequest$(API_USER_ENDPOINTS.UPLOAD_USER_PROFILE_IMAGE, {
			body: formData
		});
	}
}
