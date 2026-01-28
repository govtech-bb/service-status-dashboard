// Vercel serverless function to fetch Airtable data
// Uses Vercel KV for caching (1 hour TTL)

import { kv } from '@vercel/kv';

const CACHE_KEY = 'services-data';
const CACHE_TTL = 3600; // 1 hour in seconds

async function fetchFromAirtable() {
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_PAT) {
    throw new Error('Server configuration error. Please check environment variables.');
  }

  let allRecords = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`);
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Try to get cached data first
    const cached = await kv.get(CACHE_KEY);

    if (cached) {
      return res.status(200).json({ records: cached, source: 'cache' });
    }

    // Cache miss - fetch from Airtable
    const records = await fetchFromAirtable();

    // Store in cache with TTL
    await kv.set(CACHE_KEY, records, { ex: CACHE_TTL });

    res.status(200).json({ records, source: 'airtable' });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch data',
      message: error.message
    });
  }
}
