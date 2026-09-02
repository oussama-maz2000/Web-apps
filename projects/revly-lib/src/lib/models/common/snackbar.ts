export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarData {
	message: string;
	type: SnackbarType;
	dismissible?: boolean;
	action?: {
		label: string;
		callback?: () => void;
	};
}

export interface SnackbarConfig {
	icon: string;
	panelClass: string;
}
