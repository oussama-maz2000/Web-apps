import { CommonModule } from '@angular/common';
import { afterNextRender, Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
	selector: 'app-contact',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatFormFieldModule,
		MatButtonModule,
		MatIconModule
	],
	template: `
		<div class="flex justify-center items-center min-h-[80vh] p-6">
			<div
				class="w-full max-w-xl bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-slate-100 dark:border-slate-700">
				<header class="mb-8 text-center">
					<h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Get in Touch</h1>
					<p class="text-slate-600 dark:text-slate-400">
						Have a question, a feedback...? We'd love to hear from you. Send us an email at:
						@if (email()) {
							<span>{{ email() }}</span>
						}
					</p>
					<!--message and we'll respond as soon as
						possible.-->
				</header>

				<form class="flex flex-col gap-4">
					<fieldset disabled>
						<mat-form-field class="w-full">
							<mat-label>Full Name</mat-label>
							<input matInput placeholder="Ex. Jane Doe" />
							<mat-icon matSuffix class="opacity-50">person</mat-icon>
						</mat-form-field>

						<mat-form-field class="w-full">
							<mat-label>Email Address</mat-label>
							<input matInput type="email" placeholder="jane@example.com" />
							<mat-icon matSuffix class="opacity-50">email</mat-icon>
						</mat-form-field>

						<mat-form-field class="w-full">
							<mat-label>Message</mat-label>
							<textarea matInput rows="4" placeholder="How can we help?"></textarea>
						</mat-form-field>

						<button
							matButton="filled"
							color="primary"
							class="h-12 text-lg font-semibold rounded-lg mt-2 transition-transform active:scale-95">
							Send Message
						</button>
					</fieldset>
				</form>
			</div>
		</div>
	`
})
export class ContactComponent {
	email = signal<string | undefined>(undefined);

	constructor() {
		afterNextRender(() => {
			this.email.set('contact@userevly.com');
		});
	}
}
