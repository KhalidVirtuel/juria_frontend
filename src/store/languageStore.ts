import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'fr' | 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'mizen-language',
    }
  )
);
