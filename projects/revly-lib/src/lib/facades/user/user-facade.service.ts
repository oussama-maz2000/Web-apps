import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../models/common/result';
import { UpdateUserProfileReqDto } from '../../models/requests/auth.models';
import { UserDto } from '../../models/responses/userDto.model';
import { UserService } from '../../services/user/user.service';

@Injectable({
	providedIn: 'root'
})
export class UserFacade {
	readonly #userService = inject(UserService);

	updateUserProfile$(userUpdateProfile: UpdateUserProfileReqDto): Observable<Result<UserDto>> {
		return this.#userService.updateUserProfile$(userUpdateProfile);
	}

	uploadUserProfilePicture$(file: File): Observable<Result<string>> {
		const formData = new FormData();
		formData.append('file', file);
		return this.#userService.uploadProfilePicture$(formData);
	}
}
