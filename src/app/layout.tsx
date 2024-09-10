import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from './QueryProvider'

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <nav className="bg-gray-100 p-4">
            <ul className="flex space-x-4">
              <li><a href="/candidate/1" className="text-blue-500 hover:underline">Home</a></li>
              <li><a href="/admin" className="text-blue-500 hover:underline">Admin Dashboard</a></li>
            </ul>
          </nav>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
