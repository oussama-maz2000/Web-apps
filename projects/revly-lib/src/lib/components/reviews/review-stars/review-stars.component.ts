import { NgClass } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Rating } from '../../../models/types/review.types';

@Component({
	selector: 'revlib-review-stars',
	imports: [NgClass, MatIconModule, MatButtonModule, MatTooltipModule],
	templateUrl: './review-stars.component.html'
})
export class ReviewStarsComponent {
	// Input rating value (0-5) for readonly or initial selection
	rating = input<Rating>(0);
	// If true, user can change stars; otherwise readonly
	editable = input(true);
	// Emits new rating when user clicks a star
	ratingChange = output<Rating>();

	// Internal signal to track current rating (for editable mode)
	currentRating = signal<Rating>(0);

	stars: Rating[] = [1, 2, 3, 4, 5];

	constructor() {
		// Sync currentRating with input rating when it changes
		effect(() => {
			this.currentRating.set(this.rating());
		});
	}

	starClick(value: Rating) {
		if (!this.editable()) return;
		this.currentRating.set(value);
		this.ratingChange.emit(value);
	}

	getStarClass(value: Rating): string {
		// Use currentRating for editable, input rating for readonly
		const rating = this.editable() ? this.currentRating() : this.rating();

		// If no rating, all stars are empty
		if (rating === 0) return 'star-empty';

		// Filled stars based on rating value
		if (value <= rating) {
			if (rating === 1) return 'star-red';
			if (rating <= 3) return 'star-yellow';
			return 'star-gold';
		}

		// Unfilled stars
		return 'star-empty';
	}
}
