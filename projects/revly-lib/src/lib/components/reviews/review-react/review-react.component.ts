import { Component, inject, input, linkedSignal, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseComponent } from '@revlib/components/base.component';
import { ReviewDto, ReviewReactPostReqDto } from '@revlib/models';
import { ApplicationActions, selectApplicationProp, AppState } from '@revlib/store';

import { Router } from '@angular/router';
import { getFirstErrorMessage } from '@revlib/utils';
import { catchError, finalize, of } from 'rxjs';
import { AUTH_QUERY_PARAMS } from '../../../models/params/auth.query-params';
import { ReviewReactService } from '../../../services/review/review-react.service';
import { Store } from '@ngrx/store';

interface ReviewReactState {
	helpfulCount: number;
	notHelpfulCount: number;
	myReaction: boolean | null | undefined;
}

@Component({
	selector: 'revlib-review-react',
	standalone: true,
	imports: [MatButtonModule, MatIconModule, MatTooltipModule],
	templateUrl: './review-react.component.html',
	styleUrl: './review-react.component.scss'
})
export class ReviewReactComponent extends BaseComponent implements OnDestroy {
	review = input.required<ReviewDto>();
	readonly businessId = input.required<string>();
	readonly isBusinessOwner = input.required<boolean>();

	#reviewReactService = inject(ReviewReactService);
	private store = inject(Store<AppState>);
	private isAuth = this.store.selectSignal(selectApplicationProp('isAuthenticated'));
	private router = inject(Router);
	// Local state for optimistic UI updates
	myReaction = linkedSignal(() => this.review().myReaction);
	helpfulCount = linkedSignal(() => this.review().helpfulCount);
	notHelpfulCount = linkedSignal(() => this.review().notHelpfulCount);

	ngOnDestroy(): void {
		// cleanup handled by BaseComponent subscriptions container
		this.subscriptions.unsubscribe();
	}

	onReact(isHelpful: boolean) {
		if (this.isBusinessOwner()) return;
		if (this.review().isMyReview) return;
		if (this.isLoading()) return;
		if (!this.isAuth()) {
			this.goToLogin();
			return;
		}
		const previousState: ReviewReactState = {
			helpfulCount: this.helpfulCount(),
			notHelpfulCount: this.notHelpfulCount(),
			myReaction: this.myReaction()
		};

		this.applyOptimisticUpdate(isHelpful);
		this.isLoading.set(true);

		const dto: ReviewReactPostReqDto = {
			businessId: this.businessId(),
			reviewId: this.review().id,
			isHelpful
		};

		const sub = this.#reviewReactService
			.postReact(dto)
			.pipe(
				catchError((error) => {
					this.revertState(previousState);
					const firstErrorMessage = getFirstErrorMessage(error);
					this.store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
						})
					);
					return of(null);
				}),
				finalize(() => {
					this.isLoading.set(false);
				})
			)
			.subscribe();

		this.subscriptions.add(sub);
	}

	goToLogin() {
		this.router.navigate(['/auth/login'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.router.url }
		});
	}

	private applyOptimisticUpdate(isHelpful: boolean) {
		const currentReaction = this.myReaction();

		// FIXED: Explicitly check for null/undefined to identify "no reaction"
		// Note: the double equals catches both null and undefined
		if (currentReaction == null) {
			// Initial reaction post/set
			this.myReaction.set(isHelpful);
			if (isHelpful) {
				this.helpfulCount.update((c) => c + 1);
			} else {
				this.notHelpfulCount.update((c) => c + 1);
			}
			return;
		}

		// Undo same reaction
		if (currentReaction === isHelpful) {
			this.myReaction.set(null);
			if (isHelpful) {
				this.helpfulCount.update((c) => Math.max(0, c - 1));
			} else {
				this.notHelpfulCount.update((c) => Math.max(0, c - 1));
			}
		}
		// Switch opposite reaction
		else {
			this.myReaction.set(isHelpful);
			if (isHelpful) {
				this.helpfulCount.update((c) => c + 1);
				this.notHelpfulCount.update((c) => Math.max(0, c - 1));
			} else {
				this.notHelpfulCount.update((c) => c + 1);
				this.helpfulCount.update((c) => Math.max(0, c - 1));
			}
		}
	}

	private revertState(state: ReviewReactState) {
		this.helpfulCount.set(state.helpfulCount);
		this.notHelpfulCount.set(state.notHelpfulCount);
		this.myReaction.set(state.myReaction);
	}
}
