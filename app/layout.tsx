import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/lang-context'
import LangSwitcher from '@/components/LangSwitcher'

export const metadata: Metadata = {
  title: 'QuizLab',
  description: 'Créez et partagez vos quiz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#F7F4EE' }}>
        <LangProvider>
          <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
              <a href="/" className="font-serif text-xl font-semibold tracking-tight shrink-0">
                Quiz<span style={{ color: '#4A7C6F' }}>Lab</span>
              </a>
              <div className="flex items-center gap-2">
                <LangSwitcher />
                <a href="/admin" className="text-sm text-stone-500 hover:text-stone-800 transition-colors whitespace-nowrap">
                  Admin →
                </a>
              </div>
            </div>
          </nav>
          <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
            {children}
          </main>
        </LangProvider>
      </body>
    </html>
  )
}
