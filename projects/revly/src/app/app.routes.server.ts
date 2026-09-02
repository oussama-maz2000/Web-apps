import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{
		path: '',
		renderMode: RenderMode.Server
	},
	{
		path: 'biz/:categoryNameFr/:id/:nameSlug',
		renderMode: RenderMode.Server
	},
	{
		path: 'privacy-policy',
		renderMode: RenderMode.Prerender
	},
	{
		path: 'terms-of-use',
		renderMode: RenderMode.Prerender
	},
	{
		path: 'about',
		renderMode: RenderMode.Prerender
	},
	{
		path: 'contact',
		renderMode: RenderMode.Prerender
	},

	{
		path: '**',
		renderMode: RenderMode.Client
	}
];
