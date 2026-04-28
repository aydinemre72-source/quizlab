'use client'

import { useEffect, useState } from 'react'
import { supabase, Quiz, Question } from '@/lib/supabase'
import Link from 'next/link'

export default function QuizPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: q } = await supabase.from('quizzes').select('*').eq('id', params.id).single()
      const { data: qs } = await supabase.from('questions').select('*').eq('quiz_id', params.id).order('position')
      setQuiz(q)
      setQuestions(qs || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div className="text-center py-20 text-stone-400">Chargement…</div>
  if (!quiz) return <div className="text-center py-20 text-stone-400">Quiz introuvable.</div>

  const q = questions[current]
  const pct = questions.length > 0 ? (current / questions.length) * 100 : 0

  function answer(ci: number) {
    if (answered !== null) return
    setAnswered(ci)
    if (ci === q.correct_index) setScore(s => s + 1)
  }

  function next() {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setAnswered(null)
    }
  }

  function restart() {
    setCurrent(0); setAnswered(null); setScore(0); setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    const msg = pct === 100 ? '🎉 Parfait !' : pct >= 70 ? '👏 Bien joué !' : pct >= 40 ? '🙂 Pas mal !' : '💪 Encore un effort !'
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <div className="font-serif text-lg mb-4 text-stone-600">{quiz.title}</div>
          <div className="font-serif text-6xl font-semibold mb-1" style={{ color: '#4A7C6F' }}>
            {score}/{questions.length}
          </div>
          <div className="text-stone-500 mb-2">{pct}% de bonnes réponses</div>
          <div className="text-xl mb-8">{msg}</div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={restart} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#4A7C6F' }}>
              Rejouer
            </button>
            <Link href="/" className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors">
              Autres quiz
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">{quiz.title}</span>
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">Quitter</Link>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#4A7C6F' }} />
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="text-xs font-medium text-stone-400 mb-2">Question {current + 1} / {questions.length}</div>
        <div className="font-serif text-xl font-semibold mb-6 leading-snug">{q.text}</div>

        <div className="flex flex-col gap-3">
          {q.choices.map((choice, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all '
            if (answered === null) {
              cls += 'border-stone-200 hover:border-[#4A7C6F] hover:bg-[#E8F0EE] cursor-pointer'
            } else if (i === q.correct_index) {
              cls += 'border-emerald-400 bg-emerald-50 text-emerald-800'
            } else if (i === answered) {
              cls += 'border-red-300 bg-red-50 text-red-700'
            } else {
              cls += 'border-stone-100 text-stone-400'
            }
            return (
              <button key={i} className={cls} onClick={() => answer(i)} disabled={answered !== null}>
                <span className="font-medium mr-2 text-stone-400">{String.fromCharCode(65 + i)}.</span>
                {choice}
              </button>
            )
          })}
        </div>

        {answered !== null && (
          <div className="mt-4">
            <div className={`text-sm font-medium px-4 py-2.5 rounded-xl mb-4 ${answered === q.correct_index ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {answered === q.correct_index ? '✓ Bonne réponse !' : `✗ La bonne réponse était : ${q.choices[q.correct_index]}`}
            </div>
            <div className="text-right">
              <button onClick={next} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#4A7C6F' }}>
                {current + 1 < questions.length ? 'Suivant →' : 'Voir les résultats'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
