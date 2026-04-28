import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Quiz = {
  id: string
  title: string
  description: string
  created_at: string
}

export type Question = {
  id: string
  quiz_id: string
  text: string
  choices: string[]
  correct_index: number
  position: number
}
