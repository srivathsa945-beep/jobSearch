import { NextRequest, NextResponse } from 'next/server'
import { calculateMatchScore } from '@/lib/jobMatcher'
import { extractSkills, extractExperience, extractEducation, extractJobTitle, extractJobKeywords } from '@/lib/resumeParser'
import { ResumeData, JobPosting } from '@/types'

// Ensure this route uses Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'
// Mark as dynamic since we process request body
export const dynamic = 'force-dynamic'

/**
 * API endpoint to score pre-fetched jobs against an uploaded resume
 * This is called after jobs are fetched and resume is uploaded
 */
export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobTitle, jobKeywords, jobs } = await request.json()

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: 'Jobs array is required' },
        { status: 400 }
      )
    }

    // Extract resume data
    const extractedJobTitle = jobTitle || extractJobTitle(resumeText)
    const extractedJobKeywords = jobKeywords || extractJobKeywords(resumeText)
    
    const resumeData: ResumeData = {
      text: resumeText,
      skills: extractSkills(resumeText),
      experience: extractExperience(resumeText),
      education: extractEducation(resumeText),
      jobTitle: extractedJobTitle,
      jobKeywords: extractedJobKeywords
    }

    // Convert jobs from JSON back to JobPosting objects
    const jobPostings: JobPosting[] = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements || [],
      postedDate: job.postedDate,
      url: job.url,
      applyUrl: job.applyUrl,
      source: job.source
    }))

    console.log(`📊 Scoring ${jobPostings.length} jobs against resume...`)

    // Calculate matches for each job
    const matches = jobPostings.map(job => calculateMatchScore(resumeData, job))
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score)

    // Calculate date range for display
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return NextResponse.json({
      success: true,
      matches,
      totalJobs: jobPostings.length,
      extractedRole: extractedJobTitle || 'Not detected',
      searchCriteria: {
        jobTitle: extractedJobTitle,
        keywords: extractedJobKeywords
      },
      dateRange: {
        from: sevenDaysAgo.toISOString(),
        to: now.toISOString(),
        fromFormatted: sevenDaysAgo.toLocaleDateString(),
        toFormatted: now.toLocaleDateString()
      }
    })
  } catch (error) {
    console.error('Error scoring jobs:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        error: 'Failed to score jobs',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

