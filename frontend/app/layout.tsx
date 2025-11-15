import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dominion City Directory - Find Businesses & Professionals',
  description: 'Discover skilled professionals and businesses in Dominion City',
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
