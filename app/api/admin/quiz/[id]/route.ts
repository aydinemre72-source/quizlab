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
  return cookieStore.get('admin_auth')?.value === 'true'
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, questions } = await req.json()
  const supabase = getAdminClient()

  const { error: quizError } = await supabase
    .from('quizzes')
    .update({ title, description })
    .eq('id', params.id)

  if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })

  // Supprimer les anciennes questions et réinsérer
  await supabase.from('questions').delete().eq('quiz_id', params.id)

  const questionRows = questions.map((q: any, i: number) => ({
    quiz_id: params.id,
    text: q.text,
    choices: q.choices,
    correct_index: q.correct_index,
    position: i,
  }))

  const { error: qError } = await supabase.from('questions').insert(questionRows)
  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getAdminClient()
  const { error } = await supabase.from('quizzes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
