import { ClaimRejectionReason } from '../../../models/types/claim-rejection-reason';

export interface BizModClaimReviewReqDto {
	claimId: string;
	action: ClaimModerationAction;
	rejectionReason: ClaimRejectionReason;
	rejectionNote?: string | null;
}

export enum ClaimModerationAction {
	Approve = 0,
	Reject = 1
}
