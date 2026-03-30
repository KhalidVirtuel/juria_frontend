import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { authAPI } from '@/lib/api';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr');
  }, []);

  const onChange = async (val: string) => {
    setLang(val);
    localStorage.setItem('lang', val);
    try {
      await authAPI.updatePreferences({ language: val });
    } catch {}
  };

  return (
    <Select value={lang} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Langue" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
}
