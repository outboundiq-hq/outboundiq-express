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

// Re-export everything from core/node
export {
  // Core client functions
  init,
  getClient,
  track,
  flush,
  setUserContext,
  // Node.js specific
  patchNodeHttp,
  unpatchNodeHttp,
  setUserContextResolver,
  // Types
  type OutboundIQConfig,
  type UserContext,
  type ApiCall,
} from '@outboundiq/core/node';

// Re-export API Intelligence functions from core
export {
  recommend,
  providerStatus,
  endpointStatus,
  type RecommendationResult,
  type ProviderStatusResult,
  type EndpointStatusResult,
  type IntelligenceOptions,
} from '@outboundiq/core';

// Export Express-specific middleware
export {
  userContextMiddleware,
  setRequestUserContext,
  getCurrentRequest,
} from './middleware';

// Import for our init wrapper
import { 
  init as coreInit,
  patchNodeHttp,
  patchFetch,
} from '@outboundiq/core/node';
import type { OutboundIQConfig } from '@outboundiq/core';

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
export function initExpress(config: OutboundIQConfig): void {
  // Initialize the core client
  coreInit(config);
  
  // Patch Node.js http/https modules (for axios, got, node-fetch, etc.)
  patchNodeHttp();
  
  // Patch global fetch (Node.js 18+ built-in fetch)
  patchFetch();
  
  console.log('[OutboundIQ] Initialized for Express.js');
}

// Also export as default init for convenience
export { initExpress as default };

