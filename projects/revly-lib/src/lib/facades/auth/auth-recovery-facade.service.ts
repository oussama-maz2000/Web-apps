import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../models/common/result';
import { EmailDto } from '../../models/requests/auth-email.models';
import { ChangePasswordReqDto, PasswordResetReqDto } from '../../models/requests/auth-recovery.models';
import { AuthRecoveryService } from '../../services/auth/recovery/auth-recovery.service';

@Injectable({
	providedIn: 'root'
})
export class AuthRecoveryFacade {
	readonly #authRecoveryService = inject(AuthRecoveryService);

	forgotPassword$(emailAddress: string): Observable<Result> {
		const payload: EmailDto = { emailAddresse: emailAddress };
		return this.#authRecoveryService.forgotPassword$(payload);
	}

	resetPassword$(email: string, newPassword: string, token: string): Observable<Result> {
		const payload: PasswordResetReqDto = {
			email: email,
			newPassword: newPassword,
			token: token
		};

		return this.#authRecoveryService.resetPassword$(payload);
	}

	changePassword$(payload: ChangePasswordReqDto): Observable<Result> {
		return this.#authRecoveryService.changePassword$(payload);
	}
}
