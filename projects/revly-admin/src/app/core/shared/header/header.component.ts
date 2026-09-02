import { Component, DestroyRef, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AvatarComponent } from '@revlib/components/shared/avatar/avatar.component';
import { AUTH_PATHS, IdentityStateService } from '@revlib/core';
import { AuthBaseFacade, SidenavService } from '@revlib/services';
import { finalize } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { AppState, selectUserProp } from '@revlib/store';
// @ts-ignore
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buildImageUrl } from '@revlib/utils';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';

@Component({
	selector: 'app-header',
	imports: [
		...COMMON_IMPORTS,
		MatIcon,
		MatTooltip,
		MatIconModule,
		RouterLink,
		MatButtonModule,
		MatTooltipModule,
		MatMenuModule,
		MatBadgeModule,
		AvatarComponent
	],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss'
})
export class HeaderComponent {
	private readonly identityStateService = inject(IdentityStateService);
	private readonly authBaseFacade = inject(AuthBaseFacade);
	private readonly router = inject(Router);
	private readonly sidenavService = inject(SidenavService);
	readonly #store = inject(Store<AppState>);

	loginPath = AUTH_PATHS.LOGIN;

	protected readonly user = this.identityStateService.user;
	protected storeProfilePhoto = this.#store.selectSignal(selectUserProp('profilePictureUrl'));
	protected readonly buildImageUrl = buildImageUrl;
	readonly destroy = inject(DestroyRef);
	get isLoggedIn() {
		return this.identityStateService.isAuthenticated;
	}

	toggleSidenav(): void {
		this.sidenavService.toggle();
	}

	logout$() {
		this.authBaseFacade
			.logout$()
			.pipe(
				takeUntilDestroyed(this.destroy),
				finalize(() => {
					this.router.navigate(['/']);
				})
			)
			.subscribe();
	}
}
