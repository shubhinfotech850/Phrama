import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, LANGUAGES, type Language } from '../services/i18n';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  if (variant === 'full') {
    return (
      <div className={`flex items-center bg-slate-100 p-1 rounded-lg ${className}`}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code as Language)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === l.code
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors justify-center"
        aria-label="Change language"
        title={current.label}
      >
        <Globe className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code as Language);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                lang === l.code
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{l.label}</span>
              {lang === l.code && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
