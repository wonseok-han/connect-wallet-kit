'use client';

import { useTranslation } from 'react-i18next';

import { initI18n } from '@/i18n';

initI18n('en');

export default function Translator() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <div className="flex gap-3">
        <p>이게 변환됨 👉</p>
        <p className="font-bold">{t('AA00')}</p>
      </div>
      <div className="flex gap-3">
        <p> 이게 변환됨 👉</p>
        <p className="font-bold">{t('AA01')}</p>
      </div>

      <button className="border p-1" onClick={() => changeLanguage('en')}>
        English
      </button>
      <button className="border p-1" onClick={() => changeLanguage('ko')}>
        한국어
      </button>
    </div>
  );
}
