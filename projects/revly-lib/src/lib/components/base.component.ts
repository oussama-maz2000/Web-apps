import { signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Result } from '../models/common/result';

export abstract class BaseComponent {
	isLoading = signal<boolean>(false);

	//Response
	errorResult = signal<Result | Result<unknown> | null>(null);
	successMessage = signal<string | null>(null);

	//subscriptions cleanup management
	subscriptions: Subscription = new Subscription();

	constructor() {
		this.isLoading.set(false);
	}
}
