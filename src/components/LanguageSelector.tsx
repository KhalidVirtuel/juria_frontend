import { useState } from 'react';
import { useLanguageStore, type Language } from '@/store/languageStore';

export const LanguageSelector = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowMenu(false);
  };

  return (
    <div className="relative flex-shrink-0">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/15 transition-all duration-200"
        title="Changer de langue"
      >
        <span className="text-2xl">
          {language === 'fr' && '🇫🇷'}
          {language === 'en' && '🇬🇧'}
          {language === 'ar' && '🇲🇦'}
        </span>
      </button>
      
      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden z-50 shadow-lg">
            <button 
              onClick={() => handleLanguageChange('fr')}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/20 transition-colors duration-200 text-white"
            >
              <span className="text-2xl">🇫🇷</span>
              <span className="text-sm">Français</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('en')}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/20 transition-colors duration-200 text-white"
            >
              <span className="text-2xl">🇬🇧</span>
              <span className="text-sm">English</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('ar')}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/20 transition-colors duration-200 text-white"
            >
              <span className="text-2xl">🇲🇦</span>
              <span className="text-sm">العربية</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
