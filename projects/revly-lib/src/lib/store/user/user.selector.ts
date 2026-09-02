import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserDto } from '../../models/responses/userDto.model';

export const USER_FEATURE_KEY = 'user';

export const selectUserState = createFeatureSelector<UserDto>(USER_FEATURE_KEY);
export const selectUser = createSelector(selectUserState, (state) => state);

// to use dynamic select : store.select(selectUserProp('email'))
export const selectUserProp = <K extends keyof UserDto>(prop: K) =>
	createSelector(selectUserState, (state) => state[prop]);

// to use dynamic select path : store.select(selectUserPath(['location', 'latitude']))
export const selectUserPath = (path: (string | number)[]) =>
	// i don't wanna remove any here because generic it's best practice with proper typing
	createSelector(selectUserState, (state) => path.reduce((value: any, key: any) => value?.[key], state));
