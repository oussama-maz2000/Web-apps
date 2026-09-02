import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineBannerComponent } from '@revlib/components/shared/offline-banner/offline-banner.component';

@Component({
	selector: 'app-root',
	standalone: true,
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterOutlet, OfflineBannerComponent]
})
export class AppComponent {}
