import { createReducer, on } from '@ngrx/store';
import { GenderEnum } from '@revlib/models';
import { FEATURES_FLAGS } from '../../core/features-flags';
import { DEFAULT_LANGUAGE } from '../../core/internal/language/language-core.service';
import { UserDto } from '../../models/responses/userDto.model';
import { UserActions } from './user.action';

const initialUserState: UserDto = {
	idEnc: '',
	name: '',
	gender: GenderEnum.Undefined,
	preferredLanguage: DEFAULT_LANGUAGE,
	profilePictureUrl: '',
	location: {
		longitude: 0,
		latitude: 0,
		stateCode: 0,
		municipalityCode: 0,
		stateName: '',
		municipalityName: ''
	},
	email: '',
	phoneNumber: '',
	isVerified: false,
	isBizOwnerOrClaimer: false,
	isExternalUser: false,
	hasNameChanged: false,
	ownedBusinessesIds: null,
	claimedBusinessesIds: null
};

export const userReducer = createReducer(
	initialUserState,
	on(UserActions.setUser, (state, { user }) => ({
		...state,
		...user,
		isVerified: FEATURES_FLAGS.sms ? user.isVerified : true
	})),

	on(UserActions.setUserLanguage, (state, { language }) => ({
		...state,
		preferredLanguage: language
	})),

	on(UserActions.setUserLocation, (state, { location }) => ({
		...state,
		location: {
			...state.location,
			...location
		}
	})),

	on(UserActions.clearUser, () => initialUserState),

	on(UserActions.uploadUserImageSuccess, (state, { uploadedImageUrl }) => ({
		...state,
		profilePictureUrl: uploadedImageUrl
	}))
);
