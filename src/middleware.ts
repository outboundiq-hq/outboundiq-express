import { AsyncLocalStorage } from 'async_hooks';
import type { Request, Response, NextFunction } from 'express';
import { setUserContextResolver } from '@outboundiq/core/node';
import type { UserContext } from '@outboundiq/core';

/**
 * AsyncLocalStorage to track the current request across async operations
 */
const requestStorage = new AsyncLocalStorage<Request>();

/**
 * Flag to track if we've set up the resolver
 */
let resolverConfigured = false;

/**
 * Extract user context from Express request
 */
function extractUserContext(req: Request): UserContext | null {
  // Check for user on request (set by passport, express-session, etc.)
  const user = (req as any).user;
  
  if (!user) {
    return null;
  }

  // Try common user ID field names
  const userId = user.id ?? user._id ?? user.userId ?? user.sub ?? null;
  
  // Get user type from constructor name or explicit type
  const userType = user.type ?? user.role ?? user.constructor?.name ?? 'User';

  return {
    userId: userId ? String(userId) : null,
    userType: String(userType),
    context: 'authenticated',
  };
}

/**
 * Configure the global user context resolver
 * This is called once when middleware is first used
 */
function configureResolver(): void {
  if (resolverConfigured) return;

  setUserContextResolver(() => {
    const req = requestStorage.getStore();
    if (!req) return null;
    return extractUserContext(req);
  });

  resolverConfigured = true;
}

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
 * init({ apiKey: process.env.OUTBOUNDIQ_KEY });
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
export function userContextMiddleware() {
  // Set up the resolver on first use
  configureResolver();

  return (req: Request, _res: Response, next: NextFunction): void => {
    // Run the rest of the request inside the async context
    requestStorage.run(req, () => {
      next();
    });
  };
}

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
export function setRequestUserContext(req: Request, context: UserContext): void {
  (req as any).__outboundiq_context = context;
}

/**
 * Get the current request from async context (if available)
 */
export function getCurrentRequest(): Request | undefined {
  return requestStorage.getStore();
}

