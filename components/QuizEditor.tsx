'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type QuestionDraft = {
  id?: string
  text: string
  choices: string[]
  correct_index: number
  position: number
}

type Props = {
  quizId?: string
  initialTitle?: string
  initialDescription?: string
  initialQuestions?: QuestionDraft[]
}

function emptyQuestion(position: number): QuestionDraft {
  return { text: '', choices: ['', '', '', ''], correct_index: 0, position }
}

export default function QuizEditor({ quizId, initialTitle = '', initialDescription = '', initialQuestions = [] }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuestions.length > 0 ? initialQuestions : [emptyQuestion(0)]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q))
  }

  function updateChoice(qi: number, ci: number, value: string) {
    setQuestions(qs => qs.map((q, idx) => {
      if (idx !== qi) return q
      const choices = [...q.choices]
      choices[ci] = value
      return { ...q, choices }
    }))
  }

  function addQuestion() {
    setQuestions(qs => [...qs, emptyQuestion(qs.length)])
  }

  function removeQuestion(i: number) {
    if (questions.length <= 1) return
    setQuestions(qs => qs.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, position: idx })))
  }

  async function handleSave() {
    if (!title.trim()) { setError('Donnez un titre au quiz.'); return }
    for (const q of questions) {
      if (!q.text.trim()) { setError('Toutes les questions doivent avoir un texte.'); return }
      if (q.choices.some(c => !c.trim())) { setError('Remplissez tous les choix de réponse.'); return }
    }
    setError('')
    setSaving(true)

    const url = quizId ? `/api/admin/quiz/${quizId}` : '/api/admin/quiz'
    const method = quizId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, questions }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Erreur lors de la sauvegarde.')
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold mb-4">Informations</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Titre du quiz *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
              placeholder="Ex : Géographie mondiale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Description (optionnel)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
              placeholder="Une courte description…"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold">Questions</h2>
        <button
          onClick={addQuestion}
          className="px-4 py-2 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors"
        >
          + Ajouter
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#4A7C6F] uppercase tracking-wide">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qi)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              )}
            </div>
            <input
              value={q.text}
              onChange={e => updateQuestion(qi, { text: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors mb-4"
              placeholder="Écrivez la question…"
            />
            <div className="text-xs font-medium text-stone-500 mb-2">
              Réponses — cliquez <strong>✓</strong> pour marquer la bonne réponse
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.choices.map((choice, ci) => (
                <div key={ci} className="relative">
                  <input
                    value={choice}
                    onChange={e => updateChoice(qi, ci, e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
                    placeholder={`Choix ${ci + 1}`}
                  />
                  <button
                    onClick={() => updateQuestion(qi, { correct_index: ci })}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-sm transition-all ${q.correct_index === ci ? 'opacity-100 text-[#4A7C6F]' : 'opacity-30 hover:opacity-60'}`}
                    title="Bonne réponse"
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#4A7C6F] mt-2">
              ✓ Bonne réponse : choix {q.correct_index + 1} — {q.choices[q.correct_index] || '(vide)'}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: '#4A7C6F' }}
        >
          {saving ? 'Enregistrement…' : quizId ? 'Enregistrer' : 'Publier le quiz'}
        </button>
      </div>
    </div>
  )
}
