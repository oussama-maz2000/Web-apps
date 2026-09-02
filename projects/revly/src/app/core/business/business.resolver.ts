import { inject, makeStateKey, TransferState } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReviewDto } from '@revlib/models';
import { ApplicationActions, AppState, selectApplicationProp } from '@revlib/store';

import { catchError, EMPTY, forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { GRAPHQL_QUERIES } from '../../../../../revly-lib/src/lib/graphql/apis/graphql-queries';
import { BusinessDetailsResponse } from '../../../../../revly-lib/src/lib/graphql/models/businessGql.model';
import { BusinessReviewsResolveData } from '../../../../../revly-lib/src/lib/graphql/models/businessReviews.model';
import { GraphQLResponse } from '../../../../../revly-lib/src/lib/graphql/models/graphql.models';
import {
	OwnReviewsResponse,
	ReviewReaction,
	ReviewsOfBusinessResponse
} from '../../../../../revly-lib/src/lib/graphql/models/reviewGql.model';
import { GraphQLClientService } from '../../../../../revly-lib/src/lib/graphql/service/graphqlClient.service';
import { Business } from '../../../../../revly-lib/src/lib/models/responses/business.model';

export const businessReviewsResolver: ResolveFn<BusinessReviewsResolveData> = (route) => {
	const id = route.paramMap.get('id');
	if (!id) {
		throw new Error('id route param is missing');
	}
	const transferState = inject(TransferState);
	const graphqlClient = inject(GraphQLClientService);
	const store = inject(Store<AppState>);
	const router = inject(Router);

	const stateKey = makeStateKey<BusinessReviewsResolveData>(`business-data-${id}`);

	const cachedData = transferState.get(stateKey, null);
	if (cachedData) {
		transferState.remove(stateKey);
		return of(cachedData);
	}

	const isAuth$ = store.select(selectApplicationProp('isAuthenticated'));

	const getDetailsBusiness$: Observable<Business> = graphqlClient
		.query<BusinessDetailsResponse>(
			{
				queryId: GRAPHQL_QUERIES['BizDetailsPage'].queryId,
				isPaginated: GRAPHQL_QUERIES['BizDetailsPage'].isPaginated
			},
			{
				optionalParam: { key: 'bizId', value: id }
			}
		)
		.pipe(map((res) => res.data.businessDetailsById));

	const getBusinessReviews$: Observable<BusinessReviewsResolveData['reviews']> = graphqlClient
		.query<ReviewsOfBusinessResponse>(
			{
				queryId: GRAPHQL_QUERIES['BizReviews'].queryId,
				isPaginated: GRAPHQL_QUERIES['BizReviews'].isPaginated
			},
			{
				pagination: { first: 10 },
				order: [{ key: 'id', orderOperator: 'DESC' }],
				optionalParam: { key: 'bizId', value: id }
			}
		)
		.pipe(
			map((res) => ({
				edges: res.data.reviewsOfBusiness.edges,
				pageInfo: res.data.reviewsOfBusiness.pageInfo!
			}))
		);

	const getOwnReviews$: Observable<ReviewDto | null> = graphqlClient
		.query<OwnReviewsResponse>(
			{
				queryId: GRAPHQL_QUERIES['MyReviewForBusiness'].queryId,
				isPaginated: GRAPHQL_QUERIES['MyReviewForBusiness'].isPaginated
			},
			{
				optionalParam: { key: 'bizId', value: id }
			}
		)
		.pipe(map((res) => res.data.myReviewForBusiness));

	const businessReviews$: Observable<ReviewDto | null> = isAuth$.pipe(
		take(1),
		switchMap((isAuth) => (isAuth ? getOwnReviews$ : of(null)))
	);

	const getReviewReactions$ = (
		reviewsId: string[]
	): Observable<GraphQLResponse<'userReactionsByReviewIds', ReviewReaction[]>> => {
		return isAuth$.pipe(
			take(1),
			switchMap((isAuth) => {
				if (isAuth) {
					return graphqlClient.query<GraphQLResponse<'userReactionsByReviewIds', ReviewReaction[]>>(
						{
							queryId: GRAPHQL_QUERIES['UserReactionsByReviewIds'].queryId,
							isPaginated: GRAPHQL_QUERIES['UserReactionsByReviewIds'].isPaginated
						},
						{
							optionalParam: { key: 'reviewsIds', value: reviewsId }
						}
					);
				} else {
					return of({ data: { userReactionsByReviewIds: [] } });
				}
			})
		);
	};

	return getBusinessReviews$.pipe(
		switchMap((reviews) => {
			const reviewIds = reviews.edges.map((edge) => edge.node.id);
			return forkJoin({
				details: getDetailsBusiness$,
				reviews: of(reviews),
				businessReviews: businessReviews$,
				reactions:
					reviewIds.length > 0
						? getReviewReactions$(reviewIds).pipe(map((res) => res.data.userReactionsByReviewIds))
						: of([])
			});
		}),
		tap((data) => {
			transferState.set(stateKey, data);
		}),
		catchError(() => {
			store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
				})
			);
			router.navigate(['/search']);
			return EMPTY;
		})
	) as Observable<BusinessReviewsResolveData>;
};
