# JobSearch - AI-Powered Job Application Assistant

An intelligent web application that automatically scans your resume, finds matching job postings from LinkedIn (past week), scores them, and can automatically apply to jobs for you.

## Features

- 📄 **Resume Upload & Parsing**: Upload PDF or Word documents and extract text, skills, experience, and education
- 🔍 **Real LinkedIn Job Search**: Automatically searches LinkedIn for jobs posted in the past week using Apify
- 🎯 **Smart Matching**: AI-powered algorithm that scores your resume against job requirements
- 💡 **Recommendations**: Get clear recommendations on whether to apply or skip each job
- ⚡ **Auto-Application**: Automatically apply to recommended jobs (with manual override option)
- 📊 **Detailed Analysis**: See matched skills, missing skills, and detailed reasons for each recommendation
- 🏢 **Job Source Display**: See where each job was posted (LinkedIn, Indeed, etc.)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Resume Parsing**: pdf-parse, mammoth
- **Job Search**: Apify (LinkedIn scraping)
- **Job Matching**: Custom algorithm with role-based matching and scoring
- **Auto-Application**: Framework ready for browser automation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Apify account with API token (already configured)

### Installation

1. Clone the repository:
```bash
cd JobSearch
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with your Apify API token

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Resume**: Click "Upload a file" and select your resume (PDF or Word document)
2. **Wait for Processing**: The system will parse your resume and search for jobs
3. **Review Matches**: See all job matches with scores and recommendations
4. **Apply**: Click "Apply Now" on recommended jobs to automatically apply

## How It Works

### Resume Parsing
- Extracts text from PDF and Word documents
- Identifies skills, experience, and education
- Structures the data for matching

### Job Search
- **Real LinkedIn Jobs**: Uses Apify to scrape LinkedIn for actual job postings
- Searches jobs posted in the past week
- Filters by role extracted from your resume
- Falls back to mock data if Apify is unavailable

### Matching Algorithm
The scoring system considers:
- **Role/Title Match (50%)**: Most important - matches your job title to job postings
- **Skill Match (25%)**: How many required skills you have
- **Experience Match (15%)**: Years of experience alignment
- **Education Match (5%)**: Education requirements
- **Keyword Overlap (5%)**: Overall keyword similarity

Jobs that don't match your role are heavily penalized to ensure relevance.

### Auto-Application
- Framework ready for browser automation
- Currently simulates application process
- Can be extended with Puppeteer/Playwright for real automation
- **Note**: Many job sites have anti-automation measures. This feature works best with sites that allow programmatic access.

## Production Considerations

1. **Enhanced Matching**: 
   - Use OpenAI embeddings for semantic matching
   - Implement machine learning models
   - Add industry-specific matching

2. **Database**: Store resumes, job matches, and application history

3. **Authentication**: Add user accounts and secure resume storage

4. **Rate Limiting**: Implement rate limits for job searches and applications

5. **Error Handling**: Better error handling for failed applications

6. **Legal Compliance**: Ensure compliance with job site terms of service

## Limitations

- Auto-application may not work on all job sites due to anti-automation measures
- Resume parsing accuracy depends on document format
- Some job sites require CAPTCHA or manual verification
- Apify scraping depends on your Apify account credits

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

