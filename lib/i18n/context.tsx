'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, defaultLocale } from './config'
import { translations, type TranslationKeys } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKeys) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['en', 'id', 'zh'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'id' || browserLang === 'zh') {
        setLocaleState(browserLang as Locale)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: TranslationKeys): string => {
    const keys = key.split('.') as string[]
    let value: any = translations[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
