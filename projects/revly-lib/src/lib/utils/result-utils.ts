import { Result } from '../models/common/result';

export function getFirstErrorCode<T>(errorResult: Result | Result<T>): string | undefined {
	return errorResult.errors?.[0]?.errorCode?.code;
}

export function getFirstErrorMessage<T>(errorResult: Result | Result<T>): string | undefined {
	return errorResult.errors?.[0]?.message;
}

// Optional: Helper functions to work with result objects
// Type guard function with generic type inference
export function isResultOfType<T extends object>(
	result: Result<unknown>,
	typeGuard: (data: unknown) => data is T
): result is Result<T> {
	return typeGuard(result.value);
}

// Type guard to check if value exists in a successful result
export const hasValue = <T>(result: Result<T>): result is Result<T> & { value: T } => {
	return result.isSucceeded && result.value !== undefined;
};

export const createErrorResult = (message: string, code = ''): Result => {
	const result: Result = { isSucceeded: false, errors: [{ errorCode: { code }, message }] };
	return result;
};
