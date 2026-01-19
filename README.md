# @outboundiq/express

Express.js integration for OutboundIQ - Third-party API monitoring and analytics.

## Installation

```bash
npm install @outboundiq/express
```

## Quick Start

```javascript
const express = require('express');
const { initExpress, userContextMiddleware } = require('@outboundiq/express');

const app = express();

// Initialize OutboundIQ - patches fetch/http automatically
initExpress({ apiKey: process.env.OUTBOUNDIQ_KEY });

// Optional: track which user made each API call
app.use(userContextMiddleware());

// Your routes - no changes needed!
app.get('/api/payment', async (req, res) => {
  // This fetch is automatically tracked
  const result = await fetch('https://api.stripe.com/v1/charges');
  res.json(await result.json());
});

app.listen(3000);
```

## How It Works

OutboundIQ automatically monitors all HTTP requests made using `fetch()`, `axios`, `got`, `node-fetch`, or native `http.request()`.

## Configuration

Add to your `.env` file:

```bash
# Required - your API key from OutboundIQ dashboard
OUTBOUNDIQ_KEY=your-api-key

# Custom endpoint URL (optional)
OUTBOUNDIQ_URL=https://agent.outboundiq.dev/api/metric

# Enable debug logging (optional)
OUTBOUNDIQ_DEBUG=true
```

## User Context Tracking

Track which user made each API call:

```javascript
app.use(passport.authenticate('session'));
app.use(userContextMiddleware()); // Add after auth middleware

// Now all API calls include user context automatically
```

For webhooks or system operations:

```javascript
const { setRequestUserContext } = require('@outboundiq/express');

app.post('/webhook/stripe', (req, res) => {
  setRequestUserContext(req, {
    userId: req.body.customer_id,
    context: 'webhook',
  });
  
  // API calls now have this context
  await fetch('https://api.internal.com/process');
  res.sendStatus(200);
});
```

## License

MIT
