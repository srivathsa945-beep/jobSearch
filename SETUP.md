# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Run the Development Server

```bash
npm run dev
```

## Step 3: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Step 4: Upload Your Resume

1. Click "Upload a file" or drag and drop your resume (PDF or Word document)
2. Wait for the system to process your resume
3. View job matches with scores and recommendations
4. Click "Apply Now" on recommended jobs

## Features Available

✅ Resume parsing (PDF & Word documents)
✅ Automatic job search (last 24 hours)
✅ Smart matching algorithm
✅ Score-based recommendations
✅ Auto-application simulation

## Notes

- Currently uses mock job data for demonstration
- Auto-application is simulated (returns success)
- To use real job APIs, update `lib/jobSearch.ts`
- To implement real auto-application, update `app/api/apply-job/route.ts` with Puppeteer

## Troubleshooting

If you encounter issues:

1. **Port already in use**: Change the port with `npm run dev -- -p 3001`
2. **Module not found**: Delete `node_modules` and run `npm install` again
3. **TypeScript errors**: Run `npm run build` to see detailed errors

