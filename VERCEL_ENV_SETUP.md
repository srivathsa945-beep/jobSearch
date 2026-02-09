# Vercel Environment Variables Setup

This application requires Apify API credentials to scrape job listings from LinkedIn and Google Jobs.

## Required Environment Variables

You need to set the following environment variables in your Vercel project:

### 1. APIFY_API_TOKEN
- **Value**: Your Apify API token (starts with `apify_api_`)
- **Example**: `apify_api_3Q10gQGguXMquhF5LrwTnYcxvWNLy94v6kB3`
- **Where to get it**: 
  1. Go to https://console.apify.com/account/integrations
  2. Copy your API token

### 2. APIFY_LINKEDIN_ACTOR_ID (Optional)
- **Value**: The LinkedIn scraper actor ID
- **Default**: `curious_coder/linkedin-jobs-scraper`
- **Example**: `curious_coder/linkedin-jobs-scraper`

### 3. APIFY_GOOGLE_ACTOR_ID (Optional)
- **Value**: The Google Jobs scraper actor ID
- **Default**: `johnvc/Google-Jobs-Scraper`
- **Example**: `johnvc/Google-Jobs-Scraper`

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `APIFY_API_TOKEN`
   - **Value**: Your Apify API token
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Important**: After adding environment variables, you must **redeploy** your application for changes to take effect

## Redeploy After Adding Variables

After setting environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a new deployment

## Verify Environment Variables

To verify your environment variables are set correctly:

1. Go to your Vercel deployment logs
2. Look for these log messages:
   - `✅ Apify API token found and format looks correct`
   - `✅ Apify client initialized`

If you see:
- `❌ CRITICAL: APIFY_API_TOKEN not found in environment variables!`
- Then the environment variable is not set correctly

## Troubleshooting

### Issue: "Found 0 Project Manager jobs!"

**Possible causes:**
1. **Missing API Token**: Check that `APIFY_API_TOKEN` is set in Vercel
2. **Token Invalid**: Verify your Apify API token is correct
3. **Usage Limit**: Check if you've exceeded your Apify monthly usage limit
4. **Actor Not Available**: Verify the actor IDs are correct and accessible

**Solutions:**
1. Double-check environment variables are set in Vercel
2. Redeploy after setting variables
3. Check Vercel deployment logs for detailed error messages
4. Verify your Apify account has available credits
5. Check Apify console: https://console.apify.com/account/usage

### Check Apify Usage

1. Go to https://console.apify.com/account/usage
2. Check if you've exceeded your monthly limit
3. If exceeded, upgrade your plan or wait for reset

## Current Configuration

Based on your local `.env` file, you should use:

```
APIFY_API_TOKEN=apify_api_3Q10gQGguXMquhF5LrwTnYcxvWNLy94v6kB3
APIFY_LINKEDIN_ACTOR_ID=curious_coder/linkedin-jobs-scraper
APIFY_GOOGLE_ACTOR_ID=johnvc/Google-Jobs-Scraper
```

**Important**: Never commit your `.env` file to git. Environment variables should only be set in Vercel's dashboard.

