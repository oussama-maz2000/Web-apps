import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { AUTH_PATHS } from '../../../core/routes/auth.routes';
import { AuthRecoveryFacade } from '../../../facades/auth/auth-recovery-facade.service';
import { emailPatternValidator } from '../../../utils/validators';
import { BaseComponent } from '../../base.component';

@Component({
	selector: 'app-revlib-forgot-password',
	imports: [...COMMON_IMPORTS, ReactiveFormsModule, MatIconModule, MatInputModule, MatButtonModule],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './forgot-password.component.html',
	styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent extends BaseComponent implements OnDestroy {
	//#region Dependency injection
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);
	private readonly authRecoveryFacade = inject(AuthRecoveryFacade);
	//#endregion

	//#region Properties
	// Form controls
	forgetPasswordForm!: FormGroup;

	//#region Getters
	get emailControl() {
		return this.forgetPasswordForm.get('email');
	}
	//#endregion

	constructor() {
		super();
		this.initForm();
	}

	ngOnDestroy(): void {
		this.subscriptions?.unsubscribe();
	}

	private initForm(): void {
		this.forgetPasswordForm = this.fb.group({
			email: ['', [Validators.required, Validators.email, emailPatternValidator]]
		});
	}

	onSubmit(): void {
		if (this.forgetPasswordForm.invalid || this.isLoading()) return;

		this.errorResult.set(null);
		this.successMessage.set(null);
		this.isLoading.set(true);

		const forgotPassword$ = this.authRecoveryFacade.forgotPassword$(this.emailControl?.value).subscribe({
			next: (success) => {
				this.successMessage.set(success?.success?.message as string);
			},
			error: (error) => {
				this.isLoading.set(false);
				this.errorResult.set(error);
			},
			complete: () => {
				this.isLoading.set(false);
			}
		});

		this.subscriptions?.add(forgotPassword$);
	}

	goToLogin(): void {
		this.router.navigate([AUTH_PATHS.LOGIN]);
	}
}
