export interface ReviewerDto {
	name: string;
	profilePictureUrl: string | null;
}

export interface RecentReviewDto {
	id: string;
	rating: number;
	reviewerId: string;
	text: string;
	reviewer: ReviewerDto;
}

export interface RecentReviewDtoResponse {
	data: {
		recentReviews: RecentReviewDto[];
	};
}
