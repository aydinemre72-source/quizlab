'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import Link from 'next/link'

export default function HomePage() {
  const { lang } = useLang()
  const [quizzes, setQuizzes] = useState<any[]>([])

  useEffect(() => {
    supabase.from('quizzes').select('*, questions(count)').order('created_at', { ascending: false }).then(({ data }) => setQuizzes(data || []))
  }, [])

  return (
    <div>
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold mb-2 tracking-tight">{t(lang, 'home_title')}</h1>
        <p className="text-stone-500 text-sm sm:text-base">{t(lang, 'home_subtitle')}</p>
      </div>
      {quizzes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-5xl mb-4">🎯</div>
          <p>{t(lang, 'home_empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {quizzes.map((quiz: any) => (
            <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 hover:border-[#4A7C6F] hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg sm:text-xl font-semibold mb-1 group-hover:text-[#4A7C6F] transition-colors truncate">
                      {quiz.title}
                    </h2>
                    {quiz.description && <p className="text-stone-500 text-sm line-clamp-2">{quiz.description}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-medium px-3 py-1 rounded-full bg-[#E8F0EE] text-[#4A7C6F] whitespace-nowrap">
                    {quiz.questions[0]?.count ?? 0} {(quiz.questions[0]?.count ?? 0) !== 1 ? t(lang, 'home_questions_pl') : t(lang, 'home_questions')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
