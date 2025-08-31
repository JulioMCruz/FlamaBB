import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Web3Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlamaBB - Buenos Aires Experiences',
  description: 'Web3 social experiences in Buenos Aires',
  generator: 'FlamaBB',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <Web3Providers>
            {children}
          </Web3Providers>
        </ErrorBoundary>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
