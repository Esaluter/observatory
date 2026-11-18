import React from 'react';
import { Telescope, ShieldCheck, Cpu, ArrowUp } from 'lucide-react';
import { Language, DataManifest } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  manifest: DataManifest | null;
}

export const Footer: React.FC<FooterProps> = ({ lang, manifest }) => {
  const t = translations[lang];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="about" className="border-t border-slate-800 bg-[#02050e] text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Mission Statement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Disclaimer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Telescope className="w-4 h-4 text-cyan-400" />
              <span>{t.footer.disclaimerTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              {t.footer.disclaimerText}
            </p>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>{t.footer.architectureTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              {t.footer.architectureText}
            </p>
            {manifest && (
              <div className="text-[11px] font-mono text-slate-500">
                Schema: <span className="text-slate-300">v{manifest.schemaVersion}</span> • 
                APOD: <span className="text-slate-300">{manifest.sources?.apod?.count || 0} items</span>
                {manifest.generatedAt && (
                  <span className="text-slate-400"> • Generated: {manifest.generatedAt.slice(0, 10)}</span>
                )}
              </div>
            )}
          </div>

          {/* Col 3: Rights & IP */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.footer.rightsTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              {t.footer.rightsText}
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500">
            <span>© 2024–2026 {t.footer.authorBrand}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-cyan-400">Website Sprint 001 — First Light</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>{lang === 'ru' ? 'Наверх' : 'Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
