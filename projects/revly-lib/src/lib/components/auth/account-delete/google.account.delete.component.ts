import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GOOGLE_CONFIG } from '../../../core/api/api-config';
import { gracePeriodDays } from '../../../shared-constants/auth-constants';

@Component({
	selector: 'app-google-delete-account-dialog',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
	templateUrl: './google.account.delete.component.html',
	styles: [
		`
			:host {
				display: block;
			}
		`
	]
})
export class GoogleDeleteAccountDialogComponent implements AfterViewInit, OnDestroy {
	private readonly dialogRef = inject(MatDialogRef<GoogleDeleteAccountDialogComponent>);
	private readonly ngZone = inject(NgZone);

	isLoading = signal(true);
	errorMessage = signal<string | null>(null);
	readonly gracePeriodDays: number = gracePeriodDays;

	ngAfterViewInit(): void {
		this.initializeGoogleAuth();
	}

	ngOnDestroy(): void {
		if (window.google?.accounts?.id) {
			window.google.accounts.id.cancel();
		}
	}

	private initializeGoogleAuth(): void {
		this.loadGoogleClientLibrary().then(() => {
			window.google.accounts.id.initialize({
				client_id: GOOGLE_CONFIG.clientId,
				callback: this.handleGoogleResponse.bind(this),
				auto_prompt: true
			});
			window.google.accounts.id.renderButton(document.getElementById('google-signup-button'), {
				type: 'standard',
				size: 'large',
				theme: 'filled_blue',
				shape: 'pill',
				text: 'continue_with',
				logo_alignment: 'left'
			});
		});
	}

	private loadGoogleClientLibrary(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (window.google && window.google.accounts) {
				resolve(); // Google API already loaded
				return;
			}

			const existingScript = document.getElementById('google-client-script');
			if (existingScript) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.id = 'google-client-script';
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject('Failed to load Google script');
			document.head.appendChild(script);
		});
	}

	private handleGoogleResponse(response: any): void {
		this.ngZone.run(() => {
			if (response?.credential) {
				this.dialogRef.close(response.credential);
			} else {
				this.errorMessage.set('Authentification Google échouée');
			}
		});
	}

	cancel(): void {
		this.dialogRef.close();
	}
}
