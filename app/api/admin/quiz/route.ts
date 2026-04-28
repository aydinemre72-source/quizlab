import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function isAuthenticated() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  return auth?.value === 'true'
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, questions } = await req.json()
  const supabase = getAdminClient()

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ title, description })
    .select()
    .single()

  if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })

  const questionRows = questions.map((q: any, i: number) => ({
    quiz_id: quiz.id,
    text: q.text,
    choices: q.choices,
    correct_index: q.correct_index,
    position: i,
  }))

  const { error: qError } = await supabase.from('questions').insert(questionRows)
  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

  return NextResponse.json({ id: quiz.id })
}
