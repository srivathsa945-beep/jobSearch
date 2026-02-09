/**
 * Project Management keywords for job matching
 * These keywords will be prioritized when matching resumes to job postings
 */
export const PROJECT_MANAGEMENT_KEYWORDS = [
  // Project Management Core
  'project management',
  'program management',
  'agile',
  'scrum',
  'kanban',
  'risk mitigation',
  'stakeholder communication',
  'strategic planning',
  'resource forecasting',
  'budget forecasting',
  'project planning',
  'project execution',
  'project delivery',
  'project coordination',
  'project oversight',
  'project governance',
  'pmp',
  'project management professional',
  'prince2',
  'pmi',
  'project management institute',
  
  // Workforce Management
  'workforce management',
  'staffing optimization',
  'global headcount planning',
  'headcount planning',
  'kpi monitoring',
  'kpi tracking',
  'key performance indicators',
  'performance metrics',
  'workforce planning',
  'resource management',
  'talent management',
  'capacity planning',
  
  // Compliance
  'compliance',
  'regulatory compliance',
  'compliance management',
  'audit',
  'governance',
  'risk management',
  'risk assessment',
  
  // Collaboration and Leadership
  'cross-functional leadership',
  'cross-functional collaboration',
  'stakeholder management',
  'stakeholder engagement',
  'vendor management',
  'vendor relations',
  'process optimization',
  'process improvement',
  'executive reporting',
  'executive communication',
  'leadership',
  'team leadership',
  'collaboration',
  'team collaboration',
  'change management',
  'organizational change',
  
  // Tools & Technologies
  'jira',
  'confluence',
  'microsoft office',
  'microsoft office suite',
  'microsoft excel',
  'microsoft word',
  'microsoft powerpoint',
  'microsoft project',
  'ms project',
  'ldap',
  'powershell',
  'sharepoint',
  'servicenow',
  'slack',
  'trello',
  'asana',
  'monday.com',
  'smartsheet',
  
  // Data Analysis & Forecasting
  'excel',
  'sql',
  'predictive modeling',
  'data visualization',
  'tableau',
  'power bi',
  'business intelligence',
  'reporting',
  'dashboards',
  'data analysis',
  'forecasting',
  'statistical analysis',
  'data interpretation'
]

/**
 * Get priority keywords that should be emphasized in matching
 */
export function getPriorityKeywords(): string[] {
  return PROJECT_MANAGEMENT_KEYWORDS
}

/**
 * Check if a keyword is a project management related keyword
 */
export function isProjectManagementKeyword(keyword: string): boolean {
  const lowerKeyword = keyword.toLowerCase()
  return PROJECT_MANAGEMENT_KEYWORDS.some(pmKeyword => 
    lowerKeyword.includes(pmKeyword.toLowerCase()) || 
    pmKeyword.toLowerCase().includes(lowerKeyword)
  )
}

