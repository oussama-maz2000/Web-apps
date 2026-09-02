import { ActionReducerMap } from '@ngrx/store';
import { userReducer } from './user/user.reducer';
import { appReducer } from './application/app.reducers';
import { ApplicationModel } from './application/app.model';
import { UserDto } from '../models/responses/userDto.model';

export interface AppState {
	app: ApplicationModel;
	user: UserDto;
}

export const storeApp: ActionReducerMap<AppState> = {
	app: appReducer,
	user: userReducer
};
