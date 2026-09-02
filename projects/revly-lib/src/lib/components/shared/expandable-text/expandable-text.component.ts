import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
	selector: 'revlib-expandable-text',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="flex flex-col w-full">
			<div
				[class.line-clamp-1]="!isExpanded() && lines() === 1"
				[class.line-clamp-2]="!isExpanded() && lines() === 2"
				[class.line-clamp-3]="!isExpanded() && lines() === 3"
				class="text-gray-700 whitespace-pre-wrap">
				{{ text() }}
			</div>

			@if (text().length > limit()) {
				<button
					type="button"
					(click)="isExpanded.set(!isExpanded())"
					class="mt-1 text-sm font-bold text-blue-600 self-start hover:underline focus:outline-none">
					{{ isExpanded() ? 'Voir moins' : 'Voir plus' }}
				</button>
			}
		</div>
	`
})
export class ExpandableTextComponent {
	/**
	 * The text content to display.
	 * @required
	 */
	text = input.required<string>();

	/**
	 * The character threshold to enable the "Voir plus" toggle.
	 * @default 200
	 * @param limit Number of characters before truncation logic triggers.
	 */
	limit = input<number>(200);

	/** * Internal state to track if the text is expanded or collapsed.
	 */
	isExpanded = signal(false);

	/**
	 * Number of lines to display when collapsed. We support here 1-3
	 * @default 3: note Tailwind only supports line-clamp-{1-6} by default
	 */
	lines = input<number>(3);
}
