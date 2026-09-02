import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
	selector: 'app-hero',
	standalone: true,
	imports: [MatIconModule, MatInputModule, ReactiveFormsModule],
	templateUrl: './hero.component.html',
	styles: [
		`
			.hero-bg {
				background: url('/hero.jpg') center/cover no-repeat;
			}
		`
	]
})
export class HeroComponent {
	private fb = inject(FormBuilder);
	private router = inject(Router);
	protected filterForm = this.fb.group({
		filter: this.fb.group({
			displayName: this.fb.group({
				key: ['displayName'],
				value: ['', [Validators.minLength(3)]],
				operator: ['contains']
			})
		}),
		pagination: this.fb.group({
			first: [10]
		})
	});

	get displayNameValue() {
		return this.filterForm.get('filter.displayName.value') as FormControl;
	}

	onSubmit() {
		if (this.displayNameValue.valid) {
			this.router.navigate(['/search'], { state: { displayName: this.displayNameValue.value } });
		}
	}
}
