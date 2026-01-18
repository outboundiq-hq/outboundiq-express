# @outboundiq/express

Automatic outbound API monitoring for Express.js applications. Track every HTTP request your application makes to external APIs with minimal setup.

## Installation

```bash
npm install @outboundiq/express
# or
yarn add @outboundiq/express
# or
pnpm add @outboundiq/express
```

## Quick Start

```javascript
const express = require('express');
const { initExpress, userContextMiddleware } = require('@outboundiq/express');

const app = express();

// Initialize OutboundIQ - this patches fetch/http automatically
initExpress({ apiKey: process.env.OUTBOUNDIQ_KEY });

// Optional: track which user made each API call
app.use(userContextMiddleware());

// Your routes - no changes needed!
app.get('/api/payment', async (req, res) => {
  // This fetch is automatically tracked!
  const result = await fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk_...' },
    body: JSON.stringify({ amount: 1000 }),
  });
  res.json(await result.json());
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## How It Works

When you call `initExpress()`, OutboundIQ:

1. **Patches Node.js `http` and `https` modules** - Catches all outbound requests
2. **Patches global `fetch`** - Catches fetch calls (Node.js 18+)
3. **Sends metrics non-blocking** - Fire-and-forget, never slows your app

This means **any** HTTP client library works automatically:
- `fetch()`
- `axios`
- `got`
- `node-fetch`
- `request`
- Native `http.request()`

## Configuration

```javascript
initExpress({
  // Required
  apiKey: process.env.OUTBOUNDIQ_KEY,
  
  // Optional
  debug: false,           // Enable debug logging
  batchSize: 10,          // Flush after N calls (default: 10)
  flushInterval: 5000,    // Flush every N ms (default: 5000)
  timeout: 5000,          // Timeout for sending metrics (default: 5000)
});
```

## User Context Tracking

Track which user made each API call:

```javascript
const passport = require('passport');

app.use(passport.authenticate('session'));
app.use(userContextMiddleware()); // Add after auth middleware

// Now all API calls include user context automatically
app.get('/api/orders', async (req, res) => {
  // req.user is captured and sent with the API call metrics
  const orders = await fetch('https://api.example.com/orders');
  res.json(await orders.json());
});
```

### Manual User Context

For webhooks or system operations without `req.user`:

```javascript
const { setRequestUserContext } = require('@outboundiq/express');

app.post('/webhook/stripe', (req, res) => {
  // Set context manually
  setRequestUserContext(req, {
    userId: req.body.customer_id,
    userType: 'Customer',
    context: 'webhook',
  });
  
  // API calls now have this context
  await fetch('https://api.internal.com/process');
  res.sendStatus(200);
});
```

## What Gets Tracked

For each outbound HTTP request:

| Field | Description |
|-------|-------------|
| URL | Full URL including query params |
| Method | GET, POST, PUT, DELETE, etc. |
| Status Code | 200, 404, 500, etc. |
| Duration | Response time in ms |
| Request Headers | Sanitized (auth tokens redacted) |
| Response Headers | Content-Type, etc. |
| Request Body | For POST/PUT requests |
| Response Body | API response (truncated) |
| User Context | Who made the request |

## Non-Blocking Guarantee

OutboundIQ uses **fire-and-forget** sending:

```
Your Express Route                    OutboundIQ
      │                                   │
      │  await fetch('stripe.com')        │
      │           │                       │
      │           ▼                       │
      │  ┌─────────────────────┐          │
      │  │ Intercepted         │          │
      │  │                     │          │
      │  │ 1. Make real call   │          │
      │  │ 2. Capture metrics  │          │
      │  │ 3. Queue for send   │          │
      │  │ 4. flush() ─────────────────▶ Background
      │  │    (NO AWAIT!)      │          │
      │  │ 5. Return response  │          │
      │  └─────────────────────┘          │
      │           │                       │
      ▼           ▼                       ▼
  Response immediately!            Processed async
```

Your app **never waits** for OutboundIQ. Metrics are sent in the background.

## TypeScript Support

Full TypeScript support included:

```typescript
import express from 'express';
import { initExpress, userContextMiddleware } from '@outboundiq/express';
import type { OutboundIQConfig } from '@outboundiq/express';

const config: OutboundIQConfig = {
  apiKey: process.env.OUTBOUNDIQ_KEY!,
  debug: true,
};

initExpress(config);
```

## Testing Your Integration

Verify your setup is working:

```bash
OUTBOUNDIQ_KEY=your_api_key npx outboundiq-test
```

This will:
1. Verify your API key with OutboundIQ
2. Show your project name, team, and plan
3. Send test data to confirm tracking works

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OUTBOUNDIQ_KEY` | Your OutboundIQ API key |
| `OUTBOUNDIQ_DEBUG` | Set to `true` for debug logging |

## Support

- Documentation: https://docs.outboundiq.dev
- Issues: https://github.com/outboundiq/express/issues
- Email: support@outboundiq.dev

## License

MIT

