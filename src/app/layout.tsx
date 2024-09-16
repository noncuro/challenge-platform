import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Timed Submission Platform',
  description: 'A platform for timed submissions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  "use client";
  return (
      <html lang="en">
        <body className={inter.className}>
          <nav className="bg-gray-100 p-4">
            <ul className="flex space-x-4">
              <li><a href="/" className="text-blue-500 hover:underline">Home</a></li>
              <li><a href="/admin" className="text-blue-500 hover:underline">Admin</a></li>
            </ul>
          </nav>
          {children}
        </body>
      </html>
  )
}
