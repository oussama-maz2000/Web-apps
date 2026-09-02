import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MyErrorStateMatcher } from '../../../utils/my-error-state-matcher';

@Component({
	selector: 'app-revlib-password-field',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatButtonModule
	],
	templateUrl: './password-field.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	viewProviders: [
		{
			provide: ControlContainer,
			useFactory: () => inject(ControlContainer, { skipSelf: true })
		}
	]
	/*This enables the component to connect to its parent form context, which is essential for custom form controls or nested form components. */
})
export class PasswordFieldComponent {
	//#region Inputs
	readonly controlName = input<string>('password');
	readonly label = input<string>('Entrez votre mot de passe');
	readonly appearance = input<'fill' | 'outline'>('fill');
	readonly fullWidth = input<boolean>(false);
	//#endregion
	private readonly controlContainer = inject(ControlContainer);

	hidePassword = signal<boolean>(true);
	readonly instantMatcher = new MyErrorStateMatcher();

	get form(): FormGroup {
		return this.controlContainer.control as FormGroup;
	}

	get control() {
		return this.form.get(this.controlName());
	}

	togglePasswordVisibility(): void {
		this.hidePassword.update((value) => !value);
	}
}
