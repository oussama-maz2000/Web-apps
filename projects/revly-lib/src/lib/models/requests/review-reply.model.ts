export interface ReviewReplyPostReqDto {
	businessId: string;
	reviewId: string;
	text: string;
}

export interface ReviewReplyDeleteReqDto {
	businessId: string;
	reviewId: string;
}
