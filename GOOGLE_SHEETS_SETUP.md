# Google Sheets Integration Setup

This guide will help you connect your service status page to a Google Sheet.

## Step 1: Prepare Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Structure your sheet with these columns (in order):
   - Column A: **Service Name**
   - Column B: **Status** (must be one of: Backlog, In progress, Feature flagged, Public)
   - Column C: **Ministry**
   - Column D: **Link** (optional - can be empty)

3. Add a header row in row 1 with column names
4. Add your service data starting from row 2

**Example:**

| Service Name | Status | Ministry | Link |
|-------------|--------|----------|------|
| Apply to be a Project Protege Mentor | Feature flagged | Youth, Sports, Community Empowerment | https://alpha.gov.bb/... |
| Request a building inspection | Backlog | Prime Minister's Office | |

## Step 2: Get Your Google Sheets API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. (Optional but recommended) Restrict your API key:
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Website restrictions", add your domain
   - Click "Save"

## Step 3: Make Your Google Sheet Public

1. Open your Google Sheet
2. Click "Share" button
3. Click "Change to anyone with the link"
4. Make sure "Viewer" is selected
5. Copy the Sheet ID from the URL

The URL looks like:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
```

Copy the `SHEET_ID_HERE` part.

## Step 4: Update the HTML File

Open `index-dynamic.html` and find these lines near the top of the `<script>` section:

```javascript
const SHEET_ID = 'YOUR_SHEET_ID'; // Get this from your sheet URL
const API_KEY = 'YOUR_API_KEY'; // Get from Google Cloud Console
const SHEET_NAME = 'Sheet1'; // Your sheet name
```

Replace:
- `YOUR_SHEET_ID` with your actual Sheet ID
- `YOUR_API_KEY` with your API key from Step 2
- `Sheet1` with your actual sheet name (if different)

## Step 5: Test Your Setup

1. Open `index-dynamic.html` in a web browser
2. You should see your services loaded from the Google Sheet
3. If you see an error, check:
   - The Sheet ID is correct
   - The API key is correct
   - The Google Sheets API is enabled
   - The sheet is publicly accessible
   - The sheet name matches

## Updating Services

Simply update your Google Sheet, and the changes will appear when you refresh the page!

## Troubleshooting

**Error: "Failed to load services data"**
- Check that the Google Sheets API is enabled
- Verify your API key is correct
- Make sure the sheet is public

**Error: "No data found"**
- Check that your sheet name is correct
- Verify data starts from row 2 (row 1 should be headers)
- Make sure the range is correct

**Services not displaying correctly**
- Verify the status values exactly match: "Backlog", "In progress", "Feature flagged", or "Public"
- Check that columns are in the correct order

## Security Note

The API key in the HTML file will be visible to anyone who views the page source. This is acceptable for read-only public data. To restrict access:

1. Add website restrictions to your API key in Google Cloud Console
2. Only enable the Google Sheets API (no other APIs)
3. Consider using a server-side solution for sensitive data
