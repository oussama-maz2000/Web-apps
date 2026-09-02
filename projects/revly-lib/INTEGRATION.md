# Revly Translation System Integration Guide

## Setup in Main Application

### 1. Asset Configuration

First, configure your `angular.json` to include the translation files from the library:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "**/*",
    "input": "./node_modules/revly-lib/src/assets/i18n",
    "output": "/assets/i18n"
  }
]
```

Or copy the translation files directly to your project's assets folder:

```
src/assets/i18n/
├── ar/
│   └── shared/
│       ├── common.json
├── fr/
│       ├── common.json
└── en/
│       ├── common.json
```

### 2. Module Integration

#### For Standalone Applications:

In your `main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { RevlyTranslationModule } from 'revly-lib';

bootstrapApplication(AppComponent, {
	providers: [
		provideHttpClient(), // Required for translations to work
		importProvidersFrom(RevlyTranslationModule)
	]
}).catch((err) => console.error(err));
```

#### For NgModule-based Applications:

In your `app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RevlyTranslationModule } from 'revly-lib';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		HttpClientModule, // Required for translations to work
		RevlyTranslationModule
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
```

### 3. Adding Language Switcher to Your App

Add the language switcher component to your template:

```html
<app-revlib-language-switcher></app-revlib-language-switcher>
```

### 4. Component-Specific Translations

To define translation requirements for a component:

```typescript
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationRequirement, TranslationFacade } from 'revly-lib';

@Component({
	selector: 'app-my-component'
	// ...
})
export class MyComponent implements OnInit {
	private readonly translationFacade = inject(TranslationFacade);
	private readonly destroyRef = inject(DestroyRef);

	// Define translation requirements
	private translationRequirements: TranslationRequirement[] = [
		{ namespace: 'components.my-feature', priority: 'eager' }
	];

	ngOnInit(): void {
		// Load component-specific translations
		this.translationFacade
			.loadTranslations(this.translationRequirements)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe();
	}
}
```

## Troubleshooting

### Common Issues

1. **Translations not applying immediately**

    This has been fixed in the latest version. If you still see this issue:
    - Check browser console for errors
    - Ensure HttpClientModule is properly imported
    - Verify translation files are properly loaded (check network tab)

2. **Arabic text not displaying correctly**
    - Check if Arabic font is available in your application
    - Verify the Arabic.json files are UTF-8 encoded
    - Check network requests to confirm Arabic translation files are loaded
    - Try adding a web font that supports Arabic characters:

    ```css
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic&display=swap');

    [dir='rtl'] {
    	font-family: 'Noto Sans Arabic', sans-serif;
    }
    ```

3. **Console errors with TranslateStore**
    - Make sure you have HttpClientModule imported in your app
    - Check that you're not importing TranslateModule directly in your app

## Adding Additional Languages

1. Create a new enum value in `LanguageEnum`
2. Add translation files for the new language (copy structure from existing files)
3. Update the `availableLanguages` array in `LanguageSwitcherComponent`

## Translation File Structure

The translation system supports organizing translation files by namespace:

### Shared Translations

Files in the `shared` namespace are loaded eagerly at application startup:

```
/assets/i18n/shared/common/en.json
/assets/i18n/shared/common/fr.json
/assets/i18n/shared/common/ar.json
```

### Component-Specific Translations

Component translations can be loaded lazily when the component is initialized:

```
/assets/i18n/components/my-feature/en.json
/assets/i18n/components/my-feature/fr.json
/assets/i18n/components/my-feature/ar.json
```

Translation JSON files follow a nested structure:

```json
{
	"welcome": "Welcome to our application",
	"buttons": {
		"save": "Save",
		"cancel": "Cancel"
	}
}
```

To access these translations in templates:

```html
<h1>{{ 'shared.common.welcome' | translate }}</h1>
<button>{{ 'shared.common.buttons.save' | translate }}</button>
```
