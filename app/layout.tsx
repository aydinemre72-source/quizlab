import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuizLab',
  description: 'Créez et partagez vos quiz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#F7F4EE' }}>
        <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-serif text-xl font-semibold tracking-tight">
              Quiz<span style={{ color: '#4A7C6F' }}>Lab</span>
            </a>
            <a href="/admin" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              Admin →
            </a>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
