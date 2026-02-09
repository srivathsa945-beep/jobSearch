# Environment Variables Setup

## Update your `.env` file

Your `.env` file should contain the following:

```env
APIFY_API_TOKEN=apify_api_74LnWixKE5sIesne0Jormuz9GW19E444A30c
APIFY_LINKEDIN_ACTOR_ID=curious_coder/linkedin-jobs-scraper
APIFY_GOOGLE_ACTOR_ID=johnvc/Google-Jobs-Scraper
```

## Important Notes:

1. **No quotes** - Don't wrap values in quotes
2. **No spaces** - No spaces around the `=` sign
3. **Restart server** - After updating `.env`, restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Actor Details:

- **LinkedIn Jobs Scraper**: `curious_coder/linkedin-jobs-scraper`
  - Cost: $1.00 / 1,000 results
  - Actor URL: https://console.apify.com/actors/hKByXkMQaC5Qt9UMN/input

- **Google Jobs Scraper**: `johnvc/Google-Jobs-Scraper`
  - Default actor ID (can be overridden with APIFY_GOOGLE_ACTOR_ID)
  - Searches Google Jobs for job postings

## Test Your Setup

1. **Test Apify Connection:**
   - Visit: `http://localhost:3000/api/test-apify`
   - Should return `success: true` and show the actor as found

2. **Debug Environment:**
   - Visit: `http://localhost:3000/api/debug-search`
   - Shows all environment variables and connection status

3. **List Available Actors:**
   - Visit: `http://localhost:3000/api/list-actors`
   - Shows all actors available to your account

4. **Check Server Logs:**
   - When you click "Search for Project Manager Jobs", check your terminal
   - Look for Apify run IDs and any error messages
