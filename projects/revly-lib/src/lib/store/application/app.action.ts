import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Result } from '@revlib/models';

export const ApplicationActions = createActionGroup({
	source: 'APPLICATION',
	events: {
		init: emptyProps(),
		logIn: emptyProps(),
		logOut: emptyProps(),
		showSuccessSnackbar: props<{ message: string }>(),
		showErrorSnackbar: props<{ message: string }>(),
		checkIsStaff: emptyProps(),
		staffCheckCompleted: props<{ response: Result<string[]> }>()
	}
});
