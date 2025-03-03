import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GIG-Verbund Laborprofil App',
  description: 'Eine Anwendung zur Verwaltung von Laborprofilen im GIG-Verbund',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className + " bg-gray-100 min-h-screen"}>
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="font-bold text-xl text-blue-600">GIG-Labor</a>
            <div>
              <a href="/laborwerte" className="text-gray-600 hover:text-blue-600 mx-3">Wertsuche</a>
              <a href="/admin" className="text-gray-600 hover:text-blue-600 mx-3">Admin</a>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
        
        <footer className="bg-white border-t border-gray-200 py-4 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GIG-Verbund Laborprofil App
          </div>
        </footer>
      </body>
    </html>
  )
}
