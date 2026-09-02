import { Component, inject } from '@angular/core';
import { ConnectivityService } from '../../../core/connectivity/connectivity.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'revlib-offline-banner',
	imports: [MatToolbarModule, MatIconModule],
	templateUrl: './offline-banner.component.html',
	styleUrl: './offline-banner.component.scss'
})
export class OfflineBannerComponent {
	readonly connectivityService = inject(ConnectivityService);
}
