import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthEmailFacade } from '../../../facades/auth/auth-email-facade.service';
import { emailPatternValidator, passwordValidators, sameAsCurrentValidator } from '../../../utils/validators';
import { BaseComponent } from '../../base.component';
import { BackendResultComponent } from '../../shared/backend-result.component';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
	selector: 'app-revlib-email-change',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		BackendResultComponent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		PasswordFieldComponent,
		MatExpansionPanel,
		MatExpansionPanelHeader,
		MatExpansionPanelTitle
	],
	templateUrl: './email-change.component.html'
})
export class EmailChangeComponent extends BaseComponent implements OnInit, OnDestroy {
	currentEmail = input.required<string | undefined>();

	readonly #AuthEmailFacade = inject(AuthEmailFacade);
	readonly #fb = inject(FormBuilder);

	emailChangeForm!: FormGroup;
	get emailControl() {
		return this.emailChangeForm.get('newEmail');
	}
	get passwordControl() {
		return this.emailChangeForm.get('currentPassword');
	}

	//#region Lifecycle Hooks
	ngOnInit(): void {
		this.initForm();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
	//#endaregion

	private initForm(): void {
		this.emailChangeForm = this.#fb.group({
			newEmail: [
				'',
				[
					Validators.required,
					Validators.email,
					emailPatternValidator,
					sameAsCurrentValidator(this.currentEmail())
				]
			],
			currentPassword: ['', passwordValidators]
		});
	}

	onSubmit() {
		if (!this.emailChangeForm.valid || this.isLoading()) return;

		this.isLoading.set(true);
		this.errorResult.set(null);
		this.successMessage.set(null);

		const changeEmailSub = this.#AuthEmailFacade
			.changeEmail$(this.emailChangeForm.value.newEmail, this.emailChangeForm.value.currentPassword)
			.subscribe({
				next: (result) => {
					if (result.isSucceeded) this.successMessage.set(result?.success?.message as string);
				},
				error: (error) => {
					this.errorResult.set(error);
					this.isLoading.set(false);
				},
				complete: () => {
					this.isLoading.set(false);
				}
			});

		this.subscriptions.add(changeEmailSub);
	}

	reset(): void {
		this.emailChangeForm.reset();
		this.errorResult.set(null);
		this.successMessage.set(null);
	}
}
