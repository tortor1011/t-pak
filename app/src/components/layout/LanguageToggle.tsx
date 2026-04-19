'use client';

import { useLanguage } from '@/hooks/useLanguage';
import type { Language } from '@/services/i18n';

const LANGUAGE_OPTIONS: ReadonlyArray<{ code: Language; label: string }> = [
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center rounded-full border border-outline-variant/50 bg-white p-1"
      role="group"
      aria-label="Language switch"
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = option.code === language;

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={`min-w-10 px-2.5 py-1 rounded-full text-xs font-black tracking-wide transition-colors ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
