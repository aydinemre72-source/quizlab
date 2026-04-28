import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  if (!auth || auth.value !== 'true') redirect('/admin')

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', params.id).single()
  if (!quiz) redirect('/admin/dashboard')

  const { data: results } = await supabase
    .from('results')
    .select('*')
    .eq('quiz_id', params.id)
    .order('completed_at', { ascending: false })

  const avg = results && results.length > 0
    ? Math.round(results.reduce((s: number, r: any) => s + r.percent, 0) / results.length)
    : null

  const best = results && results.length > 0
    ? Math.max(...results.map((r: any) => r.percent))
    : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/dashboard" className="text-stone-400 hover:text-stone-600 text-sm">← Retour</Link>
      </div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{quiz.title}</h1>
          <p className="text-stone-500 text-sm mt-1">Résultats des participants</p>
        </div>
        <Link
          href={`/quiz/${quiz.id}`}
          className="px-4 py-2 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors"
          target="_blank"
        >
          Voir le quiz ↗
        </Link>
      </div>

      {/* Stats globales */}
      {results && results.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
            <div className="font-serif text-3xl font-semibold" style={{ color: '#4A7C6F' }}>{results.length}</div>
            <div className="text-xs text-stone-500 mt-1">participant{results.length > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
            <div className="font-serif text-3xl font-semibold" style={{ color: '#4A7C6F' }}>{avg}%</div>
            <div className="text-xs text-stone-500 mt-1">moyenne</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
            <div className="font-serif text-3xl font-semibold" style={{ color: '#4A7C6F' }}>{best}%</div>
            <div className="text-xs text-stone-500 mt-1">meilleur score</div>
          </div>
        </div>
      )}

      {/* Tableau des résultats */}
      {!results || results.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-4xl mb-3">📊</div>
          <p>Aucun résultat pour ce quiz pour l'instant.</p>
          <p className="text-sm mt-1">Partagez le lien du quiz pour commencer à collecter des résultats.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Participant</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Score</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Note</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any) => {
                const mentionColor = r.percent >= 70 ? '#4A7C6F' : r.percent >= 50 ? '#C4962A' : '#A32D2D'
                const mention = r.percent >= 90 ? 'Excellent' : r.percent >= 70 ? 'Bien' : r.percent >= 50 ? 'Assez bien' : 'À revoir'
                const date = new Date(r.completed_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })
                return (
                  <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium">{r.first_name} {r.last_name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold" style={{ color: '#4A7C6F' }}>{r.score}/{r.total}</span>
                      <span className="text-stone-400 text-xs ml-1">({r.percent}%)</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: mentionColor + '18', color: mentionColor }}
                      >
                        {mention}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-stone-400 text-xs">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
