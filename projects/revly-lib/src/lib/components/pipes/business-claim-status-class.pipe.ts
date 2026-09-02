// src/lib/pipes/business-claim-status-class.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { BusinessClaimStatus } from '../../models/types/business-claim.status';

@Pipe({ name: 'businessClaimStatusClass', standalone: true })
export class BusinessClaimStatusClassPipe implements PipeTransform {
	transform(status: BusinessClaimStatus): string {
		switch (status) {
			case BusinessClaimStatus.PendingModeration:
				return 'bg-blue-100 text-blue-800';

			case BusinessClaimStatus.InReview:
				return 'bg-purple-100 text-purple-800';

			case BusinessClaimStatus.AwaitingOtpVerification:
				return 'bg-orange-100 text-orange-800';

			case BusinessClaimStatus.Verified:
				return 'bg-green-100 text-green-800';

			case BusinessClaimStatus.Rejected:
				return 'bg-red-100 text-red-800';

			case BusinessClaimStatus.CanceledByClaimer:
				return 'bg-gray-100 text-gray-800';

			case BusinessClaimStatus.Expired:
				return 'bg-gray-200 text-gray-700';

			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
}
