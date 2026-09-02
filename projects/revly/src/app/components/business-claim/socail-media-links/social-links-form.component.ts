// social-links-form/social-links-form.component.ts
import { Component, input } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
	selector: 'app-social-links-form',
	standalone: true,
	imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
	templateUrl: './social-links-form.component.html'
})
export class SocialLinksFormComponent {
	form = input.required<FormGroup>();

	// Validateur personnalisé : au moins un lien (Google Maps obligatoire)
	atLeastOneSocialLinkValidator(group: FormGroup): ValidationErrors | null {
		const controls = group.controls as {
			googleMaps: AbstractControl;
			facebook: AbstractControl;
			instagram: AbstractControl;
			website: AbstractControl;
		};

		const hasGoogleMaps = !!controls.googleMaps.value?.trim();
		const hasAnyOther =
			!!controls.facebook.value?.trim() ||
			!!controls.instagram.value?.trim() ||
			!!controls.website.value?.trim();

		return hasGoogleMaps || hasAnyOther ? null : { atLeastOneRequired: true };
	}

	// Helper pour afficher l'erreur globale
	hasAtLeastOneError(): boolean {
		return this.form().hasError('atLeastOneRequired') && this.form().touched;
	}
}
