import { Pipe, PipeTransform } from '@angular/core';
import { BusinessClaimStatus } from '../../models/types/business-claim.status';

@Pipe({ name: 'businessClaimStatusLabel', standalone: true })
export class BusinessClaimStatusLabelPipe implements PipeTransform {
	transform(status: BusinessClaimStatus): string {
		switch (status) {
			case BusinessClaimStatus.PendingModeration:
				return 'En attente de modération';

			case BusinessClaimStatus.InReview:
				return "En cours d'examen";

			case BusinessClaimStatus.AwaitingOtpVerification:
				return 'En attente de vérification OTP';

			case BusinessClaimStatus.Verified:
				return 'Vérifiée et approuvée';

			case BusinessClaimStatus.Rejected:
				return 'Rejetée';

			case BusinessClaimStatus.CanceledByClaimer:
				return 'Annulée par le demandeur';

			case BusinessClaimStatus.Expired:
				return 'Expirée';

			default:
				return 'Inconnu';
		}
	}
}
