import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineBannerComponent } from '@revlib/components/shared/offline-banner/offline-banner.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	imports: [RouterOutlet, OfflineBannerComponent]
})
export class AppComponent {
	title = 'revly-admin';
}
