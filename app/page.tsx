import { supabase, Quiz } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function HomePage() {
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight">
          Choisissez un quiz
        </h1>
        <p className="text-stone-500">Testez vos connaissances et partagez avec vos amis</p>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-5xl mb-4">🎯</div>
          <p>Aucun quiz disponible pour l'instant.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: any) => (
            <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
              <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-[#4A7C6F] hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold mb-1 group-hover:text-[#4A7C6F] transition-colors">
                      {quiz.title}
                    </h2>
                    {quiz.description && (
                      <p className="text-stone-500 text-sm">{quiz.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-medium px-3 py-1 rounded-full bg-[#E8F0EE] text-[#4A7C6F]">
                    {quiz.questions[0]?.count ?? 0} question{quiz.questions[0]?.count !== 1 ? 's' : ''}
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
