import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarConfig, SnackbarData, SnackbarType } from '../../../models/common/snackbar';

@Component({
	selector: 'app-custom-snackbar',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './custom-snackbar.component.html',
	styleUrls: ['./custom-snackbar.component.scss'],
	imports: [MatIconModule, MatButtonModule]
})
export class CustomSnackbarComponent {
	readonly snackBarRef = inject(MatSnackBarRef<CustomSnackbarComponent>);
	readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);

	readonly config: SnackbarConfig = this.getSnackbarConfig();

	//classes are defined in snackbar-overrides.scss
	private getSnackbarConfig(): SnackbarConfig {
		const configs: Record<SnackbarType, SnackbarConfig> = {
			success: { icon: 'check_circle', panelClass: 'snackbar-success' },
			error: { icon: 'error', panelClass: 'snackbar-error' },
			info: { icon: 'info', panelClass: 'snackbar-info' },
			warning: { icon: 'warning', panelClass: 'snackbar-warning' }
		};

		return configs[this.data.type];
	}

	executeAction(): void {
		this.data.action?.callback?.();
		this.snackBarRef.dismiss();
	}

	dismiss(): void {
		this.snackBarRef.dismiss();
	}
}
