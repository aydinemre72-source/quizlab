'use client'

import { useRouter } from 'next/navigation'

export default function DeleteQuizButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce quiz et toutes ses questions ?')) return
    await fetch(`/api/admin/quiz/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 rounded-lg border text-xs transition-colors"
      style={{ borderColor: '#A32D2D', color: '#A32D2D' }}
    >
      Supprimer
    </button>
  )
}
