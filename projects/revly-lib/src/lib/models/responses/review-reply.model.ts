export interface ReviewReplyDto {
	id: string;
	reviewId: string;
	text: string;
	createdAt: string;
	//editedAt: string; //future
	businessName: string;
}
