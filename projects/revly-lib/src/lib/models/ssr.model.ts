import type { AsyncLocalStorage } from 'async_hooks';
import type { Request } from 'express';

export interface SsrContext {
	req: Request;
}

declare global {
	var revlySsrContext: AsyncLocalStorage<SsrContext> | undefined;
}
