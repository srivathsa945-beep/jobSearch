'use client'

import { JobMatch } from '@/types'
import { useState } from 'react'

interface ResultsDashboardProps {
  matches: JobMatch[]
  loading: boolean
  searchInfo?: { 
    role?: string
    totalJobs?: number
    dateRange?: { fromFormatted: string; toFormatted: string }
  } | null
  onReset: () => void
}

export default function ResultsDashboard({ matches, loading, searchInfo, onReset }: ResultsDashboardProps) {

  const handleApply = async (match: JobMatch) => {
    // Use applyUrl if available, otherwise use the job URL
    const applyUrl = match.job.applyUrl || match.job.url
    
    if (!applyUrl) {
      alert('No application URL available for this job. Please use the "View Job" link instead.')
      return
    }
    
    // Open the job application page in a new tab
    window.open(applyUrl, '_blank', 'noopener,noreferrer')
    
    // Optional: Track that user clicked apply (for analytics)
    try {
      await fetch('/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: match.job.id,
          jobTitle: match.job.title,
          company: match.job.company,
          applyUrl: applyUrl
        }),
      })
    } catch (error) {
      // Silently fail - the main action (opening URL) already succeeded
      console.log('Failed to track application click:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Scanning job postings and analyzing matches...</p>
      </div>
    )
  }

  const applyMatches = matches.filter(m => m.recommendation === 'apply')
  const skipMatches = matches.filter(m => m.recommendation === 'skip')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Job Matches ({matches.length} found)
          </h2>
          {searchInfo && (
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div className="flex flex-wrap gap-4">
                {searchInfo.role && searchInfo.role !== 'Not detected' && (
                  <span>
                    <span className="font-semibold">Detected Role:</span> {searchInfo.role}
                  </span>
                )}
                {searchInfo.totalJobs !== undefined && (
                  <span>
                    <span className="font-semibold">Jobs Found:</span> {searchInfo.totalJobs}
                  </span>
                )}
                {searchInfo.dateRange && (
                  <span>
                    <span className="font-semibold">Date Range:</span> {searchInfo.dateRange.fromFormatted} to {searchInfo.dateRange.toFormatted}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 italic">
                Search runs dynamically - showing jobs from the last 7 days (calculated from today)
              </div>
              <div className="mt-2 text-xs text-blue-600 font-semibold">
                Filters Applied: Full-time only • No staffing companies • Salary &gt;$100k • Benefits included • End-client companies only
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Upload New Resume
        </button>
      </div>

      {applyMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-4">
            Recommended to Apply ({applyMatches.length})
          </h3>
          <div className="space-y-4">
            {applyMatches.map((match) => (
              <JobCard
                key={match.job.id}
                match={match}
                onApply={() => handleApply(match)}
                getScoreColor={getScoreColor}
              />
            ))}
          </div>
        </div>
      )}

      {skipMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-600 mb-4">
            Not Recommended ({skipMatches.length})
          </h3>
          <div className="space-y-4">
            {skipMatches.map((match) => (
              <JobCard
                key={match.job.id}
                match={match}
                onApply={() => handleApply(match)}
                getScoreColor={getScoreColor}
              />
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No job matches found. Try uploading a different resume.</p>
        </div>
      )}
    </div>
  )
}

function JobCard({ 
  match, 
  onApply, 
  getScoreColor 
}: { 
  match: JobMatch
  onApply: () => void
  getScoreColor: (score: number) => string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-800">{match.job.title}</h4>
          <p className="text-gray-600">{match.job.company} • {match.job.location}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Posted: {new Date(match.job.postedDate).toLocaleDateString()}</p>
            <span className="text-sm text-blue-600 font-medium">•</span>
            <span className="text-sm text-blue-600 font-medium">{match.job.source}</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(match.score)}`}>
          {match.score}% Match
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-3">{match.job.description}</p>
      </div>

      {match.reasons.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Analysis:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {match.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {match.matchedSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-green-700 mb-2">Matched Keywords ({match.matchedSkills.length}):</p>
          <div className="flex flex-wrap gap-2">
            {match.matchedSkills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {match.missingSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-orange-700 mb-2">Missing Keywords ({match.missingSkills.length}):</p>
          <div className="flex flex-wrap gap-2">
            {match.missingSkills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <a
          href={match.job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          View Job
        </a>
        {match.recommendation === 'apply' && (
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="Opens job application page in a new tab"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  )
}

