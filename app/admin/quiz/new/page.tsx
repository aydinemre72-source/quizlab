import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import QuizEditor from '@/components/QuizEditor'
import Link from 'next/link'

export default function NewQuizPage() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  if (!auth || auth.value !== 'true') redirect('/admin')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/dashboard" className="text-stone-400 hover:text-stone-600 text-sm">← Retour</Link>
        <h1 className="font-serif text-3xl font-semibold">Nouveau quiz</h1>
      </div>
      <QuizEditor />
    </div>
  )
}
