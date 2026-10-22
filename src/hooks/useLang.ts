import { useState } from 'react';
import { getStrings } from '../i18n';
import type { Lang, Strings } from '../i18n';

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('shield_lang');
    if (stored === 'en' || stored === 'hi') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function useLang(): { lang: Lang; setLang: (l: Lang) => void; t: Strings } {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('shield_lang', l);
    } catch {
      // ignore
    }
  };

  return { lang, setLang, t: getStrings(lang) };
}
