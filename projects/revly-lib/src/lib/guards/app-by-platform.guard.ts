import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LOCATION } from '@revlib/core';
import { AUTH_PATHS } from '../core/routes/auth.routes';
import { isAndroid } from '../utils/platform-detection.utils';

/**
 * Redirect to the app by platform
 * This guard is used to redirect the user to our app by platform
 * It is used to redirect the user to the correct mobile app depending on the platform the user is on, or to the web app if the user is on a desktop
 */
@Injectable({
	providedIn: 'root'
})
export class AppByPlatformGuard {
	private readonly router = inject(Router);
	private readonly location = inject(LOCATION); // Safe Location object

	//uses Intent URI  or deep link to trigger openning the installed app from browser
	conditionalOpenAppUri(): boolean {
		if (isAndroid()) {
			//  Guard against null location (Server-side)
			if (this.location) {
				this.location.href = 'myapp://some/path';
			}
		} else {
			this.router.navigate([AUTH_PATHS.LOGIN]);
		}

		return false;
	}

	conditionalRedirectToLatestApp(): boolean {
		if (isAndroid()) {
			// Guard against null location (Server-side)
			if (this.location) {
				window.location.href = 'https://play.google.com/store/apps/details?id=';
			}
		} else {
			this.router.navigate([AUTH_PATHS.LOGIN]);
		}

		return false;
	}
}
