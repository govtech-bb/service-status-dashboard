// Vercel serverless function to fetch Airtable data
// This keeps your Airtable Personal Access Token secure

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get Airtable credentials from environment variables
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

  // Validate environment variables
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_PAT) {
    res.status(500).json({
      error: 'Server configuration error. Please check environment variables.'
    });
    return;
  }

  try {
    // Fetch all records from Airtable (handling pagination)
    let allRecords = [];
    let offset = null;

    do {
      // Construct Airtable API URL with pagination
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`);
      if (offset) {
        url.searchParams.append('offset', offset);
      }

      // Fetch data from Airtable
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();

      // Add records to our collection
      allRecords = allRecords.concat(data.records || []);

      // Check if there are more pages
      offset = data.offset;
    } while (offset);

    // Return all records
    res.status(200).json({ records: allRecords });
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    res.status(500).json({
      error: 'Failed to fetch data from Airtable',
      message: error.message
    });
  }
}
