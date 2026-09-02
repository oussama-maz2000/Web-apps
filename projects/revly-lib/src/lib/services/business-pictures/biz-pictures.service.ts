import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BIZ_PICTURES_ENDPOINTS } from '../../core/api/api-biz-pictures-endpoints';
import { HttpClientApi } from '../../core/internal/http-client/http-client-api.service';
import { Result } from '../../models/common/result';
import { BizPicturesResponseDto, DeletePictureReqDto, SetProfilePictureReqDto } from '@revlib/models';

@Injectable({
	providedIn: 'root'
})
export class BizPicturesService {
	readonly #httpClient = inject(HttpClientApi);

	uploadPictures(businessEncId: string, files: File[]): Observable<Result<BizPicturesResponseDto>> {
		const formData = new FormData();
		formData.append('businessEncId', businessEncId);
		files.forEach((file) => {
			formData.append('files', file);
		});
		return this.#httpClient.processRequest$<BizPicturesResponseDto>(API_BIZ_PICTURES_ENDPOINTS.UPLOAD, {
			body: formData
		});
	}

	deletePicture(data: DeletePictureReqDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_BIZ_PICTURES_ENDPOINTS.DELETE, { body: data });
	}

	setProfilePicture(data: SetProfilePictureReqDto): Observable<Result<void>> {
		return this.#httpClient.processRequest$<void>(API_BIZ_PICTURES_ENDPOINTS.SET_PROFILE_PICTURE, {
			body: data
		});
	}
}
