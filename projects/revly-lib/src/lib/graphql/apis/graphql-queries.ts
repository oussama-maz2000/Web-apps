import { GraphqlQuery } from '../models/graphql.models';

export const GRAPHQL_QUERIES = {
	BizDetailsPage: { queryId: 'BizDetailsPage', isPaginated: false },
	BizReviews: { queryId: 'BizReviews', isPaginated: true },
	MyReviewForBusiness: { queryId: 'MyReviewForBusiness', isPaginated: false },
	SearchBusinesses: { queryId: 'SearchBusinesses', isPaginated: true },
	UserReactionsByReviewIds: { queryId: 'UserReactionsByReviewIds', isPaginated: false },
	GetTopBizsCardByWilaya: { queryId: 'GetTopBizsCardByWilaya', isPaginated: true },
	GetTop10BizByCatState: { queryId: 'GetTop10BizByCatState', isPaginated: true },
	RecentReviewsLanding: { queryId: 'RecentReviewsLanding', isPaginated: false }
} satisfies Record<string, GraphqlQuery>;
