import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, inject, OnInit, Renderer2, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { WINDOW } from '@revlib/core';
import { Subject } from 'rxjs';
import { SnackbarService } from '../../services/Wrappers/snack-bar.service';
import { LoginService } from '../../services/auth/login.service';

@Component({
	selector: 'app-test',
	templateUrl: './test.component.html',
	styleUrls: ['./test.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatChipsModule,
		MatProgressBarModule
	]
})
export class TestComponent implements OnInit {
	readonly window = inject(WINDOW); // Safe Window
	readonly document = inject(DOCUMENT); // Safe Document

	isDisabledButton = signal<boolean>(false);
	num$ = new Subject<number | undefined>();
	readonly snacka = inject(SnackbarService);
	readonly loginService = inject(LoginService);

	snack(): void {
		this.snacka.info('something about', {
			action: {
				label: 'okaay'
			}
		});
	}
	currentTheme: 'light' | 'dark' = 'light';

	constructor(private renderer: Renderer2) {}

	ngOnInit(): void {
		// Server-side rendering check
		if (!this.window) return;

		// Check for saved preference first
		const savedTheme = localStorage.getItem('preferredTheme') as 'light' | 'dark' | null;

		if (savedTheme) {
			this.setTheme(savedTheme);
		} else if (this.window?.matchMedia && this.window?.matchMedia('(prefers-color-scheme: dark)').matches) {
			// Otherwise use system preference
			this.setTheme('dark');
		} else {
			this.setTheme('light');
		}

		// Listen for changes to color scheme preference
		this.window?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			// Only auto-change if no saved preference exists
			if (!localStorage.getItem('preferredTheme')) {
				const newTheme = e.matches ? 'dark' : 'light';
				this.setTheme(newTheme);
			}
		});
	}

	toggleTheme(): void {
		this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
	}

	private setTheme(theme: 'light' | 'dark'): void {
		this.currentTheme = theme;

		// Clear all theme classes first to avoid state conflicts
		this.renderer.removeClass(this.document?.documentElement, 'light-theme');
		this.renderer.removeClass(this.document?.documentElement, 'dark-theme');
		this.renderer.removeAttribute(this.document?.documentElement, 'data-theme');

		// Apply new theme with explicit class assignment
		this.renderer.addClass(this.document?.documentElement, `${theme}-theme`);
		this.renderer.setAttribute(this.document?.documentElement, 'data-theme', theme);

		localStorage.setItem('preferredTheme', theme);
	}
}
