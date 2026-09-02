import { Component, computed, input } from '@angular/core';

@Component({
	selector: 'revlib-avatar',
	templateUrl: './avatar.component.html',
	styleUrls: ['./avatar.component.css']
	// define inputs via `inputs` array if needed for template binding
})
export class AvatarComponent {
	// Signals replacing @Input
	name = input<string>(''); // required input
	size = input<number>(48);
	background = input<string>('random');
	color = input<string>('fff');
	rounded = input<boolean>(true);
	fontSize = input<number>(0.5);
	bold = input<boolean>(false);
	length = input<number>(2);

	// Computed property for avatar URL
	avatarUrl = computed(() => {
		const params = new URLSearchParams({
			name: this.name(),
			size: this.size().toString(),
			background: this.background(),
			color: this.color(),
			rounded: this.rounded().toString(),
			'font-size': this.fontSize().toString(),
			bold: this.bold().toString(),
			length: this.length().toString()
		});

		return `https://ui-avatars.com/api/?${params.toString()}`;
	});

	// Computed property for initials
	initials = computed(() => {
		return this.name()
			.split(' ')
			.map((part) => part.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, this.length());
	});
}
