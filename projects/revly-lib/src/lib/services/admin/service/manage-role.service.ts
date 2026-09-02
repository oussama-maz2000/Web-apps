import { inject, Injectable } from '@angular/core';
import { HttpClientApi } from '@revlib/core';
import { Result } from '@revlib/models';
import { Observable } from 'rxjs';
import { API_ROLES_ENDPOINTS } from '../api/manage-role.api';
import { RoleOperationsReqDto } from '../model/app-role-type';
import { StaffUserDto } from '../model/StaffUserDto';

@Injectable({
	providedIn: 'root'
})
export class RoleManagementService {
	protected readonly httpClientApi = inject(HttpClientApi);

	getStaffList(): Observable<Result<StaffUserDto[]>> {
		return this.httpClientApi.processRequest$<StaffUserDto[]>(API_ROLES_ENDPOINTS.GET_STAFF_LIST);
	}

	addRoleToUser(roleUser: RoleOperationsReqDto): Observable<Result<StaffUserDto>> {
		return this.httpClientApi.processRequest$<StaffUserDto>(API_ROLES_ENDPOINTS.ADD_ROLE_USER, {
			body: roleUser
		});
	}

	removeRoleToUser(roleUser: RoleOperationsReqDto): Observable<Result<StaffUserDto>> {
		return this.httpClientApi.processRequest$<StaffUserDto>(API_ROLES_ENDPOINTS.REMOVE_ROLE_USER, {
			body: roleUser
		});
	}
}
