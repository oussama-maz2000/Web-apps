import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../components/shared/custom-snackbar/custom-snackbar.component';
import { SnackbarData, SnackbarType } from '../../models/common/snackbar';

@Injectable({
	providedIn: 'root'
})
export class SnackbarService {
	private readonly snackBar = inject(MatSnackBar);

	private readonly DEFAULT_CONFIG: MatSnackBarConfig = {
		duration: 4000,
		horizontalPosition: 'end',
		verticalPosition: 'top'
	};

	private openSnackbar(data: SnackbarData, config?: Partial<MatSnackBarConfig>) {
		const snackbarConfig: MatSnackBarConfig = {
			...this.DEFAULT_CONFIG,
			...config,
			data,
			panelClass: ['custom-snackbar-container', this.getSnackbarConfig(data.type).panelClass]
		};

		return this.snackBar.openFromComponent(CustomSnackbarComponent, snackbarConfig);
	}

	success(
		message: string,
		options?: {
			dismissible?: boolean;
			action?: SnackbarData['action'];
			duration?: number;
		}
	) {
		return this.openSnackbar(
			{
				message,
				type: 'success',
				dismissible: options?.dismissible ?? true,
				action: options?.action
			},
			{
				duration: options?.duration
			}
		);
	}

	error(
		message: string,
		options?: {
			dismissible?: boolean;
			action?: SnackbarData['action'];
			duration?: number;
		}
	) {
		return this.openSnackbar(
			{
				message,
				type: 'error',
				dismissible: options?.dismissible ?? true, // Errors should be dismissible by default
				action: options?.action
			},
			{
				duration: options?.duration ?? 6000 // Longer duration for errors
			}
		);
	}

	info(
		message: string,
		options?: {
			dismissible?: boolean;
			action?: SnackbarData['action'];
			duration?: number;
		}
	) {
		return this.openSnackbar(
			{
				message,
				type: 'info',
				dismissible: options?.dismissible ?? false,
				action: options?.action
			},
			{
				duration: options?.duration
			}
		);
	}

	warning(
		message: string,
		options?: {
			dismissible?: boolean;
			action?: SnackbarData['action'];
			duration?: number;
		}
	) {
		return this.openSnackbar(
			{
				message,
				type: 'warning',
				dismissible: options?.dismissible ?? true,
				action: options?.action
			},
			{
				duration: options?.duration ?? 5000
			}
		);
	}

	private getSnackbarConfig(type: SnackbarType) {
		const configs = {
			success: { panelClass: 'snackbar-success' },
			error: { panelClass: 'snackbar-error' },
			info: { panelClass: 'snackbar-info' },
			warning: { panelClass: 'snackbar-warning' }
		};

		return configs[type];
	}
}
