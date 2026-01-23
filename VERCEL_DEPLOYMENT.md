# Vercel Deployment Guide

This guide will help you deploy your GovTech Barbados Service Status page to Vercel with secure Airtable integration.

## Overview

This deployment uses:
- **Vercel** for hosting and serverless functions
- **Airtable API** for data storage
- **Serverless functions** to securely hide your Airtable credentials

## Prerequisites

1. A Vercel account (free tier works great)
2. Your Airtable base set up with the correct fields
3. Your Airtable Personal Access Token (PAT)
4. Git installed on your computer

## Step 1: Prepare Your Airtable Base

Make sure your Airtable base has these fields:
- **Service Name** (Single line text)
- **Status** (Single select: Backlog, In progress, Feature flagged, Public)
- **Ministry** (Single line text)
- **Link** (URL)

You'll need:
- Your Base ID (e.g., `appXXXXXXXXXXXXXX`)
- Your Table Name (e.g., `Services` or `Table 1`)
- Your Personal Access Token with `data.records:read` scope

## Step 2: Prepare Your Project for Deployment

Your project should have this structure:
```
govtech-services/
├── api/
│   └── get-services.js       (Serverless function)
├── index-airtable.html        (Your main page)
├── vercel.json                (Vercel configuration)
└── VERCEL_DEPLOYMENT.md       (This file)
```

All files are already created and ready to deploy!

## Step 3: Initialize Git Repository

If you haven't already, initialize a git repository:

```bash
cd "/Users/abisola/dev-env/govtech services"
git init
git add .
git commit -m "Initial commit - GovTech Barbados Service Status"
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - "Set up and deploy?" → Yes
   - "Which scope?" → Choose your account
   - "Link to existing project?" → No
   - "What's your project's name?" → govtech-barbados-services (or your choice)
   - "In which directory is your code located?" → ./

5. **Set environment variables:**
   ```bash
   vercel env add AIRTABLE_BASE_ID
   # Paste your Base ID when prompted

   vercel env add AIRTABLE_TABLE_NAME
   # Paste your Table Name when prompted

   vercel env add AIRTABLE_PAT
   # Paste your Personal Access Token when prompted
   ```

   For each variable, select:
   - Production: Yes
   - Preview: Yes
   - Development: Yes

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure the project:**
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these three variables:
     - `AIRTABLE_BASE_ID` → Your Base ID
     - `AIRTABLE_TABLE_NAME` → Your Table Name
     - `AIRTABLE_PAT` → Your Personal Access Token
   - Make sure all are available in Production, Preview, and Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## Step 5: Rename Your HTML File (Important!)

After your first deployment, you need to rename the HTML file so it becomes the homepage:

1. **Rename the file:**
   ```bash
   mv index-airtable.html index.html
   git add .
   git commit -m "Rename to index.html"
   git push
   ```

   Or if using Vercel CLI:
   ```bash
   mv index-airtable.html index.html
   vercel --prod
   ```

## Step 6: Verify Your Deployment

1. Visit your Vercel deployment URL (something like `https://your-project.vercel.app`)
2. You should see your services loaded from Airtable
3. Check that filtering works by clicking on the status cards

## Updating Your Services

Simply update your Airtable base - changes will appear immediately when you refresh the page!

## Custom Domain Setup

### Option 1: Add a Custom Domain in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your domain (e.g., `services.gov.bb`)
4. Follow the instructions to update your DNS records

### Option 2: Using Vercel CLI

```bash
vercel domains add services.gov.bb
```

Then follow the instructions to configure your DNS.

## Troubleshooting

### "Failed to load services data"

**Check your environment variables:**
```bash
vercel env ls
```

Make sure all three variables are set. If not, add them:
```bash
vercel env add AIRTABLE_BASE_ID
vercel env add AIRTABLE_TABLE_NAME
vercel env add AIRTABLE_PAT
```

After adding variables, redeploy:
```bash
vercel --prod
```

### API Function Returns 500 Error

1. Check Vercel function logs:
   - Go to your project dashboard
   - Click on "Deployments"
   - Click on your latest deployment
   - Check the "Functions" tab for errors

2. Common issues:
   - Incorrect Airtable Base ID
   - Wrong Table Name (case-sensitive!)
   - Invalid Personal Access Token
   - PAT doesn't have the right scopes (`data.records:read`)

### CORS Errors

The serverless function includes CORS headers, but if you still see errors:
- Make sure you're accessing via the Vercel URL or your custom domain
- Don't try to open `index.html` directly in browser (won't work with serverless functions)

### Services Not Displaying

1. Open browser console (F12) to see errors
2. Check that your Airtable field names match exactly:
   - `Service Name` (not `ServiceName` or `service name`)
   - `Status` (not `status`)
   - `Ministry`
   - `Link`
3. Verify Status values are exactly: `Backlog`, `In progress`, `Feature flagged`, or `Public`

## Project Structure Explained

### `/api/get-services.js`
Serverless function that:
- Fetches data from Airtable API
- Keeps your credentials secure (server-side only)
- Returns data to the frontend

### `index-airtable.html` (renamed to `index.html`)
Your main page that:
- Calls the serverless function
- Displays services in a table
- Provides filtering functionality

### `vercel.json`
Configuration file that tells Vercel:
- How to build your serverless functions
- How to route API requests

## Security Notes

✅ **Secure:**
- Your Airtable PAT is stored in environment variables
- PAT is never exposed in the browser
- Only read-only access to Airtable

⚠️ **Important:**
- Never commit `.env` files to git
- Keep your PAT secret
- Only grant `data.records:read` scope to your token
- Regularly rotate your PAT for security

## Continuous Deployment

Once set up, every time you push to your git repository:
1. Vercel automatically detects the push
2. Builds and deploys your changes
3. Your site updates automatically

To update:
```bash
git add .
git commit -m "Your commit message"
git push
```

## Cost

Vercel's free tier includes:
- Unlimited personal projects
- 100GB bandwidth per month
- Serverless function execution
- Automatic HTTPS
- Custom domains

This is more than enough for most government service status pages!

## Support

If you encounter issues:

1. **Check Vercel logs:**
   ```bash
   vercel logs
   ```

2. **Vercel Documentation:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Serverless Functions](https://vercel.com/docs/functions)
   - [Environment Variables](https://vercel.com/docs/environment-variables)

3. **Airtable API:**
   - [Airtable API Docs](https://airtable.com/api)
   - Check your base's API documentation

## Next Steps

- Set up a custom domain for your service
- Add analytics to track page views
- Consider adding a refresh button to manually reload data
- Set up monitoring to track uptime
