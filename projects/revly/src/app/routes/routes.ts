import { Routes } from '@angular/router';
import { AUTH_ROUTES, CONTROL_ROUTES } from '@revlib/core';
import { BusinessReviewsResolveData } from '../../../../revly-lib/src/lib/graphql/models/businessReviews.model';
import { denyUnauthenticated } from '../../../../revly-lib/src/lib/guards/auth.guard';
import { businessReviewsResolver } from '../core/business/business.resolver';
import { HomeComponent } from '../core/home/home.component';
import { STATIC_ROUTES } from '../core/static-pages/static-routes';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';

export const routes: Routes = [
	/*** components as main router outlet without header, footer ***/

	...CONTROL_ROUTES,
	...AUTH_ROUTES,
	...STATIC_ROUTES,

	/*** components as main router outlet with header, footer ***/
	{
		path: '',
		component: MainLayoutComponent, //components needing header, footer
		children: [
			{
				path: '',
				pathMatch: 'full',
				loadComponent: () =>
					import('../components/landing-page/landing.component').then((m) => m.LandingComponent)
			},
			{
				path: 'home',
				title: 'Home',
				component: HomeComponent
			},
			{
				path: 'search',
				title: 'Search',
				loadComponent: () => import('../core/search/search.component').then((m) => m.SearchComponent)
			},
			{
				path: 'biz/:categoryNameFr/:id/:nameSlug',
				loadComponent: () =>
					import('../core/business/business.component').then((m) => m.BusinessComponent),
				resolve: {
					data: businessReviewsResolver
				},
				data: {} as { data: BusinessReviewsResolveData }
			},
			{
				path: 'profile',
				title: 'Profile',
				loadComponent: () => import('../core/profile/profile.component').then((m) => m.ProfileComponent),
				canActivate: [denyUnauthenticated]
			},

			//todo dynamic route with business id
			{
				path: 'biz/update-profile',
				title: 'Update Profile',
				loadComponent: () =>
					import('../components/business-profile/update-profile/biz-update-profile.component').then(
						(m) => m.BizUpdateProfileComponent
					),
				canActivate: [denyUnauthenticated]
			},
			{
				path: 'biz/update-food',
				title: 'Update Business Food',
				loadComponent: () =>
					import('../components/business-food/update-biz-food.component').then(
						(m) => m.UpdateBizFoodComponent
					),
				canActivate: [denyUnauthenticated]
			},
			{
				path: 'claim',
				title: 'Claim',
				loadComponent: () =>
					import('../components/business-claim/claim-stepper/business-claim-stepper.component').then(
						(c) => c.BusinessClaimStepperComponent
					),
				canActivate: [denyUnauthenticated]
			},
			{
				path: 'my-claims',
				title: 'Claim status',
				loadComponent: () =>
					import('../components/business-claim/business-status/business-claims-status.component').then(
						(m) => m.BusinessClaimsStatusComponent
					),
				canActivate: [denyUnauthenticated]
			}
		]
	}

	// { path: '**', redirectTo: '' }
];
