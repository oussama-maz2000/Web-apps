import { Routes } from '@angular/router';

export const STATIC_ROUTES: Routes = [
	{
		path: 'privacy-policy',
		pathMatch: 'full',
		title: 'Privacy Policy',
		loadComponent: () =>
			import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent)
	},
	{
		path: 'terms-of-use',
		pathMatch: 'full',
		title: 'Terms of Use',
		loadComponent: () => import('./terms-of-use/terms-of-use.component').then((m) => m.TermsOfUseComponent)
	},
	{
		path: 'about',
		pathMatch: 'full',
		title: 'About',
		loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent)
	},
	{
		path: 'contact',
		pathMatch: 'full',
		title: 'Contact Us',
		loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent)
	}
];
