import type { Metadata } from 'next'
import './globals.css'

// Force dynamic rendering for all pages to prevent static generation issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'JobSearch - AI-Powered Job Application Assistant',
  description: 'Upload your resume and automatically find and apply to matching jobs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

