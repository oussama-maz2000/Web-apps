import { Pipe, PipeTransform } from '@angular/core';
import { ClaimRejectionReason } from '../../models/types/claim-rejection-reason';

@Pipe({ name: 'claimRejectionReasonLabel', standalone: true })
export class ClaimRejectionReasonLabelPipe implements PipeTransform {
	transform(reason: ClaimRejectionReason | null): string {
		switch (reason) {
			case ClaimRejectionReason.InsufficientDocumentation:
				return 'Documentation insuffisante';

			case ClaimRejectionReason.PhoneNumberMismatch:
				return 'Numéro de téléphone non correspondant';

			case ClaimRejectionReason.DuplicateClaim:
				return 'Demande dupliquée';

			case ClaimRejectionReason.InvalidOwnershipProof:
				return 'Preuve de propriété invalide';

			case ClaimRejectionReason.SuspiciousActivity:
				return 'Activité suspecte';

			case ClaimRejectionReason.IncorrectBusinessDetails:
				return 'Détails incorrects';

			case ClaimRejectionReason.Other:
				return 'Autre raison';

			default:
				return 'Raison inconnue';
		}
	}
}
