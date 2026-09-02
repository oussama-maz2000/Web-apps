export { ENVIRONMENT } from '../lib/environment';

// Interceptors
export { provideLibDiInterceptors } from '../lib/core/interceptors/interceptors.provider';
export { languageInterceptor } from '../lib/core/interceptors/language.interceptor';

// API
export * from '../lib/core/api/api-auth-endpoints';
export {
	API_BIZ_CLAIM_ENDPOINTS,
	API_BIZ_ENDPOINTS,
	API_BIZ_VERIFICATION_ENDPOINTS
} from '../lib/core/api/api-biz-endpoints';
export { API_BIZ_FOOD_ENDPOINTS } from '../lib/core/api/api-biz-food-endpoints';
export { API_BIZ_PROFILE_ENDPOINTS } from '../lib/core/api/api-biz-profile-endpoints';
export { API_CATEGORY_ENDPOINTS } from '../lib/core/api/api-category-endpoints';
export * from '../lib/core/api/api-common-endpoints';
export { DEFAULT_API_CONFIG, GOOGLE_CONFIG, TOKENS_NAME } from '../lib/core/api/api-config';
export type { ApiConfig, ApiEndpoint, ApiPayloadParams, HttpVerb } from '../lib/core/api/api-config';
export { API_REVIEW_ENDPOINTS } from '../lib/core/api/api-review-endpoints';
export { API_REVIEW_REACT_ENDPOINTS } from '../lib/core/api/api-review-react-endpoints';
export { API_REVIEW_REPLY_ENDPOINTS } from '../lib/core/api/api-review-reply-endpoints';
export { AUTH_PATHS, AUTH_ROUTES } from '../lib/core/routes/auth.routes';
export { CONTROL_PATHS, CONTROL_ROUTES } from '../lib/core/routes/control.routes';

export { HttpClientApi } from '../lib/core/internal/http-client/http-client-api.service';

// Error handling
export { ErrorHandlerCoreService } from '../lib/core/internal/error/error-handler-core.service';
export type { ErrorMetadata, NormalizedError } from '../lib/core/internal/error/error-handler-core.service';

// Export identity services
export { IdentityStateService } from '../lib/state/identity-state.service';

// Tokens
export { LOCATION, NAVIGATOR, REVLY_REQUEST, REVLY_RESPONSE, WINDOW } from '../lib/core/tokens/platform.tokens';
