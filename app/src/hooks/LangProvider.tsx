import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { en, zh } from './lang'

type Lang = 'en' | 'zh'
const STORAGE_KEY = 'wc2026-lang'

interface LangContextType {
  lang: Lang
  t: typeof en
  toggle: () => void
}

const LangContext = createContext<LangContextType>({ lang: 'en', t: en, toggle: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem(STORAGE_KEY) as Lang) || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch {}
  }, [lang])

  const t = lang === 'zh' ? zh : en
  const toggle = () => setLang(l => l === 'en' ? 'zh' : 'en')

  return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
