'use client'

import { useLang } from '@/lib/lang-context'
import { Lang } from '@/lib/i18n'

const flags: Record<Lang, string> = { fr: '🇫🇷', tr: '🇹🇷' }
const labels: Record<Lang, string> = { fr: 'FR', tr: 'TR' }

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  const other: Lang = lang === 'fr' ? 'tr' : 'fr'

  return (
    <button
      onClick={() => setLang(other)}
      className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors px-2 py-1 rounded-lg hover:bg-stone-100"
      title="Changer de langue / Dili değiştir"
    >
      <span>{flags[lang]}</span>
      <span className="font-medium">{labels[lang]}</span>
    </button>
  )
}
