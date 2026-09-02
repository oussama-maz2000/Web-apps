import { ApiEndpoint } from './api-config';

export const API_REVIEW_REPLY_ENDPOINTS = {
	REPLY: { path: 'ReviewReply/Reply', httpVerb: 'POST' },
	DELETE: { path: 'ReviewReply/Delete', httpVerb: 'DELETE' }
} satisfies Record<string, ApiEndpoint>;
