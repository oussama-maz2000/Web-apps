import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AppByPlatformGuard } from '@revlib/services';

export const CONTROL_PATHS = {
	LAUNCH_APP: 'launchapp',
	LATEST_APP: 'latest-app'
};

export const CONTROL_ROUTES: Routes = [
	/**
	 * Used to redirect to the relevent app by platform
	 * to the web app if the user is on a desktop
	 */
	{
		path: CONTROL_PATHS.LAUNCH_APP,
		canActivate: [() => inject(AppByPlatformGuard).conditionalOpenAppUri()],
		loadComponent: () => import('@revlib/components/empty.component').then((m) => m.EmptyComponent)
	},
	{
		path: CONTROL_PATHS.LATEST_APP,
		canActivate: [() => inject(AppByPlatformGuard).conditionalRedirectToLatestApp()],
		loadComponent: () => import('@revlib/components/empty.component').then((m) => m.EmptyComponent)
	}
];
