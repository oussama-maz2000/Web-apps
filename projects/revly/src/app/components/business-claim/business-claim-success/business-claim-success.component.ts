import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
@Component({
	selector: 'app-business-claim-success',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		ClipboardModule // <-- This is required for [cdkCopyToClipboard] to work
	],
	templateUrl: './business-claim-success.component.html'
})
export class BusinessClaimSuccessComponent {
	message = input<string>('');
	idEnc = input<string>('');

	readonly copied = signal<boolean>(false);

	copyIdEnc() {
		this.copied.set(true);

		// Reset visual feedback after 3 seconds
		setTimeout(() => {
			this.copied.set(false);
		}, 3000);
	}
}
