import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { BizPictures } from '@revlib/models';
import { BizPicturesService } from '@revlib/services';
import { ApplicationActions, AppState } from '@revlib/store';
import { buildImageUrl, getFirstErrorMessage } from '@revlib/utils';
import { catchError, EMPTY, finalize, map, tap } from 'rxjs';
import {
	ALLOWED_EXTENSIONS,
	MAX_FILE_SIZE_MB,
	MAX_TOTAL_FILES,
	MIN_FILE_SIZE_MB
} from '../../../core/shared/utils/const-pics';

@Component({
	selector: 'app-business-pictures',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
	templateUrl: './business-pictures.component.html'
})
export class BusinessPicturesComponent extends BaseComponent {
	readonly #bizPicturesService = inject(BizPicturesService);
	readonly #store = inject(Store<AppState>);
	readonly #destroyRef = inject(DestroyRef);
	pictures = input.required<BizPictures[]>();
	businessId = input.required<string>();
	businessEncId = input.required<string>();

	localPictures = linkedSignal(() => [...this.pictures()]);

	protected readonly buildImageUrl = buildImageUrl;

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const files = Array.from(input.files);
		const currentCount = this.localPictures().length;

		// 1. Validate Counts
		if (currentCount >= MAX_TOTAL_FILES) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: `Galerie pleine. Maximum ${MAX_TOTAL_FILES} images autorisées.`
				})
			);
			input.value = '';
			return;
		}

		if (files.length > MAX_TOTAL_FILES) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: `Vous pouvez téléverser au maximum ${MAX_TOTAL_FILES} fichiers à la fois.`
				})
			);
			input.value = '';
			return;
		}

		if (currentCount + files.length > MAX_TOTAL_FILES) {
			const remaining = MAX_TOTAL_FILES - currentCount;

			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: `Vous ne pouvez ajouter que ${remaining} image(s) supplémentaire(s).`
				})
			);
			input.value = '';
			return;
		}

		// 2. Filter valid files using helper methods
		const validFiles = files.filter((file) => this.isValidFile(file));

		if (validFiles.length > 0) {
			this.uploadPictures(validFiles);
		}

		input.value = '';
	}

	private isValidFile(file: File): boolean {
		if (!this.isValidExtension(file.name)) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: `${file.name} : format invalide. Utilisez JPG, PNG ou WEBP.`
				})
			);
			return false;
		}

		if (!this.isValidSize(file.size)) {
			return false;
		}

		return true;
	}

	private isValidExtension(fileName: string): boolean {
		const ext = fileName.split('.').pop()?.toLowerCase();
		return !!ext && ALLOWED_EXTENSIONS.includes(ext);
	}

	private isValidSize(fileSize: number): boolean {
		const max = MAX_FILE_SIZE_MB * 1024 * 1024;
		const min = MIN_FILE_SIZE_MB * 1024 * 1024;

		if (fileSize < min) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({ message: 'La taille de l’image est trop petite.' })
			);
			return false;
		}

		if (fileSize > max) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({ message: 'La taille de l’image est trop grande.' })
			);
			return false;
		}

		return true;
	}

	private uploadPictures(files: File[]): void {
		this.isLoading.set(true);

		this.#bizPicturesService
			.uploadPictures(this.businessEncId(), files)
			.pipe(
				takeUntilDestroyed(this.#destroyRef),
				tap((res) => {
					if (!res.isSucceeded || !res.value) {
						throw new Error('Échec du téléversement');
					}
				}),

				map((res) =>
					res.value!.imageUrls.map((url) => ({
						id: url,
						fileName: url,
						url,
						isProfile: false,
						hasPassedModeration: false,
						businessId: this.businessId()
					}))
				),
				tap((newPics) => {
					this.localPictures.update((pics) => [...pics, ...newPics]);
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Images téléversées avec succès'
						})
					);
				}),

				catchError((err) => {
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';

					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));

					return EMPTY;
				}),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	setAsProfile(pictureId: string): void {
		this.isLoading.set(true);

		this.#bizPicturesService
			.setProfilePicture({
				businessId: this.businessId(),
				businessPictureId: pictureId
			})
			.pipe(
				takeUntilDestroyed(this.#destroyRef),
				tap((res) => {
					if (!res.isSucceeded) {
						throw new Error('Échec de la mise à jour de la photo de profil');
					}
				}),
				tap(() => {
					this.localPictures.update((pics) =>
						pics.map((pic) => ({
							...pic,
							isProfile: pic.id === pictureId
						}))
					);
					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Photo de profil mise à jour avec succès'
						})
					);
				}),
				catchError((err) => {
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
					return EMPTY;
				}),

				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	deletePicture(picture: BizPictures): void {
		this.isLoading.set(true);

		this.#bizPicturesService
			.deletePicture({
				fileName: picture.fileName,
				businessEncId: this.businessEncId()
			})
			.pipe(
				takeUntilDestroyed(this.#destroyRef),
				tap((res) => {
					if (!res.isSucceeded) {
						throw new Error('Échec de la suppression');
					}

					this.localPictures.update((pics) => pics.filter((pic) => pic.id !== picture.id));

					this.#store.dispatch(
						ApplicationActions.showSuccessSnackbar({
							message: 'Image supprimée'
						})
					);
				}),
				catchError((err) => {
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';
					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
					return EMPTY;
				}),

				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}
}
