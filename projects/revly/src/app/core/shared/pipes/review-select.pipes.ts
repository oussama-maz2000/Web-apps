import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'reviewTitleSelect',
	standalone: true
})
export class SelectTitlePipe implements PipeTransform {
	private reviewsTitles = [
		{
			label: 'Pinned',
			value: 'isPinned'
		},
		{
			label: 'Rating',
			value: 'rating'
		},

		{
			label: 'Created At',
			value: 'createdAt'
		},
		{
			label: 'Helpful Count',
			value: 'helpfulCount'
		},
		{
			label: 'Not Helpful Count',
			value: 'notHelpfulCount'
		}
	];

	transform(value: string | null | undefined): string {
		if (!value) return '';

		const found = this.reviewsTitles.find((v) => v.value === value);
		return found ? found.label : value;
	}
}
