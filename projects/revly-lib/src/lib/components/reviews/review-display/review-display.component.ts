import { DatePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	inject,
	input,
	linkedSignal,
	output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ExpandableTextComponent } from '@revlib/components/shared/expandable-text/expandable-text.component';
import { PriceRangeEnum, ReviewDto, ReviewReplyDto } from '@revlib/models';
import { filter, tap } from 'rxjs';
import { ReviewReplyDeleteDialogComponent } from '../../../../../../revly/src/app/components/delete-reply-dialog/review-reply-delete.dialog';
import { PRICE_RANGE_LABELS } from '../../../models/types/review.types';
import { buildImageUrl } from '../../../utils/image-helpers.utils';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { ReviewReactComponent } from '../review-react/review-react.component';
import { ReviewReplyComponent } from '../review-reply/review-reply.component';
import { ReviewStarsComponent } from '../review-stars/review-stars.component';

@Component({
	selector: 'revlib-review-display',
	imports: [
		DatePipe,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		ReviewStarsComponent,
		AvatarComponent,
		ReviewReactComponent,
		ReviewReplyComponent,
		ExpandableTextComponent
	],
	templateUrl: './review-display.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewDisplayComponent {
	review = input.required<ReviewDto>();
	reviewDto = linkedSignal(() => this.review());
	businessReply = input<ReviewReplyDto | null>(null);
	businessId = input.required<string>();
	businessName = input<string>();
	showDelete = input(false);
	isBusinessOwner = input.required<boolean>();
	readonly #dialog = inject(MatDialog);
	private destroyRef = inject(DestroyRef);
	reply = computed(() => {
		const review = this.reviewDto();
		if (!review?.reviewReply) return null;

		const reply = review.reviewReply;
		return {
			id: review.id,
			reviewId: review.idEnc,
			text: reply.text ?? '',
			createdAt: reply.createdAt,
			businessName: this.businessName() ?? ''
		};
	});

	protected readonly buildImageUrl = buildImageUrl;

	delete = output<string>();
	replyAdded = output<ReviewReplyDto>();
	replyDeleted = output<void>();

	PriceRangeEnum = PriceRangeEnum;
	priceRangeLabels = PRICE_RANGE_LABELS;

	protected getPriceRangeLabel(priceRange: PriceRangeEnum | string | null | undefined): string {
		if (!priceRange) return 'Non défini';
		if (typeof priceRange === 'number') {
			return PRICE_RANGE_LABELS[priceRange] || 'Non défini';
		}
		const enumValue = PriceRangeEnum[priceRange as keyof typeof PriceRangeEnum];
		return PRICE_RANGE_LABELS[enumValue as number] || 'Non défini';
	}

	onDelete() {
		const currentReview = this.review();
		if (!currentReview?.id) return;
		const dialogRef = this.#dialog.open(ReviewReplyDeleteDialogComponent, {
			width: '400px',
			disableClose: false,
			autoFocus: true
		});

		dialogRef
			.afterClosed()
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter(Boolean),
				tap(() => this.delete.emit(currentReview.id))
			)
			.subscribe();
	}

	onReplyAdded(reply: ReviewReplyDto) {
		this.replyAdded.emit(reply);
	}

	onReplyDeleted() {
		const currentReview = this.reviewDto();
		if (currentReview) {
			this.reviewDto.set({ ...currentReview, reviewReply: undefined });
		}
		this.replyDeleted.emit();
	}
}
