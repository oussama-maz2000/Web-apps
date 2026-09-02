import { BusinessClaimStatus } from './business-claim.status';

import { ClaimRejectionReason } from './claim-rejection-reason';

export interface BusinessClaimDto {
	id: string;
	businessId: string;
	verificationPhone: string;
	status: BusinessClaimStatus;
	createdAt: string;
	lastStatusUpdateAt?: string;
	rejectionReason: ClaimRejectionReason | null;
	rejectionNote: string | null;
}
