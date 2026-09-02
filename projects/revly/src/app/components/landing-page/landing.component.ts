import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { RecentReviewsComponent } from './recent-reviews/recent-reviews.component';
import { TopBusinessesComponent } from './top-business/top-businesses.component';

@Component({
	selector: 'app-landing',
	standalone: true,
	imports: [HeroComponent, RecentReviewsComponent, TopBusinessesComponent],
	template: `
		<app-hero />
		<app-recent-reviews />
		<app-top-businesses />
	`
})
export class LandingComponent {}
