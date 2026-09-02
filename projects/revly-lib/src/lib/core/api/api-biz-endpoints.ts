import { ApiEndpoint } from './api-config';

export const API_BIZ_ENDPOINTS = {
	ADD_UNCLAIMED: { path: 'biz/addunclaimed' },
	ADD_CLAIMED: { path: 'biz/addclaimed' },
	DELETE: { path: 'biz/delete', httpVerb: 'DELETE' }
} satisfies Record<string, ApiEndpoint>;

export const API_BIZ_CLAIM_ENDPOINTS = {
	ADD: { path: 'Biz/Account/AddClaimed' },
	CANCEL: { path: 'Biz/Claim/Cancel/:bizId', httpVerb: 'DELETE' },
	STATUS: { path: 'Biz/Claim/Status', httpVerb: 'GET' },
	CLAIM: { path: 'Biz/Claim', httpVerb: 'POST' }
} satisfies Record<string, ApiEndpoint>;

export const API_BIZ_VERIFICATION_ENDPOINTS = {
	ConfirmClaim: { path: 'biz/verification/confirmclaim' }
} satisfies Record<string, ApiEndpoint>;
