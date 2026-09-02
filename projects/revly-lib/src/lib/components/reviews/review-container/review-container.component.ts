import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import { ReviewDto, ReviewPostReqDto, ReviewReplyDto } from '@revlib/models';
import { ReviewService } from '@revlib/services';
import { ReviewDisplayComponent } from '../review-display/review-display.component';
import { ReviewFormComponent } from '../review-form/review-form.component';

import { Store } from '@ngrx/store';
import { ApplicationActions, AppState } from '@revlib/store';
import { catchError, finalize, of, tap } from 'rxjs';
import { AUTH_QUERY_PARAMS } from '../../../models/params/auth.query-params';
import { IdentityStateService } from '../../../state/identity-state.service';
import { getFirstErrorMessage } from '../../../utils/result-utils';
import { BaseComponent } from '../../base.component';

@Component({
	selector: 'revlib-review',
	imports: [MatButtonModule, ReviewFormComponent, ReviewDisplayComponent],
	templateUrl: './review-container.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewContainerComponent extends BaseComponent implements OnDestroy {
	//DI
	#router = inject(Router);
	#identityState = inject(IdentityStateService);

	#reviewService = inject(ReviewService);
	readonly #store = inject(Store<AppState>);
	// Signals from IdentityStateService
	isAuthenticated = this.#identityState.isAuthenticated;
	isVerified = this.#identityState.isVerified;
	user = this.#identityState.user;

	canUserPostReview = computed(() => this.isAuthenticated() && this.isVerified() && !this.userReview());
	businessId = input.required<string>();
	loading = signal(false);
	posting = signal(false);
	deleting = signal(false);
	userReview = signal<ReviewDto | null>(null);
	userReviewReply = signal<ReviewReplyDto | null>(null);

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onSubmitReview(review: ReviewPostReqDto) {
		this.posting.set(true);
		const postReviewObs$ = this.#reviewService.postReview(review).subscribe({
			next: (res) => {
				if (res.isSucceeded && res.value) {
					this.userReview.set(res.value);
					const successMessage = res.success?.message;
					if (successMessage) {
						this.#store.dispatch(ApplicationActions.showSuccessSnackbar({ message: successMessage }));
					}
				}
			},
			error: (err) => {
				const msg = getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';

				this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message: msg }));
				this.posting.set(false);
			},
			complete: () => {
				this.posting.set(false);
			}
		});
		this.subscriptions.add(postReviewObs$);
	}

	onDeleteReviewHandler(reviewId: string) {
		this.deleting.set(true);
		const deleteReviewObs$ = this.#reviewService
			.deleteReview({
				reviewId: reviewId,
				businessId: this.businessId()
			})
			.pipe(
				tap((res) => {
					this.userReview.set(null);
					this.userReviewReply.set(null);
					const successMessage = res.success?.message || "Suppression de l'avis réussie";

					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: successMessage
						})
					);
				}),
				catchError((error) => {
					const firstErrorMessage = getFirstErrorMessage(error);
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
						})
					);

					return of(null);
				}),
				finalize(() => {
					this.deleting.set(false);
				})
			)

			.subscribe();

		this.subscriptions.add(deleteReviewObs$);
	}

	onReplyAdded(reply: ReviewReplyDto) {
		const currentReview = this.userReview();
		if (currentReview) {
			this.userReview.set({
				...currentReview,
				hasBusinessReply: true
			});
			this.userReviewReply.set(reply);
		}
	}

	onReplyDeleted() {
		const currentReview = this.userReview();
		if (currentReview) {
			this.userReview.set({
				...currentReview,
				hasBusinessReply: false
			});
			this.userReviewReply.set(null);
		}
	}

	goToLogin() {
		this.#router.navigate(['/auth/login'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.#router.url }
		});
	}

	goToPhoneVerify() {
		this.#router.navigate(['/auth/phone-verify'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.#router.url }
		});
	}
}
