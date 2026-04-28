import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DeleteQuizButton from './DeleteQuizButton'

export const revalidate = 0

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  if (!auth || auth.value !== 'true') redirect('/admin')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Mes quiz</h1>
          <p className="text-stone-500 text-sm mt-1">{quizzes?.length ?? 0} quiz au total</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="px-4 py-2 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors">
            Voir le site
          </Link>
          <Link
            href="/admin/quiz/new"
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: '#4A7C6F' }}
          >
            + Nouveau quiz
          </Link>
        </div>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-4xl mb-3">📋</div>
          <p>Aucun quiz. Créez-en un !</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-serif font-semibold text-lg">{quiz.title}</div>
                {quiz.description && <div className="text-stone-500 text-sm mt-0.5">{quiz.description}</div>}
                <div className="text-xs text-stone-400 mt-1">
                  {quiz.questions[0]?.count ?? 0} question{quiz.questions[0]?.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs hover:bg-stone-50 transition-colors"
                >
                  Aperçu
                </Link>
                <Link
                  href={`/admin/quiz/${quiz.id}/results`}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs hover:bg-stone-50 transition-colors"
                  style={{ color: '#4A7C6F', borderColor: '#4A7C6F' }}
                >
                  Résultats
                </Link>
                <Link
                  href={`/admin/quiz/${quiz.id}/edit`}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs hover:bg-stone-50 transition-colors"
                >
                  Modifier
                </Link>
                <DeleteQuizButton id={quiz.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <form action="/api/admin/logout" method="POST" className="mt-10 text-center">
        <button type="submit" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
