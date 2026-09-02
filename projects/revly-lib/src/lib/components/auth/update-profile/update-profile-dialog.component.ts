import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@revlib/components/base.component';
import { Languages, LocationCoordinates, UpdateUserProfileReqDto } from '@revlib/models';
import { SnackbarService } from '@revlib/services';
import { ApplicationActions, AppState, selectUserProp } from '@revlib/store';
import { nameValidator } from '@revlib/utils';
import { COMMON_IMPORTS } from '../../../../../../revly/src/app.shared.imports';
import { LocationFacade } from '../../../facades/location/location-facade.service';

@Component({
	selector: 'app-update-profile-dialog',
	standalone: true,
	templateUrl: './update-profile-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		...COMMON_IMPORTS,
		ReactiveFormsModule,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		MatSelectModule,
		MatRadioModule,
		MatTooltipModule,
		MatProgressSpinnerModule,
		MatDialogModule
	]
})
export class UpdateProfileDialogComponent extends BaseComponent implements OnInit {
	private readonly fb = inject(FormBuilder);
	protected readonly locationFacade = inject(LocationFacade);
	readonly #snackbarService = inject(SnackbarService);
	readonly dialogRef = inject(MatDialogRef<UpdateProfileDialogComponent>);
	readonly #store = inject(Store<AppState>);

	readonly languages = Languages;
	updateProfileForm!: FormGroup;
	readonly #name = this.#store.selectSignal(selectUserProp('name'));
	readonly hasNameChanges = this.#store.selectSignal(selectUserProp('hasNameChanged'));

	private coordinates = signal<LocationCoordinates | null>(null);

	constructor() {
		super();
	}

	ngOnInit(): void {
		this.loadLocationData();
		this.initForm();
	}

	get nameControl() {
		return this.updateProfileForm.get('name');
	}
	get municipalityControl() {
		return this.updateProfileForm.get('municipality');
	}
	get stateControl() {
		return this.updateProfileForm.get('state');
	}

	get preferredLanguageControl() {
		return this.updateProfileForm.get('preferredLanguage');
	}

	initForm() {
		this.updateProfileForm = this.fb.group({
			name: [
				{ value: this.#name(), disabled: this.hasNameChanges() },

				[Validators.required, Validators.minLength(5), Validators.maxLength(60), nameValidator]
			],
			state: [null, Validators.required],
			municipality: [null, Validators.required],
			preferredLanguage: [{ value: this.languages[2].value, disabled: false }, Validators.required]
		});
	}

	loadLocationData(): void {
		if (this.locationFacade.wilayasLoading()) return;
		const locationSub = this.locationFacade.loadWilayas().subscribe();
		this.subscriptions.add(locationSub);
	}

	onWilayaChange(wilayaCode: number, municipalityCode?: number): void {
		if (!wilayaCode) return;

		const wilaya = this.locationFacade.wilayas()?.find((w) => w.code === wilayaCode);
		if (wilaya) {
			this.locationFacade.selectWilaya(wilaya);
			this.municipalityControl?.updateValueAndValidity();
			const municipalitiesSub = this.locationFacade.loadMunicipalities(wilayaCode).subscribe();
			this.subscriptions.add(municipalitiesSub);

			if (municipalityCode) this.municipalityControl?.setValue(municipalityCode);
		}
	}

	detectLocation(): void {
		if (!navigator.geolocation) {
			this.#snackbarService.warning("La géolocalisation n'est pas supportée par votre navigateur", {
				duration: 3000
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const coords: LocationCoordinates = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				};

				this.coordinates.set(coords);

				// Use the location facade to detect location based on coordinates
				// Backend handles that automatically if state/municipality=0 and fallback resolution from coordinate but this is for ui
				const locationSub = this.locationFacade.detectLocationByCoordinates(coords).subscribe({
					complete: () => {
						const location = this.locationFacade.currentLocation();
						if (location) {
							// Update form with detected location
							this.stateControl?.setValue(location.stateCode);

							// Trigger wilaya change to load municipalities
							this.onWilayaChange(location.stateCode, location.municipalityCode);
						}
					},
					error: () => {
						this.#store.dispatch(
							ApplicationActions.showErrorSnackbar({
								message:
									'Échec de la détection de votre emplacement. Veuillez sélectionner manuellement.'
							})
						);
					}
				});

				this.subscriptions.add(locationSub);
			},
			() => {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: 'Échec de la détection de votre emplacement. Veuillez sélectionner manuellement.'
					})
				);
			}
		);
	}

	onConfirm() {
		const updateForm = this.updateProfileForm.value;
		const hasCoordinates = this.coordinates()?.longitude && this.coordinates()?.latitude;

		const userProfileRequest: UpdateUserProfileReqDto = {
			name: updateForm.name ?? this.#name(),
			preferredLanguage: updateForm.preferredLanguage,
			location: {
				stateCode: hasCoordinates ? 0 : (updateForm.state ?? 0),
				municipalityCode: hasCoordinates ? 0 : (updateForm.municipality ?? 0),
				longitude: this.coordinates()?.longitude ?? 0,
				latitude: this.coordinates()?.latitude ?? 0
			}
		};

		this.dialogRef.close(userProfileRequest);
	}

	onCancel(): void {
		this.dialogRef.close();
	}
}
