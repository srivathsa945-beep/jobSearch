# JobSearch - AI-Powered Job Application Assistant

An intelligent web application that automatically scans your resume, finds matching job postings from the last 24 hours, scores them, and can automatically apply to jobs for you.

## Features

- 📄 **Resume Upload & Parsing**: Upload PDF or Word documents and extract text, skills, experience, and education
- 🔍 **Job Search**: Automatically finds job postings posted within the last 24 hours
- 🎯 **Smart Matching**: AI-powered algorithm that scores your resume against job requirements
- 💡 **Recommendations**: Get clear recommendations on whether to apply or skip each job
- ⚡ **Auto-Application**: Automatically apply to recommended jobs (with manual override option)
- 📊 **Detailed Analysis**: See matched skills, missing skills, and detailed reasons for each recommendation

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Resume Parsing**: pdf-parse, mammoth
- **Job Matching**: Custom algorithm with keyword matching and scoring
- **Auto-Application**: Puppeteer (for browser automation)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- (Optional) OpenAI API key for enhanced matching

### Installation

1. Clone the repository:
```bash
cd JobSearch
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
OPENAI_API_KEY=your_key_here
MIN_MATCH_SCORE=70
AUTO_APPLY_ENABLED=true
```

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
- Currently uses mock job data (for demo)
- In production, integrate with:
  - Indeed API
  - LinkedIn Jobs API
  - Glassdoor API
  - Or web scraping (with proper permissions)

### Matching Algorithm
The scoring system considers:
- **Skill Match (40%)**: How many required skills you have
- **Experience Match (20%)**: Years of experience alignment
- **Education Match (10%)**: Education requirements
- **Keyword Overlap (30%)**: Overall keyword similarity

### Auto-Application
- Uses Puppeteer to automate browser interactions
- Fills out application forms automatically
- Handles file uploads
- **Note**: Many job sites have anti-automation measures. This feature works best with sites that allow programmatic access.

## Production Considerations

1. **Job Search Integration**: Replace mock jobs with real APIs:
   - Indeed Publisher API
   - LinkedIn Jobs API
   - Custom web scraping (ensure compliance with ToS)

2. **Enhanced Matching**: 
   - Use OpenAI embeddings for semantic matching
   - Implement machine learning models
   - Add industry-specific matching

3. **Database**: Store resumes, job matches, and application history

4. **Authentication**: Add user accounts and secure resume storage

5. **Rate Limiting**: Implement rate limits for job searches and applications

6. **Error Handling**: Better error handling for failed applications

7. **Legal Compliance**: Ensure compliance with job site terms of service

## Limitations

- Auto-application may not work on all job sites due to anti-automation measures
- Mock job data is used for demonstration
- Resume parsing accuracy depends on document format
- Some job sites require CAPTCHA or manual verification

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

