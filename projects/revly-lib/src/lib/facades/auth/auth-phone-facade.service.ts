import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Result } from '../../models/common/result';
import { PhoneNumChangeDto, PhoneNumDto, ValidateSmsOtpReqDto } from '../../models/requests/auth-phone.models';
import { isPhoneNumDto } from '../../models/responses/auth-type-guards';
import { AuthPhoneService } from '../../services/auth/phone/auth-phone.service';
import { IdentityStateService } from '../../state/identity-state.service';
import { isResultOfType } from '../../utils/result-utils';
import { UserDto } from '../../models/responses/userDto.model';

@Injectable({
	providedIn: 'root'
})
export class AuthPhoneFacade {
	readonly #identityStateService = inject(IdentityStateService);
	readonly #authPhoneService = inject(AuthPhoneService);

	add$(phoneNumber: string): Observable<Result> {
		const payload: PhoneNumDto = { phoneNumber };
		return this.#authPhoneService.add$(payload);
	}

	confirmOtp$(phoneNumber: string, otp: string): Observable<Result | Result<PhoneNumDto | number>> {
		const payload: ValidateSmsOtpReqDto = { phoneNumber, otp };
		return this.#authPhoneService
			.confirm$(payload)
			.pipe(switchMap((result) => this.handleConfirmOtpResponse$(result)));
	}

	resendOtp$(): Observable<Result> {
		return this.#authPhoneService.resendVerificaion$();
	}

	change$(newPhoneNumber: string, password: string): Observable<Result> {
		const payload: PhoneNumChangeDto = { phoneNumber: newPhoneNumber, password };
		return this.#authPhoneService.change$(payload);
	}

	//#region private methods

	private handleConfirmOtpResponse$(
		result: Result | Result<number | PhoneNumDto>
	): Observable<Result | Result<PhoneNumDto | number>> {
		// Handle successful otp confirmation
		if (isResultOfType(result, isPhoneNumDto))
			return this.handleSuccessfullOtpConfirmation$(result as Result<PhoneNumDto>);

		return of(result);
	}

	private handleSuccessfullOtpConfirmation$(result: Result<PhoneNumDto>): Observable<Result<PhoneNumDto>> {
		const updates: Partial<UserDto> = {
			phoneNumber: result.value?.phoneNumber,
			isVerified: true
		};
		this.#identityStateService.updateUserProfile(updates);

		return of(result);
	}
	//#endregion

	/*
    //disabled in purpose
        deletePhone$(): Observable<Result>
        {
            return this.#authPhoneService.deletePhone$();
        }
    */
}
