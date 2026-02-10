'use client'

import { JobMatch } from '@/types'
import { useState, useEffect } from 'react'
import { getAppliedJobs, markJobAsApplied, isJobApplied, getApplicationRecord, getApplicationStats } from '@/lib/applicationTracker'

interface ResultsDashboardProps {
  matches: JobMatch[]
  loading: boolean
  searchInfo?: { 
    role?: string
    totalJobs?: number
    dateRange?: { from: string; to: string; fromFormatted: string; toFormatted: string }
  } | null
  onReset: () => void
}

export default function ResultsDashboard({ matches, loading, searchInfo, onReset }: ResultsDashboardProps) {
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [applicationStats, setApplicationStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0 })

  // Load applied jobs on mount
  useEffect(() => {
    const loadAppliedJobs = () => {
      const applied = getAppliedJobs()
      const appliedIds = new Set(applied.map(job => job.jobId))
      setAppliedJobs(appliedIds)
      
      // Calculate stats
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      setApplicationStats({
        total: applied.length,
        thisWeek: applied.filter(job => new Date(job.appliedDate) >= weekAgo).length,
        thisMonth: applied.filter(job => new Date(job.appliedDate) >= monthAgo).length
      })
    }
    
    loadAppliedJobs()
    
    // Also check periodically for updates (in case another tab updated)
    const interval = setInterval(loadAppliedJobs, 2000)
    return () => clearInterval(interval)
  }, [])

  // Update matches with applied status
  const matchesWithStatus = matches.map(match => {
    const applied = appliedJobs.has(match.job.id)
    const record = applied ? getApplicationRecord(match.job.id) : null
    return {
      ...match,
      applied,
      appliedDate: record?.appliedDate
    }
  })

  const handleApply = async (match: JobMatch) => {
    // Use applyUrl if available, otherwise use the job URL
    const applyUrl = match.job.applyUrl || match.job.url
    
    if (!applyUrl) {
      alert('No application URL available for this job. Please use the "View Job" link instead.')
      return
    }
    
    // Mark as applied immediately (optimistic update)
    markJobAsApplied(match.job.id, match.job.title, match.job.company, applyUrl)
    setAppliedJobs(prev => new Set([...prev, match.job.id]))
    
    // Update stats
    const stats = getApplicationStats()
    setApplicationStats(stats)
    
    // Open the job application page in a new tab
    window.open(applyUrl, '_blank', 'noopener,noreferrer')
    
    // Track that user clicked apply (for analytics)
    try {
      await fetch('/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: match.job.id,
          jobTitle: match.job.title,
          company: match.job.company,
          applyUrl: applyUrl,
          applied: true
        }),
      })
    } catch (error) {
      // Silently fail - the main action (opening URL) already succeeded
      console.log('Failed to track application click:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
    if (score >= 60) return 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30'
    return 'text-red-300 bg-red-500/20 border border-red-500/30'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-400">Scanning job postings and analyzing matches...</p>
      </div>
    )
  }

  const applyMatches = matchesWithStatus.filter(m => m.recommendation === 'apply')
  const skipMatches = matchesWithStatus.filter(m => m.recommendation === 'skip')

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Job Matches
            </h2>
            <div className="flex items-center gap-4 text-sm mt-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-semibold border border-blue-500/30">
                {matches.length} Total Matches
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                {applyMatches.length} Recommended
              </span>
            </div>
            {searchInfo && (
              <div className="mt-4 text-sm text-gray-400 space-y-1">
                <div className="flex flex-wrap gap-4">
                  {searchInfo.role && searchInfo.role !== 'Not detected' && (
                    <span>
                      <span className="font-semibold text-gray-300">Detected Role:</span> <span className="text-purple-300">{searchInfo.role}</span>
                    </span>
                  )}
                  {searchInfo.totalJobs !== undefined && (
                    <span>
                      <span className="font-semibold text-gray-300">Jobs Found:</span> <span className="text-blue-300">{searchInfo.totalJobs}</span>
                    </span>
                  )}
                  {searchInfo.dateRange && (
                    <span>
                      <span className="font-semibold text-gray-300">Date Range:</span> <span className="text-indigo-300">{searchInfo.dateRange.fromFormatted} to {searchInfo.dateRange.toFormatted}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 italic">
                  Search runs dynamically - showing jobs from the last 7 days (calculated from today)
                </div>
                <div className="mt-2 text-xs text-blue-400 font-semibold">
                  Filters Applied: Full-time only • No staffing companies • Salary &gt;$100k • Benefits included • End-client companies only
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          New Search
        </button>
      </div>

      {/* Application Statistics */}
      {applicationStats.total > 0 && (
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Application Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{applicationStats.total}</div>
              <div className="text-sm text-gray-400 mt-1">Total Applied</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">{applicationStats.thisWeek}</div>
              <div className="text-sm text-gray-400 mt-1">This Week</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{applicationStats.thisMonth}</div>
              <div className="text-sm text-gray-400 mt-1">This Month</div>
            </div>
          </div>
        </div>
      )}

      {applyMatches.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                Recommended to Apply
              </h3>
              <p className="text-gray-400">Jobs with match score ≥ 40% or PM role with keyword matches</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-lg border border-emerald-500/30">
              {applyMatches.length}
            </div>
          </div>
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
          <div className="flex items-center mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-300 mb-2">
                Lower Match Score
              </h3>
              <p className="text-gray-500">Jobs with match score &lt; 40% - review before applying</p>
            </div>
            <div className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full font-bold text-lg border border-gray-600">
              {skipMatches.length}
            </div>
          </div>
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
        <div className="text-center py-12 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-400">No job matches found. Try uploading a different resume.</p>
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
    <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500 hover:border-blue-400">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white">{match.job.title}</h4>
          <p className="text-gray-300">{match.job.company} • {match.job.location}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Posted: {new Date(match.job.postedDate).toLocaleDateString()}</p>
            <span className="text-sm text-blue-400 font-medium">•</span>
            <span className="text-sm text-blue-400 font-medium">{match.job.source}</span>
            {match.applied && (
              <>
                <span className="text-sm text-blue-400 font-medium">•</span>
                <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ Applied {match.appliedDate && `on ${new Date(match.appliedDate).toLocaleDateString()}`}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className={`px-5 py-2.5 rounded-lg font-bold text-lg shadow-md ${getScoreColor(match.score)}`}>
            {match.score}% Match
          </div>
          {match.applied && (
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Applied
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-300 line-clamp-3">{match.job.description}</p>
      </div>

      {match.reasons.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-300 mb-2">Analysis:</p>
          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
            {match.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {match.matchedSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-emerald-300 mb-2">Matched Keywords ({match.matchedSkills.length}):</p>
          <div className="flex flex-wrap gap-2">
            {match.matchedSkills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {match.missingSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-orange-300 mb-2">Missing Keywords ({match.missingSkills.length}):</p>
          <div className="flex flex-wrap gap-2">
            {match.missingSkills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
        <a
          href={match.job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-center shadow-sm hover:shadow"
        >
          View Job
        </a>
        {match.recommendation === 'apply' && (
          <button
            onClick={onApply}
            disabled={match.applied}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg ${
              match.applied
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 transform hover:-translate-y-0.5'
            }`}
            title={match.applied ? 'Already applied' : 'Opens job application page in a new tab'}
          >
            {match.applied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Applied
              </span>
            ) : (
              'Apply Now'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

