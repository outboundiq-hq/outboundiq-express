export { ApiCall, OutboundIQConfig, UserContext, flush, getClient, init, patchNodeHttp, setUserContext, setUserContextResolver, track, unpatchNodeHttp } from '@outboundiq/core/node';
import { Request, Response, NextFunction } from 'express';
import { UserContext, OutboundIQConfig } from '@outboundiq/core';

/**
 * Express middleware that captures the current request for user context tracking.
 *
 * This middleware uses AsyncLocalStorage to propagate the request object
 * across async boundaries, allowing the SDK to automatically capture
 * user context from `req.user` for each outbound API call.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { init, userContextMiddleware } from '@outboundiq/express';
 *
 * const app = express();
 *
 * init({ apiKey: process.env.OUTBOUNDIQ_API_KEY });
 *
 * // Add after your auth middleware (passport, etc.)
 * app.use(userContextMiddleware());
 *
 * app.get('/api/users', async (req, res) => {
 *   // API calls here will automatically include user context
 *   const data = await fetch('https://api.example.com/users');
 *   res.json(await data.json());
 * });
 * ```
 */
declare function userContextMiddleware(): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Manually set user context for the current request.
 * Use this when you need to override automatic user detection.
 *
 * @example
 * ```typescript
 * app.post('/api/webhook', (req, res) => {
 *   // Webhooks don't have req.user, but we know the context
 *   setRequestUserContext(req, {
 *     userId: req.body.customer_id,
 *     userType: 'Customer',
 *     context: 'webhook',
 *   });
 *
 *   // Now API calls will have this context
 *   await fetch('https://api.stripe.com/...');
 * });
 * ```
 */
declare function setRequestUserContext(req: Request, context: UserContext): void;
/**
 * Get the current request from async context (if available)
 */
declare function getCurrentRequest(): Request | undefined;

/**
 * @outboundiq/express
 *
 * OutboundIQ SDK for Express.js applications.
 * Automatically tracks all outbound HTTP calls made from your Express app.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { init, userContextMiddleware } from '@outboundiq/express';
 *
 * const app = express();
 *
 * // Initialize OutboundIQ - patches fetch/http automatically
 * init({ apiKey: process.env.OUTBOUNDIQ_API_KEY });
 *
 * // Optional: track which user made each API call
 * app.use(userContextMiddleware());
 *
 * // Your routes - no changes needed!
 * app.get('/api/payment', async (req, res) => {
 *   // This fetch is automatically tracked
 *   const result = await fetch('https://api.stripe.com/v1/charges');
 *   res.json(await result.json());
 * });
 *
 * app.listen(3000);
 * ```
 */

/**
 * Initialize OutboundIQ for Express.js
 *
 * This function:
 * 1. Initializes the core OutboundIQ client
 * 2. Patches Node.js http/https modules to track all outbound calls
 * 3. Patches global fetch (if available)
 *
 * After calling this, ALL outbound HTTP requests are automatically tracked,
 * regardless of which HTTP client library you use (fetch, axios, got, etc.)
 *
 * @example
 * ```typescript
 * import { init } from '@outboundiq/express';
 *
 * // Minimal setup
 * init({ apiKey: process.env.OUTBOUNDIQ_API_KEY });
 *
 * // With options
 * init({
 *   apiKey: process.env.OUTBOUNDIQ_API_KEY,
 *   debug: true,
 *   batchSize: 20,
 * });
 * ```
 */
declare function initExpress(config: OutboundIQConfig): void;

export { initExpress as default, getCurrentRequest, initExpress, setRequestUserContext, userContextMiddleware };
