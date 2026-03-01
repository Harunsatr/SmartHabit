export type Locale = 'en' | 'id' | 'zh'

export const locales: Locale[] = ['en', 'id', 'zh']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  zh: '简体中文',
}

export const defaultLocale: Locale = 'en'
