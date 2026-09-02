import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewStarsComponent } from '@revlib/components/reviews/review-stars/review-stars.component';
import { AvatarComponent } from '@revlib/components/shared/avatar/avatar.component';
import { Rating, RecentReviewDto } from '@revlib/models';
import { catchError, of, tap } from 'rxjs';
import { GRAPHQL_QUERIES } from '../../../../../../revly-lib/src/lib/graphql/apis/graphql-queries';
import { GraphQLClientService } from '../../../../../../revly-lib/src/lib/graphql/service/graphqlClient.service';
import { buildImageUrl } from '@revlib/utils';

@Component({
	selector: 'app-recent-reviews',
	standalone: true,
	imports: [CommonModule, ReviewStarsComponent, AvatarComponent],
	templateUrl: './recent-reviews.component.html'
})
export class RecentReviewsComponent implements OnInit {
	// Inject GraphQL service and DestroyRef for clean subscription management
	private graphClientService = inject(GraphQLClientService);
	private destroy = inject(DestroyRef);
	protected readonly buildImageUrl = buildImageUrl;

	// Signal to store the reviews
	reviews = signal<RecentReviewDto[]>([]);

	ngOnInit() {
		this.loadRecentReviews();
	}

	private loadRecentReviews(): void {
		const queryConfig = {
			queryId: GRAPHQL_QUERIES.RecentReviewsLanding.queryId,
			isPaginated: GRAPHQL_QUERIES.RecentReviewsLanding.isPaginated
		};

		this.graphClientService
			.queryWithNoParam(queryConfig)
			.pipe(
				tap((res: any) => {
					const nodes = res.data?.recentReviews || [];
					this.reviews.set(nodes);
				}),
				catchError(() => {
					return of(null);
				}),
				takeUntilDestroyed(this.destroy)
			)
			.subscribe();
	}

	/**
	 * Converts numeric rating to our strict Rating type (0-5)
	 */
	safeRating(val: number): Rating {
		return (val >= 0 && val <= 5 ? Math.round(val) : 0) as Rating;
	}
}
