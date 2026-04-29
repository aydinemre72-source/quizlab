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

  // All results joined with participant info
  const { data: results } = await supabase
    .from('results')
    .select('*, participants(first_name, last_name)')
    .eq('quiz_id', params.id)
    .order('completed_at', { ascending: false })

  // Group by participant for summary
  const byParticipant: Record<string, { name: string; attempts: typeof results; best: number; avg: number }> = {}
  if (results) {
    for (const r of results) {
      const pid = (r as any).participant_id
      const p = (r as any).participants
      if (!byParticipant[pid]) {
        byParticipant[pid] = { name: `${p.first_name} ${p.last_name}`, attempts: [], best: 0, avg: 0 }
      }
      byParticipant[pid]!.attempts.push(r)
    }
    for (const pid in byParticipant) {
      const attempts = byParticipant[pid].attempts as any[]
      byParticipant[pid].best = Math.max(...attempts.map(a => a.percent))
      byParticipant[pid].avg = Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length)
    }
  }

  const totalParticipants = Object.keys(byParticipant).length
  const globalAvg = results && results.length > 0
    ? Math.round(results.reduce((s: number, r: any) => s + r.percent, 0) / results.length)
    : null
  const globalBest = results && results.length > 0
    ? Math.max(...(results as any[]).map(r => r.percent))
    : null

  const mentionLabel = (pct: number) =>
    pct >= 90 ? 'Excellent' : pct >= 70 ? 'Bien' : pct >= 50 ? 'Assez bien' : 'À revoir'
  const mentionColor = (pct: number) =>
    pct >= 70 ? '#4A7C6F' : pct >= 50 ? '#C4962A' : '#A32D2D'
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin/dashboard" className="text-stone-400 hover:text-stone-600 text-sm">← Retour</Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold">{quiz.title}</h1>
          <p className="text-stone-500 text-sm mt-1">Résultats des participants</p>
        </div>
        <Link href={`/quiz/${quiz.id}`} className="px-4 py-2 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors self-start" target="_blank">
          Voir le quiz ↗
        </Link>
      </div>

      {/* Stats globales */}
      {results && results.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { value: totalParticipants, label: `participant${totalParticipants > 1 ? 's' : ''}` },
            { value: `${globalAvg}%`, label: 'moyenne' },
            { value: `${globalBest}%`, label: 'meilleur score' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 text-center">
              <div className="font-serif text-2xl sm:text-3xl font-semibold" style={{ color: '#4A7C6F' }}>{value}</div>
              <div className="text-xs text-stone-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {!results || results.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-4xl mb-3">📊</div>
          <p>Aucun résultat pour ce quiz pour l'instant.</p>
          <p className="text-sm mt-1">Partagez le lien du quiz pour commencer à collecter des résultats.</p>
        </div>
      ) : (
        <>
          {/* Par participant */}
          <h2 className="font-serif text-xl font-semibold mb-3">Par participant</h2>
          <div className="flex flex-col gap-3 mb-8">
            {Object.entries(byParticipant).map(([pid, data]) => (
              <div key={pid} className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{data.name}</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {(data.attempts as any[]).length} tentative{(data.attempts as any[]).length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold" style={{ color: '#4A7C6F' }}>{data.best}%</div>
                      <div className="text-xs text-stone-400">meilleur</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-stone-600">{data.avg}%</div>
                      <div className="text-xs text-stone-400">moyenne</div>
                    </div>
                  </div>
                </div>
                {/* Historique tentatives */}
                {(data.attempts as any[]).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <div className="flex flex-col gap-1.5">
                      {(data.attempts as any[]).map((attempt: any, i: number) => (
                        <div key={attempt.id} className="flex items-center justify-between text-xs text-stone-500">
                          <span className="text-stone-400">{fmtDate(attempt.completed_at)}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{attempt.score}/{attempt.total} ({attempt.percent}%)</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: mentionColor(attempt.percent) + '18', color: mentionColor(attempt.percent) }}>
                              {mentionLabel(attempt.percent)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tableau chronologique complet */}
          <h2 className="font-serif text-xl font-semibold mb-3">Historique complet</h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-4 sm:px-5 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Participant</th>
                  <th className="text-center px-3 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Score</th>
                  <th className="text-center px-3 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide hidden sm:table-cell">Mention</th>
                  <th className="text-right px-4 sm:px-5 py-3.5 text-xs font-medium text-stone-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {(results as any[]).map((r: any) => (
                  <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-4 sm:px-5 py-3 font-medium">{r.participants.first_name} {r.participants.last_name}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold" style={{ color: '#4A7C6F' }}>{r.score}/{r.total}</span>
                      <span className="text-stone-400 text-xs ml-1">({r.percent}%)</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: mentionColor(r.percent) + '18', color: mentionColor(r.percent) }}>
                        {mentionLabel(r.percent)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-right text-stone-400 text-xs">{fmtDate(r.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
