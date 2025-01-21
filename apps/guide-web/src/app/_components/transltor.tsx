'use client';

import { Trans, useTranslation } from 'react-i18next';

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
        <p>단어/문장 예제 👉</p>
        <p className="font-bold">{t('AA00')}</p>
      </div>
      <div className="flex gap-3">
        <p>단어/문장 예제 변환됨 👉</p>
        <p className="font-bold">{t('AA01')}</p>
      </div>

      <div className="flex gap-3">
        <p>단어 조합 예제 👉</p>
        <p className="font-bold">
          {t('COMBINATION', { word1: 'Bread', word2: 'Butter' })}
        </p>
      </div>
      <div className="flex gap-3">
        <p>문장 조합 예제 👉</p>
        <p className="font-bold">{t('GREETING', { name: 'John' })}</p>
      </div>
      <div className="flex gap-3">
        <p>작업 상태 예제 👉</p>
        <p className="font-bold">{t('TASK_STATUS', { count: 5, total: 10 })}</p>
      </div>

      <div className="flex gap-3">
        <p>HTML 태그 포함 예제 👉</p>
        <p>
          <Trans
            i18nKey="WELCOME_HTML"
            values={{ name: 'John' }}
            components={{
              strong: <strong style={{ color: 'blue' }} />,
            }}
          />
        </p>
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
