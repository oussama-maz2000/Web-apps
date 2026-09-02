import { DatePipe } from '@angular/common';
import { Component, inject, input, linkedSignal, OnDestroy, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { ReviewReplyDto } from '@revlib/models';
import { ApplicationActions, AppState } from '@revlib/store';
import { catchError, finalize, of, tap } from 'rxjs';
import { ReviewReplyDeleteReqDto, ReviewReplyPostReqDto } from '../../../models/requests/review-reply.model';
import { ReviewReplyService } from '../../../services/review/review-reply.service';
import { getFirstErrorMessage } from '../../../utils/result-utils';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
	selector: 'revlib-review-reply',
	standalone: true,
	imports: [
		DatePipe,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		AvatarComponent
	],
	templateUrl: './review-reply.component.html',
	styleUrl: './review-reply.component.scss'
})
export class ReviewReplyComponent extends BaseComponent implements OnDestroy {
	// Inputs
	readonly reply = input<ReviewReplyDto | null>(null);
	replyDto = linkedSignal(() => this.reply());
	readonly isOwner = input.required<boolean>();
	readonly businessId = input.required<string>();
	readonly businessName = input.required<string>();

	readonly reviewId = input.required<string>();

	// Outputs
	replyAdded = output<ReviewReplyDto>();
	replyDeleted = output<void>();

	// DI
	readonly #reviewReplyService = inject(ReviewReplyService);

	readonly #fb = inject(FormBuilder);
	readonly #store = inject(Store<AppState>);
	// State
	isReplying = signal(false);
	isSubmitting = signal(false);
	isDeleting = signal(false);
	showDeleteConfirm = signal(false);

	replyForm = this.#fb.group({
		text: ['', [Validators.required, Validators.minLength(20)]]
	});

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	// Reply Form
	onReply() {
		this.isReplying.set(true);
	}

	onCancel() {
		this.isReplying.set(false);
		this.replyForm.reset();
	}

	onSubmit() {
		if (this.replyForm.valid) {
			const text = this.replyForm.value.text;
			if (text) {
				this.isSubmitting.set(true);
				const dto: ReviewReplyPostReqDto = {
					businessId: this.businessId(),
					reviewId: this.reviewId(),
					text: text
				};
				const sub = this.#reviewReplyService.postReply(dto).subscribe({
					next: (res) => {
						if (res?.value) {
							// Create a new object with businessName included
							const replyWithBusinessName: ReviewReplyDto = {
								...res.value,
								businessName: this.businessName()
							};

							this.replyDto.set(replyWithBusinessName);
							this.replyAdded.emit(replyWithBusinessName);
							this.isReplying.set(false);
							this.replyForm.reset();

							this.#store.dispatch(
								ApplicationActions.showSuccessSnackbar({ message: 'Réponse publiée avec succès' })
							);
						}
						this.isSubmitting.set(false);
					},
					error: (err) => {
						const msg = getFirstErrorMessage(err) || 'Erreur lors de la publication de la réponse';
						this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message: msg }));
						this.isSubmitting.set(false);
					}
				});
				this.subscriptions.add(sub);
			}
		}
	}

	// Delete Reply
	onDeleteClick() {
		this.showDeleteConfirm.set(true); // show alert instead of native confirm
	}

	cancelDelete() {
		this.showDeleteConfirm.set(false);
	}

	confirmDelete() {
		if (!this.replyDto()) return;
		const dto: ReviewReplyDeleteReqDto = {
			businessId: this.businessId(),
			reviewId: this.reviewId()
		};

		this.isDeleting.set(true);
		const sub = this.#reviewReplyService
			.deleteReply(dto)
			.pipe(
				tap(() => {
					this.replyDeleted.emit();
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({ message: 'Réponse supprimée avec succès' })
					);
					this.isDeleting.set(false);
					this.replyDto.set(null);
					this.showDeleteConfirm.set(false);
				}),
				catchError((error) => {
					this.showDeleteConfirm.set(false);
					const firstErrorMessage = getFirstErrorMessage(error);
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
						})
					);

					return of(null);
				}),
				finalize(() => {
					this.isDeleting.set(false);
				})
			)

			.subscribe();
		this.subscriptions.add(sub);
	}
}
