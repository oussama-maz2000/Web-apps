import { Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PriceRangeEnum, ReviewDto, ReviewPostReqDto } from '@revlib/models';
import { PRICE_RANGE_LABELS } from '../../../models/types/review.types';
import { ReviewStarsComponent } from '../review-stars/review-stars.component';

@Component({
	selector: 'revlib-review-form',
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		ReviewStarsComponent
	],
	templateUrl: './review-form.component.html'
})
export class ReviewFormComponent implements OnInit {
	businessId = input.required<string>();
	// in edit mode you might pass an existing review (for future)
	existingReview = input<ReviewDto | null>();

	// Emits a ready-to-post review object
	submitReview = output<ReviewPostReqDto>();

	form!: FormGroup;
	PriceRangeEnum = PriceRangeEnum;
	priceOptions = PRICE_RANGE_LABELS;
	priceRangeOptions = Object.entries(PRICE_RANGE_LABELS).map(([key, value]) => ({
		key: Number(key),
		value: value
	}));
	// keep star rating in sync with form
	constructor(private fb: FormBuilder) {}

	ngOnInit(): void {
		const existing = this.existingReview();
		this.form = this.fb.group({
			rating: [existing?.rating ?? 0, [Validators.required, Validators.min(1), Validators.max(5)]],
			text: [
				existing?.text ?? '',
				[Validators.required, Validators.minLength(50), Validators.maxLength(2000)]
			],
			priceRange: [existing?.priceRange ?? PriceRangeEnum.NOT_SET]
		});
	}

	onStarChange(newRating: number) {
		this.form.get('rating')!.setValue(newRating);
	}

	submit() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const payload: ReviewPostReqDto = {
			businessId: this.businessId(),
			rating: this.form.value.rating,
			text: this.form.value.text,
			priceRange: this.form.value.priceRange
		};

		this.submitReview.emit(payload);
	}

	// helper getters
	get rating() {
		return this.form.get('rating');
	}
	get text() {
		return this.form.get('text');
	}
	get priceRange() {
		return this.form.get('priceRange');
	}

	resetForm() {
		this.form.reset({
			rating: 0,
			text: '',
			priceRange: PriceRangeEnum.NOT_SET
		});
	}
}
