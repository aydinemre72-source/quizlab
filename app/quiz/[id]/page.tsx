'use client'

import { useEffect, useState } from 'react'
import { supabase, Quiz, Question } from '@/lib/supabase'
import Link from 'next/link'

type Step = 'identity' | 'playing' | 'finished'

export default function QuizPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>('identity')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [identityError, setIdentityError] = useState('')

  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [saving, setSaving] = useState(false)

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

  function startQuiz() {
    if (!firstName.trim() || !lastName.trim()) {
      setIdentityError('Merci de renseigner votre prénom et votre nom.')
      return
    }
    setIdentityError('')
    setStep('playing')
  }

  function answer(ci: number) {
    if (answered !== null) return
    setAnswered(ci)
    if (ci === questions[current].correct_index) setScore(s => s + 1)
  }

  async function next() {
    const q = questions[current]
    const isLast = current + 1 >= questions.length
    const newScore = answered === q.correct_index ? score + 1 : score

    if (isLast) {
      setFinalScore(newScore)
      setSaving(true)
      setStep('finished')
      await supabase.from('results').insert({
        quiz_id: quiz!.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        score: newScore,
        total: questions.length,
        percent: Math.round((newScore / questions.length) * 100),
      })
      setSaving(false)
    } else {
      setCurrent(c => c + 1)
      setAnswered(null)
    }
  }

  function restart() {
    setCurrent(0)
    setAnswered(null)
    setScore(0)
    setFinalScore(0)
    setStep('identity')
  }

  // ── ÉTAPE 1 : identité ────────────────────────────────────────────
  if (step === 'identity') {
    return (
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 mb-6 inline-block">← Retour</Link>
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-semibold mb-1">{quiz.title}</h1>
            {quiz.description && <p className="text-stone-500 text-sm">{quiz.description}</p>}
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#E8F0EE] text-[#4A7C6F]">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="border-t border-stone-100 pt-6">
            <p className="text-sm font-medium text-stone-600 mb-4">Avant de commencer, présentez-vous :</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Prénom</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
                  placeholder="Marie"
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Nom</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
                  placeholder="Dupont"
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                />
              </div>
              {identityError && <p className="text-red-500 text-xs">{identityError}</p>}
              <button
                onClick={startQuiz}
                className="mt-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: '#4A7C6F' }}
              >
                Commencer le quiz →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ÉTAPE 3 : résultats ───────────────────────────────────────────
  if (step === 'finished') {
    const pct = Math.round((finalScore / questions.length) * 100)
    const msg = pct === 100 ? '🎉 Parfait !' : pct >= 70 ? '👏 Bien joué !' : pct >= 40 ? '🙂 Pas mal !' : '💪 Encore un effort !'
    const mention = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Bien' : pct >= 50 ? 'Assez bien' : 'À revoir'
    const mentionColor = pct >= 70 ? '#4A7C6F' : pct >= 50 ? '#C4962A' : '#A32D2D'

    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          {saving ? (
            <div className="py-8">
              <p className="text-stone-400 text-sm">Enregistrement du résultat…</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-stone-400 mb-1">{firstName} {lastName}</div>
              <div className="font-serif text-lg mb-5 text-stone-600">{quiz.title}</div>

              <div className="font-serif text-6xl font-semibold mb-1" style={{ color: '#4A7C6F' }}>
                {finalScore}<span className="text-3xl text-stone-300">/{questions.length}</span>
              </div>
              <div className="text-stone-500 text-sm mb-3">{pct}% de bonnes réponses</div>
              <div
                className="inline-block text-sm font-medium px-4 py-1 rounded-full mb-4"
                style={{ backgroundColor: mentionColor + '18', color: mentionColor }}
              >
                {mention}
              </div>
              <div className="text-xl mb-8">{msg}</div>

              <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-400 mb-6">
                Votre résultat a été enregistré.
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={restart}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Recommencer
                </button>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ backgroundColor: '#4A7C6F' }}
                >
                  Autres quiz
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── ÉTAPE 2 : questions ───────────────────────────────────────────
  const q = questions[current]
  const progress = (current / questions.length) * 100

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">
          {firstName} {lastName} · <span style={{ color: '#4A7C6F' }}>{quiz.title}</span>
        </span>
        <button onClick={restart} className="text-sm text-stone-400 hover:text-stone-600">Quitter</button>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#4A7C6F' }} />
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
