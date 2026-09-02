export { getGenderLabel, toLanguageCode } from '../lib/utils/enum-types-utils';
export { isAndroid, isIOS, isMobile } from '../lib/utils/platform-detection.utils';
export {
	createErrorResult,
	getFirstErrorCode,
	getFirstErrorMessage,
	hasValue,
	isResultOfType
} from '../lib/utils/result-utils';

export { buildImageUrl } from '../lib/utils/image-helpers.utils';
export {
	businessPhonePatternValidator,
	emailPatternValidator,
	landlinePhonePatternValidator,
	mobilePhonePatternValidator,
	nameValidator,
	passwordValidators,
	sameAsCurrentValidator,
	socialLinkValidator
} from '../lib/utils/validators';
