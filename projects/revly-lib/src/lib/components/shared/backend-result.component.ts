import { Component, input } from '@angular/core';
import { Result } from '../../models/common/result';

@Component({
	selector: 'app-revlib-backend-result',
	template: `
		@if (errorResult()?.errors?.length) {
			<ul class="server-errors">
				@for (error of errorResult()?.errors; track error) {
					<li class="error-message">{{ error.message }}</li>
				}
			</ul>
		}
		@if (successMessage()) {
			<ul class="server-success">
				<li class="success-message">{{ successMessage() }}</li>
			</ul>
		}
	`,
	standalone: true
})
export class BackendResultComponent {
	readonly errorResult = input<Result<unknown> | Result | null>(null);
	readonly successMessage = input<string | null>(null);
}
