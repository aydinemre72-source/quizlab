'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

export default function AdminLoginPage() {
  const { lang } = useLang()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) { router.push('/admin/dashboard'); router.refresh() }
    else { setError(t(lang, 'admin_error')); setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto mt-12 sm:mt-16 px-2">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold mb-1">{t(lang, 'admin_title')}</h1>
        <p className="text-stone-500 text-sm mb-6">{t(lang, 'admin_subtitle')}</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">{t(lang, 'admin_password')}</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A7C6F] transition-colors"
              placeholder="••••••••" required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="py-2.5 rounded-xl text-white text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#4A7C6F' }}>
            {loading ? t(lang, 'admin_logging') : t(lang, 'admin_login')}
          </button>
        </form>
      </div>
    </div>
  )
}
