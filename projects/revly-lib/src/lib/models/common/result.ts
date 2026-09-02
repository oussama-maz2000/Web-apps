export interface Result<T = void> {
	isSucceeded: boolean;
	errors?: ErrorSuccessResponse[];
	success?: ErrorSuccessResponse;
	value?: T;
}

export interface ErrorSuccessResponse {
	errorCode: {
		code: string;
	};
	message?: string;
}
