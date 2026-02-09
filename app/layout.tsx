import type { Metadata } from 'next'
import './globals.css'

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

