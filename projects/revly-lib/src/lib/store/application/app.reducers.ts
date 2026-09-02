import { createReducer, on } from '@ngrx/store';
import { APP_ROLES } from '../../services/admin/model/app-role-type';
import { ApplicationActions } from './app.action';
import { ApplicationModel } from './app.model';

const initialApplication: ApplicationModel = {
	isAuthenticated: false,
	lastTimeAuthenticated: null,
	isStaff: false,
	isAppAdmin: false,
	isAppMod: false
};

export const appReducer = createReducer<ApplicationModel>(
	initialApplication,
	on(ApplicationActions.logIn, (state) => ({
		...state,
		isAuthenticated: true,
		lastTimeAuthenticated: new Date()
	})),

	on(ApplicationActions.logOut, (state) => ({
		...state,
		isAuthenticated: false
	})),

	on(ApplicationActions.staffCheckCompleted, (state, { response }) => ({
		...state,
		isStaff: response.isSucceeded ?? false,
		isAppAdmin: response.value!.includes(APP_ROLES.Admin) || false,
		isAppMod: (response.isSucceeded && response.value!.includes(APP_ROLES.Moderator)) || false
	}))
);
