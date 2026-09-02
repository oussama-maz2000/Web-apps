# RevlyLib

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build revly-lib
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:

    ```bash
    cd dist/revly-lib
    ```

2. Run the `npm publish` command to publish your library to the npm registry:
    ```bash
    npm publish
    ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Translation System Integration Guide

The Revly library includes a comprehensive translation system that supports multiple languages, RTL text, and component-specific translations.

### Quick Start

1. Import the RevlyTranslationModule in your application module:

```typescript
import { RevlyTranslationModule } from 'revly-lib';

@NgModule({
	imports: [
		// ...
		RevlyTranslationModule
	]
})
export class AppModule {}
```

2. Add the language switcher to your layout:

```html
<app-revlib-language-switcher></app-revlib-language-switcher>
```

### Using Translations

#### In Templates

Use the pipe for simple translations:

```html
<h1>{{ 'shared.common.welcome' | translate }}</h1>
```

With parameters:

```html
<p>{{ 'shared.common.errors.minLength' | translate:{value: 8} }}</p>
```

#### In Components

For component-specific translations, define translation requirements:

```typescript
import { TranslationRequirement, TranslationFacade } from 'revly-lib';

// Define translation requirements directly
private translationRequirements: TranslationRequirement[] = [
  { namespace: 'components.my-feature', priority: 'eager' }
];

constructor(private translationFacade: TranslationFacade) {}

ngOnInit(): void {
  this.translationFacade.loadTranslations(this.translationRequirements)
    .subscribe();
}
```

### Translation File Structure

The translation system uses a structured namespace approach:

- `/assets/i18n/shared/common/` - Shared translations (loaded eagerly)
- `/assets/i18n/components/` - Component-specific translations (loaded when needed)

This structure keeps translations organized and makes it easier to manage them as the application grows.

### RTL Support

Arabic and other RTL languages are automatically handled. When an RTL language is selected, the `dir="rtl"` attribute is set on the HTML element.

Add RTL-specific CSS using the direction attribute:

```css
[dir='rtl'] .my-element {
	/* RTL-specific styles */
	margin-right: 0;
	margin-left: 10px;
}
```

### Supported Languages

- English (default)
- French
- Arabic

To add more languages:

1. Update the LanguageEnum
2. Add translation files for the new language
3. Update the language switcher component

For more detailed information about the translation system, please refer to the [INTEGRATION.md](INTEGRATION.md) file.
