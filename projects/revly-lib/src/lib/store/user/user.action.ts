import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LanguageEnum } from '@revlib/models';
import { UserDto } from '../../models/responses/userDto.model';
import { LocationDto } from '../../models/types/location.types';

export const UserActions = createActionGroup({
	source: 'USER',
	events: {
		setUser: props<{ user: UserDto }>(),
		setUserLanguage: props<{ language: LanguageEnum }>(),
		setUserLocation: props<{ location: LocationDto }>(),
		uploadUserImage: props<{ file: File }>(),
		uploadUserImageSuccess: props<{ uploadedImageUrl: string }>(),
		uploadUserImageFailure: emptyProps(),
		clearUser: emptyProps()
	}
});
