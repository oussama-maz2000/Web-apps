import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReviewDisplayComponent } from '@revlib/components/reviews/review-display/review-display.component';
import { ReviewFormComponent } from '@revlib/components/reviews/review-form/review-form.component';
import { ReviewDto, ReviewPostReqDto } from '@revlib/models';
import { ReviewService } from '@revlib/services';
import { ApplicationActions, AppState, selectApplicationProp, selectUserProp } from '@revlib/store';
import { getFirstErrorMessage } from '@revlib/utils';
import { catchError, finalize, of, tap } from 'rxjs';
import { BusinessReviewsResolveData } from '../../../../../revly-lib/src/lib/graphql/models/businessReviews.model';
import { GraphQLEdge, PageInfo } from '../../../../../revly-lib/src/lib/graphql/models/graphql.models';
import { AUTH_QUERY_PARAMS } from '../../../../../revly-lib/src/lib/models/params/auth.query-params';
import { Business } from '../../../../../revly-lib/src/lib/models/responses/business.model';
import { BusinessDetailsComponent } from '../../components/business-claim/business-details/business-details.component';
import { ReviewsComponent } from '../../components/business-claim/business-reviews/business-reviews.component';

@Component({
	selector: 'app-business',
	standalone: true,
	imports: [
		CommonModule,
		BusinessDetailsComponent,
		ReviewsComponent,
		ReviewDisplayComponent,
		ReviewFormComponent
	],
	templateUrl: './business.component.html'
})
export class BusinessComponent {
	business: WritableSignal<Business | null> = signal(null);
	reviews: WritableSignal<GraphQLEdge<ReviewDto>[]> = signal([]);
	ownReviews: WritableSignal<ReviewDto | null> = signal(null);
	pageInfo: WritableSignal<PageInfo | null> = signal(null);
	private route = inject(ActivatedRoute);
	#reviewService = inject(ReviewService);
	readonly #router = inject(Router);

	deleting = signal(false);
	posting = signal(false);
	readonly #store = inject(Store<AppState>);
	private ownedBusinessIds = this.#store.selectSignal(selectUserProp('ownedBusinessesIds'));
	protected isAuthenticated = this.#store.selectSignal(selectApplicationProp('isAuthenticated'));
	protected isVerified = this.#store.selectSignal(selectUserProp('isVerified'));
	private cdr = inject(ChangeDetectorRef);

	protected isOwner = computed(() => {
		const ids = this.ownedBusinessIds() ?? [];
		const bizId = this.business()?.id;
		return !!bizId && ids.includes(bizId);
	});
	readonly #destroyRef = inject(DestroyRef);

	constructor() {
		const resolved = this.route.snapshot.data['data'] as BusinessReviewsResolveData;

		if (!resolved?.details || !resolved?.reviews) {
			return;
		}

		const reactions = resolved.reactions ?? [];

		const updatedEdges: GraphQLEdge<ReviewDto>[] = resolved.reviews.edges.map((edge) => {
			const reaction = reactions.find((r) => r.reviewId === edge.node.id);

			return {
				...edge,
				node: {
					...edge.node,
					myReaction: reaction ? reaction.isHelpful : null
				}
			};
		});

		this.business.set(resolved.details);
		this.reviews.set(updatedEdges);
		this.pageInfo.set(resolved.reviews.pageInfo);
		this.ownReviews.set(resolved.businessReviews);
	}

	onDeleteReviewHandler() {
		this.deleting.set(true);
		if (!this.ownReviews()?.id || !this.business()?.id) {
			this.deleting.set(false);
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
				})
			);

			return;
		}
		this.#reviewService
			.deleteReview({
				reviewId: this.ownReviews()!.id,
				businessId: this.business()!.id
			})
			.pipe(
				tap(() => {
					this.ownReviews.set(null);
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Avis supprimé avec succès'
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
				}),
				takeUntilDestroyed(this.#destroyRef)
			)
			.subscribe();
	}

	onSubmitReview(review: ReviewPostReqDto) {
		this.posting.set(true);
		this.#reviewService
			.postReview(review)
			.pipe(
				tap((res) => {
					if (res.isSucceeded && res.value) {
						this.ownReviews.set(res.value);
						const successMessage = res.success?.message || 'Avis publié avec succès';
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: successMessage
							})
						);
					}
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
					this.posting.set(false);
					this.cdr.detectChanges();
				}),
				takeUntilDestroyed(this.#destroyRef)
			)

			.subscribe();
	}

	goToLogin() {
		this.#router.navigate(['/auth/login'], {
			queryParams: { [AUTH_QUERY_PARAMS.RETURN_URL]: this.#router.url }
		});
	}
}
