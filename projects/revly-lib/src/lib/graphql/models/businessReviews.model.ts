import { ReviewDto } from '@revlib/models';
import { Business } from '../../models/responses/business.model';
import { GraphQLEdge, PageInfo } from './graphql.models';
import { ReviewReaction } from './reviewGql.model';

export interface BusinessReviewsResolveData {
	details: Business;
	reviews: {
		edges: GraphQLEdge<ReviewDto>[];
		pageInfo: PageInfo;
	};
	businessReviews: ReviewDto | null;
	reactions: ReviewReaction[] | null;
}
