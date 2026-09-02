import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
	afterNextRender,
	Component,
	DestroyRef,
	ElementRef,
	inject,
	input,
	signal,
	viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { NAVIGATOR } from '@revlib/core';
import { ApplicationActions, AppState } from '@revlib/store';

@Component({
	selector: 'app-location-form',
	standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		DecimalPipe
	],
	templateUrl: './location-form.component.html'
})
export class LocationFormComponent {
	// Input signal
	form = input.required<FormGroup>();

	// ViewChild signals
	mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
	searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

	private http = inject(HttpClient);
	readonly #store = inject(Store<AppState>);
	readonly #destroyRef = inject(DestroyRef);

	// Explicitly type as Navigator | null to match the InjectionToken factory
	private navigator = inject(NAVIGATOR) as Navigator | null;

	// State signals
	private map = signal<L.Map | null>(null);
	private marker = signal<L.Marker | null>(null);
	private L: any = null;
	selectedAddress = signal<string>('');
	locating = signal<boolean>(false);

	private readonly defaultCenter: L.LatLngTuple = [36.7538, 3.0588];
	private readonly defaultZoom = 6;

	constructor() {
		afterNextRender(async () => {
			this.L = await import('leaflet');
			this.initMap();

			const currentLat = this.form().value.latitude;
			const currentLng = this.form().value.longitude;
			if (currentLat && currentLng) {
				this.selectLocation(currentLat, currentLng);
			}
		});

		// Cleanup on destroy
		this.#destroyRef.onDestroy(() => {
			this.marker()?.remove();
			this.map()?.remove();
		});
	}

	private initMap(): void {
		if (!this.L) return;

		const mapElement = this.mapContainer().nativeElement;
		const leafletMap = this.L.map(mapElement, {
			attributionControl: false
		}).setView(this.defaultCenter, this.defaultZoom);

		const attributionControl = this.L.control.attribution({ position: 'bottomright' });
		attributionControl.addTo(leafletMap);
		attributionControl.setPrefix('');

		this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(leafletMap);

		leafletMap.on('click', (e: L.LeafletMouseEvent) => {
			this.selectLocation(e.latlng.lat, e.latlng.lng);
		});

		this.map.set(leafletMap);
	}

	private selectLocation(lat: number, lng: number): void {
		this.form().patchValue({
			latitude: lat,
			longitude: lng,
			stateCode: null,
			municipalityCode: null
		});

		this.placeMarker(lat, lng);
		this.fetchAndSetAddress(lat, lng);
	}

	private placeMarker(lat: number, lng: number): void {
		const map = this.map();
		if (!map || !this.L) return;

		this.marker()?.remove();

		const customIcon = this.L.divIcon({
			className: 'custom-div-marker',
			html: `
                <div style="background-color: #1976d2; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
                <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%; margin: -18px auto 0;"></div>
            `,
			iconSize: [24, 36],
			iconAnchor: [12, 36],
			popupAnchor: [0, -36]
		});

		const newMarker = this.L.marker([lat, lng], { icon: customIcon })
			.addTo(map)
			.bindPopup('Emplacement sélectionné')
			.openPopup();

		this.marker.set(newMarker);
		map.setView([lat, lng], 15);
	}

	searchAddress(): void {
		const query = this.searchInput().nativeElement.value.trim();
		if (!query) return;

		this.http
			.get<any[]>(`https://nominatim.openstreetmap.org/search`, {
				params: {
					q: query,
					format: 'json',
					limit: '1',
					countrycodes: 'dz',
					addressdetails: '1'
				}
			})
			.pipe(takeUntilDestroyed(this.#destroyRef))
			.subscribe((results) => {
				if (results.length > 0) {
					const { lat, lon, display_name } = results[0];
					const latitude = parseFloat(lat);
					const longitude = parseFloat(lon);

					this.selectLocation(latitude, longitude);
					this.form().patchValue({ fullAddress: display_name });
				} else {
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: 'Aucun résultat trouvé pour cette adresse.'
						})
					);
				}
			});
	}

	useCurrentLocation(): void {
		// Safe check for the injected navigator
		if (!this.navigator?.geolocation) {
			this.#store.dispatch(
				ApplicationActions.showErrorSnackbar({
					message: "La géolocalisation n'est pas supportée par votre navigateur."
				})
			);
			return;
		}

		this.locating.set(true);

		// Added explicit type GeolocationPosition to fix TS7006
		this.navigator.geolocation.getCurrentPosition(
			(position: GeolocationPosition) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				this.selectLocation(lat, lng);
				this.locating.set(false);
			},
			() => {
				this.#store.dispatch(
					ApplicationActions.showErrorSnackbar({
						message: "Impossible d'obtenir votre position. Vérifiez les autorisations."
					})
				);
				this.locating.set(false);
			}
		);
	}

	private fetchAndSetAddress(lat: number, lng: number): void {
		this.http
			.get<any>(`https://nominatim.openstreetmap.org/reverse`, {
				params: {
					lat: lat.toString(),
					lon: lng.toString(),
					format: 'json',
					addressdetails: '1'
				}
			})
			.pipe(takeUntilDestroyed(this.#destroyRef))
			.subscribe({
				next: (result) => {
					const address = result.display_name || 'Adresse inconnue';
					this.selectedAddress.set(address);
					this.form().patchValue({ fullAddress: address });
				},
				error: () => {
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: "Impossible de récupérer l'adresse pour cet emplacement."
						})
					);
					this.form().patchValue({ fullAddress: '' });
				}
			});
	}
}
