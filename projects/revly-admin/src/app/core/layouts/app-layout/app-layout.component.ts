import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavContainer, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidenavService } from '@revlib/services';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
	selector: 'app-app-layout',
	imports: [
		RouterOutlet,
		RouterLink,
		MatDividerModule,
		HeaderComponent,
		MatSidenavModule,
		MatSidenavContainer,
		MatSidenavContent,
		MatToolbarModule,
		MatIconModule,
		MatListModule,
		MatButtonModule,
		MatTooltipModule,
		MatMenuModule,
		MatBadgeModule,
		MatExpansionModule
	],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './app-layout.component.html',
	styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent implements OnDestroy {
	private readonly sidenavService = inject(SidenavService);

	// Expose the sidenav state signal to the template
	public readonly isSideNavOpen = this.sidenavService.isOpen;

	//ensures that the sidenav is closed when the component is destroyed
	ngOnDestroy(): void {
		this.sidenavService.close();
	}

	// // Called when sidenav is opened
	// onSidenavOpened()
	// {
	//   if (!this.isSideNavOpen())
	//     this.sidenavService.open();
	// }

	// // Called when sidenav is closed
	// onSidenavClosed()
	// {
	//   if (this.isSideNavOpen())
	//     this.sidenavService.close();
	// }
}
