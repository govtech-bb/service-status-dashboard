# Airtable Integration & Deployment Guide

This guide will help you connect your service status page to Airtable and deploy it to a web server.

## Part 1: Airtable Setup

### Step 1: Prepare Your Airtable Base

1. Create a new Airtable base or use an existing one
2. Create a table with these fields (exact names):
   - **Service Name** (Single line text)
   - **Status** (Single select with options: Backlog, In progress, Feature flagged, Public)
   - **Ministry** (Single line text)
   - **Link** (URL)

3. Add your service data to the table

### Step 2: Get Your Base ID

1. Go to [Airtable API Documentation](https://airtable.com/api)
2. Select your base
3. The Base ID is shown at the top of the page and looks like: `appXXXXXXXXXXXXXX`
4. Copy this ID

### Step 3: Get Your Table Name

Your table name is visible at the top of your Airtable base. Common names:
- "Services"
- "Table 1" (default)
- Or any custom name you've given it

### Step 4: Create a Personal Access Token

**IMPORTANT:** You already have a Personal Access Token. You'll need to configure its scopes.

1. Go to [Airtable Tokens](https://airtable.com/create/tokens)
2. Click on your existing token or create a new one
3. Configure the token:
   - **Name**: Give it a descriptive name (e.g., "Service Status Page")
   - **Scopes**: Add the following scopes:
     - `data.records:read` (to read records)
   - **Access**: Select your specific base

4. Copy the token (it starts with `pat...`)

**Security Note:** Never share this token publicly or commit it to version control.

### Step 5: Update the HTML File

Open `index-airtable.html` and find these lines:

```javascript
const AIRTABLE_BASE_ID = 'YOUR_BASE_ID'; // e.g., 'appXXXXXXXXXXXXXX'
const AIRTABLE_TABLE_NAME = 'YOUR_TABLE_NAME'; // e.g., 'Services' or 'Table 1'
const AIRTABLE_PAT = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Your Personal Access Token
```

Replace:
- `YOUR_BASE_ID` with your actual Base ID (e.g., `app1234567890abcd`)
- `YOUR_TABLE_NAME` with your table name (e.g., `Services`)
- `YOUR_PERSONAL_ACCESS_TOKEN` with your PAT (e.g., `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 6: Test Locally

1. Open `index-airtable.html` in a web browser
2. You should see your services loaded from Airtable
3. If you see an error, check:
   - The Base ID is correct
   - The Table Name matches exactly (case-sensitive)
   - The PAT is correct and has the right scopes
   - Your field names match exactly: "Service Name", "Status", "Ministry", "Link"

## Part 2: Deploying to a Web Server

### Option 1: GitHub Pages (Free & Easy)

1. **Create a GitHub repository**
   ```bash
   git init
   git add index-airtable.html
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Rename `index-airtable.html` to `index.html`

3. **Access your site**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

**Important:** Your Airtable PAT will be visible in the source code. For production, consider using a serverless function (see Option 3).

### Option 2: Netlify (Free & Easy)

1. **Sign up for Netlify** at [netlify.com](https://www.netlify.com)

2. **Deploy via Drag & Drop**
   - Rename `index-airtable.html` to `index.html`
   - Drag the file onto the Netlify deploy area
   - Your site is live!

3. **Or deploy via Git**
   - Connect your GitHub repository
   - Netlify will auto-deploy on every push

4. **Custom domain** (optional)
   - Go to "Domain settings"
   - Add your custom domain (e.g., services.gov.bb)

### Option 3: Secure Deployment with Serverless Function (Recommended for Production)

To hide your Airtable PAT, use a serverless function:

1. **Create `netlify/functions/get-services.js`:**

```javascript
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
```

2. **Update your HTML to use the function:**

Replace the `fetchAirtableData` function with:

```javascript
async function fetchAirtableData() {
    try {
        const response = await fetch('/.netlify/functions/get-services');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.records || [];
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to load services data.');
        return [];
    }
}
```

3. **Set environment variables in Netlify:**
   - Go to Site Settings → Environment Variables
   - Add: `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`, `AIRTABLE_PAT`

### Option 4: Traditional Web Server

1. **Upload files via FTP/SFTP**
   - Use FileZilla, Cyberduck, or your hosting provider's file manager
   - Upload `index-airtable.html` to your web root
   - Rename to `index.html`

2. **Ensure HTTPS is enabled**
   - Required for API calls to work properly

## Updating Services

Simply update your Airtable base, and the changes will appear when you refresh the page!

## Security Considerations

**For Public Websites:**

1. **Read-only access**: Your PAT should only have `data.records:read` scope
2. **Consider using serverless functions** (Option 3) to hide your PAT
3. **CORS**: Airtable API supports CORS, so browser requests work
4. **Rate limits**: Airtable has a rate limit of 5 requests per second per base

**Best Practices:**

- Don't commit your PAT to version control
- Use environment variables for sensitive data
- Consider caching responses to reduce API calls
- Monitor your Airtable API usage

## Troubleshooting

**Error: "Failed to load services data"**
- Check browser console for detailed error
- Verify PAT has correct scopes
- Ensure Base ID and Table Name are correct

**Services not displaying correctly**
- Verify field names match exactly (case-sensitive)
- Check that Status values match: "Backlog", "In progress", "Feature flagged", or "Public"

**CORS errors**
- This shouldn't happen with Airtable, but if it does, use the serverless function approach

**Rate limit errors**
- Implement caching or reduce the frequency of requests

## Custom Domain Setup

### For Netlify:
1. Go to Domain settings
2. Add custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

### For GitHub Pages:
1. Go to repository Settings → Pages
2. Add custom domain
3. Create CNAME record pointing to `USERNAME.github.io`
4. Enable "Enforce HTTPS"

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration values
3. Test with a simple Airtable base first
4. Check [Airtable API documentation](https://airtable.com/api)
