import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationModel } from './app.model';

export const APP_FEATURE_KEY = 'app';

export const selectApplicationState = createFeatureSelector<ApplicationModel>(APP_FEATURE_KEY);
export const selectApplication = createSelector(selectApplicationState, (state) => state);

// to use dynamic select : store.select(selectApplicationProp('isAuthenticated'))
export const selectApplicationProp = <K extends keyof ApplicationModel>(prop: K) =>
	createSelector(selectApplicationState, (state) => state[prop]);
