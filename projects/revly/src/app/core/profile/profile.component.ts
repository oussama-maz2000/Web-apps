import { Component, inject, linkedSignal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { DeleteAccountDialogComponent } from '@revlib/components/auth/account-delete/account.delete.component';
import { GoogleDeleteAccountDialogComponent } from '@revlib/components/auth/account-delete/google.account.delete.component';
import { EmailChangeComponent } from '@revlib/components/auth/email/email-change.component';
import { PasswordChangeComponent } from '@revlib/components/auth/password/password-change.component';
import { PhoneManagementComponent } from '@revlib/components/auth/phone/phone-management.component';
import { UpdateProfileDialogComponent } from '@revlib/components/auth/update-profile/update-profile-dialog.component';
import { AuthenticatedComponent } from '@revlib/components/authenticated.component';
import { AvatarComponent } from '@revlib/components/shared/avatar/avatar.component';
import { ENVIRONMENT } from '@revlib/core';
import { Languages, UpdateUserProfileReqDto } from '@revlib/models';
import { AuthBaseFacade } from '@revlib/services';
import { ApplicationActions, AppState, selectUser, selectUserProp, UserActions } from '@revlib/store';
import { buildImageUrl, getFirstErrorMessage, getGenderLabel } from '@revlib/utils';
import { catchError, debounceTime, EMPTY, filter, finalize, Subject, take, tap } from 'rxjs';
import { UserFacade } from '../../../../../revly-lib/src/lib/facades/user/user-facade.service';
import { UserDto } from '../../../../../revly-lib/src/lib/models/responses/userDto.model';
import { COMMON_IMPORTS } from '../../../app.shared.imports';

@Component({
	selector: 'app-revlib-profile',
	standalone: true,
	imports: [
		...COMMON_IMPORTS,
		ReactiveFormsModule,
		MatDividerModule,
		MatIconModule,
		MatExpansionModule,
		MatFormFieldModule,
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatTooltipModule,
		MatCheckboxModule,
		AvatarComponent,
		EmailChangeComponent,
		PasswordChangeComponent,
		PhoneManagementComponent
	],
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss'
})
export class ProfileComponent extends AuthenticatedComponent implements OnInit, OnDestroy {
	//#region DI
	readonly #authBaseFacade = inject(AuthBaseFacade);
	readonly #store = inject(Store<AppState>);
	readonly #dialog = inject(MatDialog);
	readonly #userFacade = inject(UserFacade);
	//#endregion

	private uploadTrigger$ = new Subject<File>();
	private storeProfilePhoto = this.#store.selectSignal(selectUserProp('profilePictureUrl'));
	protected user = this.#store.selectSignal(selectUser);
	protected profilePhotoUrl = linkedSignal(() => buildImageUrl(this.storeProfilePhoto()!, 'thumb') ?? null);
	protected getGenderLabel = getGenderLabel;
	protected Languages = Languages;
	protected environment = ENVIRONMENT;
	protected selectedFile: File | null = null;

	//#region Life cycle hooks
	constructor() {
		super();
	}

	ngOnInit(): void {
		this.setupUploadListener();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
	//#endregion

	get language() {
		if (this.user()) {
			// If user exists, preferredLanguage is guaranteed to exist per the interface
			// LanguageEnum starts at 1, so we subtract 1 for the zero-based array index
			return Languages[this.user()!.preferredLanguage - 1].label;
		}
		return '';
	}

	openDeleteAccountDialog(): void {
		if (this.user().isExternalUser) {
			const dialogRef = this.#dialog.open(GoogleDeleteAccountDialogComponent, {
				width: '500px',
				disableClose: true,
				autoFocus: true
			});

			dialogRef.afterClosed().subscribe((idToken: string | undefined) => {
				if (idToken) {
					this.deleteAccount(idToken);
				}
			});
		} else {
			const dialogRef = this.#dialog.open(DeleteAccountDialogComponent, {
				width: '500px',
				disableClose: true,
				autoFocus: true
			});

			dialogRef.afterClosed().subscribe((password: string | undefined) => {
				if (password) {
					this.deleteAccount(password);
				}
			});
		}
	}

	deleteAccount(passwordOrIdToken: string): void {
		if (this.isLoading()) return;

		this.isLoading.set(true);

		const deleteAccountSub = this.#authBaseFacade.deleteAccount$(passwordOrIdToken).subscribe({
			next: (result) => {
				if (result.isSucceeded) {
					const successMessage = result.success?.message;
					if (successMessage) {
						this.#store.dispatch(ApplicationActions.showSuccessSnackbar({ message: successMessage }));
					}
				}
			},
			error: (err) => {
				const firstErrorMessage = getFirstErrorMessage(err);
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
					})
				);

				this.isLoading.set(false);
			},
			complete: () => {
				this.isLoading.set(false);
				this.#authBaseFacade.logoutFromFrontend();
			}
		});

		this.subscriptions.add(deleteAccountSub);
	}

	openUpdateProfileDialog(): void {
		const dialogRef = this.#dialog.open(UpdateProfileDialogComponent, {
			width: '500px',
			disableClose: true,
			autoFocus: true
		});

		const dialogSub = dialogRef
			.afterClosed()
			.pipe(
				filter((profile): profile is UpdateUserProfileReqDto => !!profile),
				take(1)
			)
			.subscribe((profile) => {
				this.updateAccount(profile);
			});

		this.subscriptions.add(dialogSub);
	}

	updateAccount(account: UpdateUserProfileReqDto): void {
		this.isLoading.set(true);

		const updateProfile = this.#userFacade
			.updateUserProfile$(account)
			.pipe(
				tap((result) => {
					if (result.isSucceeded) {
						this.#store.dispatch(UserActions.setUser({ user: result.value as UserDto }));
						this.#store.dispatch(
							ApplicationActions.showSuccessSnackbar({
								message: 'La localisation a été mise à jour avec succès'
							})
						);
					}
				}),
				catchError((err) => {
					const firstErrorMessage = getFirstErrorMessage(err);
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
						})
					);
					this.isLoading.set(false);
					return EMPTY;
				}),
				finalize(() => {
					this.isLoading.set(false);
				}),
				take(1)
			)
			.subscribe();

		this.subscriptions.add(updateProfile);
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			if (!file.type.startsWith('image/')) {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: 'Veuillez sélectionner une image valide (JPG, PNG, etc.)'
					})
				);
				return;
			}
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: "L'image est trop grande. Taille maximale : 5MB"
					})
				);
				return;
			}
			this.selectedFile = file;
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				this.profilePhotoUrl.set(e.target?.result as string);
			};
			reader.readAsDataURL(file);
			this.uploadTrigger$.next(file);
		}
	}

	private setupUploadListener(): void {
		this.subscriptions.add(
			this.uploadTrigger$.pipe(debounceTime(1000)).subscribe((file) => {
				this.#store.dispatch(UserActions.uploadUserImage({ file }));
			})
		);
	}
}
