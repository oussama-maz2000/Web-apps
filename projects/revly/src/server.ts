import {
	AngularNodeAppEngine,
	createNodeRequestHandler,
	isMainModule,
	writeResponseToNodeResponse
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { join } from 'node:path';
// CommonJS style (if your server.ts uses require)
import crypto from 'crypto';
import { REVLY_REQUEST, REVLY_RESPONSE } from '@revlib/core';
import { SsrContext } from '@revlib/models';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// SSR Context Storage to bypass DI hierarchy issues
const ssrContextStorage = new AsyncLocalStorage<SsrContext>();
globalThis.revlySsrContext = ssrContextStorage;

// Global app config
if (process.env['NODE_ENV'] === 'production') {
	app.set('json spaces', 0);
	app.disable('x-powered-by');
	app.set('trust proxy', 1); // If behind nginx/cloudflare
}

//todo add compression midlleware after security? npm install compression @types/compression
/*
 // After security headers, before static files
 app.use(compression({
 threshold: 1024, // Only compress responses > 1KB
 level: 6 // Balance between speed and compression (1-9)
 }));
 */

/**
 * 1. Security & Performance Middleware
 */
app.use((_req, res, next) => {
	// Generate nonce for this request
	const nonce = crypto.randomBytes(16).toString('base64');
	res.locals['cspNonce'] = nonce;

	// Security headers
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	res.setHeader('X-DNS-Prefetch-Control', 'on');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

	// HSTS only in production
	if (process.env['NODE_ENV'] === 'production') {
		res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	}

	// CSP - tailored for Angular SSR + Leaflet + Google Sign-In

	//temporary disabled until we figure out how to apply without breaking the app
	/*
	 const cspDirectives = [
	 "default-src 'self'",
	 `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com`, // Removed unsafe-inline/eval
	 `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`, // Angular inline styles need nonce
	 "font-src 'self' https://fonts.gstatic.com",
	 "img-src 'self' data: https://tile.openstreetmap.org https://*.google.com", // Added OSM tiles
	 "connect-src 'self' https://tile.openstreetmap.org https://nominatim.openstreetmap.org https://accounts.google.com", // API calls
	 'frame-src https://accounts.google.com', // Google Sign-In iframe
	 "object-src 'none'",
	 "base-uri 'self'",
	 "form-action 'self'"
	 ].join('; ');

	 res.setHeader('Content-Security-Policy', cspDirectives);
	 */

	next();
});

/**
 * 2. Health check (before static files/Angular handler)
 */
app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

/**
 * 3. Serve static files from /browser (with Smart Caching)
 */
app.use(
	express.static(browserDistFolder, {
		maxAge: '1y',
		index: false, // Don't serve index.html from static
		redirect: false,
		etag: true,
		setHeaders: (res, path) => {
			// Optional: additional headers for static assets only
			if (path.endsWith('.html')) {
				// HTML: no cache (always fresh)
				res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
				return;
			}

			if (path.match(/\.[a-f0-9]{16,}\.(js|css|woff2?)$/)) {
				res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
				return;
			}

			// Everything else: short cache
			res.setHeader('Cache-Control', 'public, max-age=3600');
		}
	})
);

/**
 * 4. Angular SSR handler: Handle all other requests by rendering the Angular application.
 */
app.use(async (req, res, next) => {
	const startTime = Date.now();

	try {
		// Wrap the execution in AsyncLocalStorage for non-DI access if needed
		await ssrContextStorage.run({ req }, async () => {
			const response = await angularApp.handle(req, {
				// Inject nonce into Angular's DI system,  Without this, inline scripts will be blocked.
				providers: [
					{ provide: 'CSP_NONCE', useValue: res.locals['cspNonce'] },
					{ provide: REVLY_REQUEST, useValue: req },
					{ provide: REVLY_RESPONSE, useValue: res }
				]
			});

			if (response) {
				const renderTime = Date.now() - startTime;
				res.setHeader('Server-Timing', `ssr;dur=${renderTime}`);
				await writeResponseToNodeResponse(response, res);
			} else {
				next();
			}
		});
	} catch (err) {
		console.error(`💥 SSR Error at ${req.path}:`, err);
		next(err);
	}
});

/**
 * 5. Global Error Handler
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	console.error('Express Error Handler:', err);

	const response = {
		error: 'Internal Server Error',
		...(process.env['NODE_ENV'] === 'development' && { message: err.message, stack: err.stack })
	};

	res.status(statusCode).json(response);
});

/**
 * 6. Start the server
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
	const port = process.env['PORT'] || 4000;
	const server = app.listen(port, () => {
		console.log(`\n🚀 Node Express server listening on http://localhost:${port}`);
	});

	server.on('error', (err: NodeJS.ErrnoException) => {
		if (err.code === 'EADDRINUSE') {
			console.error(`Port ${port} already in use`);
		} else {
			console.error('Server error:', err.message);
		}
		process.exit(1);
	});
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
