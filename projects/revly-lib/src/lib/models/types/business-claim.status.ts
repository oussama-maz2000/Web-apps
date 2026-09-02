export enum BusinessClaimStatus {
	PendingModeration = 1,
	InReview = 2,
	AwaitingOtpVerification = 3,
	Verified = 4,
	Rejected = 5,

	CanceledByClaimer = 10,
	Expired = 11
}
