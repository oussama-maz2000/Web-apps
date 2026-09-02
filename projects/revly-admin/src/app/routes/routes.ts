import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@revlib/core';
import { HomeComponent } from '../../../../revly/src/app/core/home/home.component';
import { AppLayoutComponent } from '../core/layouts/app-layout/app-layout.component';
import { RolesGuard } from '../guards/roles.guard';

export const routes: Routes = [
	// {
	//     path: '',
	//     component: AppLayoutComponent, //components needing header, footer
	//     children: [
	//         {
	//             path: '',
	//             title: 'Home',
	//             component: HomeComponent
	//         }
	//     ]
	// },

	/*** components as main router outlet without header, footer ***/
	...AUTH_ROUTES,

	{
		path: '',
		component: AppLayoutComponent, //components needing header, footer
		children: [
			{
				path: '',
				title: 'Home',
				component: HomeComponent
			},

			{
				path: 'role-management',
				pathMatch: 'full',
				canActivate: [() => inject(RolesGuard).DenyIfNotAdmin()],
				loadComponent: () =>
					import('../modules/role-management/role-management.component').then(
						(m) => m.RoleManagementComponent
					)
			},
			{
				path: 'claims-review',
				pathMatch: 'full',
				canActivate: [() => inject(RolesGuard).DenyIfNotAdmin()],
				loadComponent: () =>
					import('../modules/claims-review/claims-review.component').then((m) => m.ClaimsReviewComponent)
			}
		]
	},

	{ path: '**', redirectTo: '' }
];
