import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QuizEditor from '@/components/QuizEditor'
import Link from 'next/link'

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  if (!auth || auth.value !== 'true') redirect('/admin')

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', params.id).single()
  const { data: questions } = await supabase.from('questions').select('*').eq('quiz_id', params.id).order('position')

  if (!quiz) redirect('/admin/dashboard')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/dashboard" className="text-stone-400 hover:text-stone-600 text-sm">← Retour</Link>
        <h1 className="font-serif text-3xl font-semibold">Modifier le quiz</h1>
      </div>
      <QuizEditor
        quizId={quiz.id}
        initialTitle={quiz.title}
        initialDescription={quiz.description}
        initialQuestions={questions || []}
      />
    </div>
  )
}
