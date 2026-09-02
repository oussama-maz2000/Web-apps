import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../models/common/result';
import {
	ChangeEmailReqDto,
	ConfirmEmailChangeReqDto,
	ConfirmEmailReqDto,
	EmailDto
} from '../../models/requests/auth-email.models';
import { AuthEmailService } from '../../services/auth/email/auth-email.service';

@Injectable({
	providedIn: 'root'
})
export class AuthEmailFacade {
	readonly #authEmailService = inject(AuthEmailService);

	confirmEmail$(userIdEnc: string, token: string): Observable<Result> {
		const payload: ConfirmEmailReqDto = { userIdEnc, token };
		return this.#authEmailService.confirm$(payload);
	}

	resendConfirmation$(emailAddresse: string): Observable<Result> {
		const payload: EmailDto = { emailAddresse };
		return this.#authEmailService.resendConfirmation$(payload);
	}

	changeEmail$(newEmail: string, currentPassword: string): Observable<Result> {
		const payload: ChangeEmailReqDto = { newEmail, currentPassword };
		return this.#authEmailService.changeEmail$(payload);
	}

	confirmChangeEmail$(oldEmail: string, newEmail: string, token: string): Observable<Result> {
		const payload: ConfirmEmailChangeReqDto = { oldEmail, newEmail, token };
		return this.#authEmailService.confirmChangeEmail$(payload);
	}
}
