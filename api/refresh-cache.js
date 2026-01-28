// Endpoint to manually refresh the cache
// Usage: GET /api/refresh-cache?token=YOUR_SECRET_TOKEN

import { kv } from '@vercel/kv';

const CACHE_KEY = 'services-data';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for valid token
  const { token } = req.query;
  const validToken = process.env.CACHE_REFRESH_TOKEN;

  if (!validToken) {
    res.status(500).json({ error: 'Server configuration error. CACHE_REFRESH_TOKEN not set.' });
    return;
  }

  if (token !== validToken) {
    res.status(401).json({ error: 'Invalid or missing token' });
    return;
  }

  try {
    await kv.del(CACHE_KEY);

    // Return a simple HTML page for non-technical users
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cache Refreshed</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 500px; margin: 100px auto; text-align: center; }
            .success { color: #22c55e; font-size: 48px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="success">✓</div>
          <h1>Cache Cleared</h1>
          <p>The service status page will show fresh data on the next visit.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
}
