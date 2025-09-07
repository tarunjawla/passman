import type { Metadata } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PassMan - Secure Local Password Manager',
  description: 'A simple, secure, and cross-platform password manager written in Rust. Keep your passwords safe with local-only storage and military-grade encryption.',
  keywords: 'password manager, security, encryption, rust, local storage, privacy',
  authors: [{ name: 'PassMan Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4fe3c4',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
