import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'AEGIS — Authority Command Portal',
  description: 'Authority dashboard for reviewing and resolving safety incidents.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-aegis-navy text-aegis-text">
        {children}
      </body>
    </html>
  )
}
