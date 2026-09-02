import { ReviewDto } from '../../models/responses/review.model';
import { GraphQLConnection, GraphQLResponse } from './graphql.models';

export interface ReviewGql {
	cursor: string;
	node: ReviewDto;
}

export type ReviewReaction = {
	isHelpful: boolean;
	reviewId: string;
};
export type ReviewsOfBusinessResponse = GraphQLResponse<'reviewsOfBusiness', GraphQLConnection<ReviewDto>>;
export type OwnReviewsResponse = GraphQLResponse<'myReviewForBusiness', ReviewDto>;
