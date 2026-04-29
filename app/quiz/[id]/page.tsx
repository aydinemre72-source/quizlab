'use client'

import { useEffect, useState } from 'react'
import { supabase, Quiz, Question } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import Link from 'next/link'

type Step = 'identity' | 'playing' | 'finished'

export default function QuizPage({ params }: { params: { id: string } }) {
  const { lang } = useLang()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>('identity')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [identityError, setIdentityError] = useState('')

  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  // scoreRef tracks correct answers accumulating through the quiz
  const [correctCount, setCorrectCount] = useState(0)
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
      setIdentityError(t(lang, 'identity_error'))
      return
    }
    setIdentityError('')
    setStep('playing')
  }

  function answer(ci: number) {
    if (answered !== null) return
    setAnswered(ci)
    if (ci === questions[current].correct_index) {
      setCorrectCount(c => c + 1)
    }
  }

  async function next() {
    const q = questions[current]
    const isLast = current + 1 >= questions.length

    // Compute this question's contribution to score
    const addPoint = answered === q.correct_index ? 1 : 0
    const newCorrect = correctCount + addPoint

    if (isLast) {
      // newCorrect is the true final count
      const fs = correctCount + addPoint
      setFinalScore(fs)
      setSaving(true)
      setStep('finished')

      // 1. Find or create participant
      let participantId: string | null = null
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('first_name', firstName.trim())
        .eq('last_name', lastName.trim())
        .maybeSingle()

      if (existing) {
        participantId = existing.id
      } else {
        const { data: created } = await supabase
          .from('participants')
          .insert({ first_name: firstName.trim(), last_name: lastName.trim() })
          .select('id')
          .single()
        participantId = created?.id ?? null
      }

      // 2. Insert result
      if (participantId) {
        await supabase.from('results').insert({
          quiz_id: quiz!.id,
          participant_id: participantId,
          score: fs,
          total: questions.length,
          percent: Math.round((fs / questions.length) * 100),
        })
      }
      setSaving(false)
    } else {
      setCurrent(c => c + 1)
      setAnswered(null)
    }
  }

  function restart() {
    setCurrent(0)
    setAnswered(null)
    setCorrectCount(0)
    setFinalScore(0)
    setStep('identity')
  }

  const mention = (pct: number) =>
    pct >= 90 ? t(lang, 'score_excellent') : pct >= 70 ? t(lang, 'score_bien') : pct >= 50 ? t(lang, 'score_assez_bien') : t(lang, 'score_arevoir')
  const mentionColor = (pct: number) =>
    pct >= 70 ? '#4A7C6F' : pct >= 50 ? '#C4962A' : '#A32D2D'
  const msg = (pct: number) =>
    pct === 100 ? t(lang, 'score_msg_100') : pct >= 70 ? t(lang, 'score_msg_70') : pct >= 40 ? t(lang, 'score_msg_40') : t(lang, 'score_msg_0')

  // ── ÉTAPE 1 : identité ─────────────────────────────────────────────
  if (step === 'identity') {
    return (
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 mb-6 inline-block">{t(lang, 'nav_back')}</Link>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-semibold mb-1">{quiz.title}</h1>
            {quiz.description && <p className="text-stone-500 text-sm">{quiz.description}</p>}
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#E8F0EE] text-[#4A7C6F]">
              {questions.length} {questions.length !== 1 ? t(lang, 'home_questions_pl') : t(lang, 'home_questions')}
            </div>
          </div>
          <div className="border-t border-stone-100 pt-6">
            <p className="text-sm font-medium text-stone-600 mb-4">{t(lang, 'identity_before')}</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">{t(lang, 'identity_firstname')}</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
                  placeholder={t(lang, 'identity_firstname_ph')}
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">{t(lang, 'identity_lastname')}</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
                  placeholder={t(lang, 'identity_lastname_ph')}
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                />
              </div>
              {identityError && <p className="text-red-500 text-xs">{identityError}</p>}
              <button onClick={startQuiz} className="mt-1 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#4A7C6F' }}>
                {t(lang, 'identity_start')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ÉTAPE 3 : résultats ────────────────────────────────────────────
  if (step === 'finished') {
    const pct = Math.round((finalScore / questions.length) * 100)
    const mc = mentionColor(pct)
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 text-center">
          {saving ? (
            <div className="py-8"><p className="text-stone-400 text-sm">Enregistrement…</p></div>
          ) : (
            <>
              <div className="text-sm text-stone-400 mb-1">{firstName} {lastName}</div>
              <div className="font-serif text-lg mb-5 text-stone-600">{quiz.title}</div>
              <div className="font-serif text-6xl font-semibold mb-1" style={{ color: '#4A7C6F' }}>
                {finalScore}<span className="text-3xl text-stone-300">/{questions.length}</span>
              </div>
              <div className="text-stone-500 text-sm mb-3">{pct}{t(lang, 'score_percent')}</div>
              <div className="inline-block text-sm font-medium px-4 py-1 rounded-full mb-4" style={{ backgroundColor: mc + '18', color: mc }}>
                {mention(pct)}
              </div>
              <div className="text-xl mb-6">{msg(pct)}</div>
              <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-400 mb-6">{t(lang, 'score_recorded')}</div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={restart} className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors">
                  {t(lang, 'score_restart')}
                </button>
                <Link href="/" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#4A7C6F' }}>
                  {t(lang, 'score_other')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── ÉTAPE 2 : questions ────────────────────────────────────────────
  const q = questions[current]
  const progress = (current / questions.length) * 100

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-sm text-stone-500 truncate">
          {firstName} {lastName} · <span style={{ color: '#4A7C6F' }}>{quiz.title}</span>
        </span>
        <button onClick={restart} className="text-sm text-stone-400 hover:text-stone-600 shrink-0">{t(lang, 'quiz_quit')}</button>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#4A7C6F' }} />
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
        <div className="text-xs font-medium text-stone-400 mb-2">
          {t(lang, 'quiz_question')} {current + 1} {t(lang, 'quiz_on')} {questions.length}
        </div>
        <div className="font-serif text-lg sm:text-xl font-semibold mb-5 leading-snug">{q.text}</div>
        <div className="flex flex-col gap-2.5">
          {q.choices.map((choice, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all '
            if (answered === null) cls += 'border-stone-200 hover:border-[#4A7C6F] hover:bg-[#E8F0EE] cursor-pointer'
            else if (i === q.correct_index) cls += 'border-emerald-400 bg-emerald-50 text-emerald-800'
            else if (i === answered) cls += 'border-red-300 bg-red-50 text-red-700'
            else cls += 'border-stone-100 text-stone-400'
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
              {answered === q.correct_index ? t(lang, 'quiz_correct') : `${t(lang, 'quiz_wrong')} ${q.choices[q.correct_index]}`}
            </div>
            <div className="text-right">
              <button onClick={next} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#4A7C6F' }}>
                {current + 1 < questions.length ? t(lang, 'quiz_next') : t(lang, 'quiz_results')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
