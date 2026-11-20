import React from 'react';
import { Telescope, ExternalLink, ArrowUp, Sparkles } from 'lucide-react';
import { Language } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="about" className="border-t border-slate-800 bg-[#02050e] text-slate-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Concise Independent Observatory Statement & Scientific Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10 border-b border-slate-800/80">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Telescope className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{t.footer.aboutTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light max-w-lg">
              {t.footer.aboutText}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{t.footer.sourcesTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light max-w-lg">
              {t.footer.sourcesText}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
              <a
                href="https://epic.gsfc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <span>{t.footer.epicPortalLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://apod.nasa.gov/apod/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <span>{t.footer.apodPortalLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-slate-500">
            <span>{t.footer.copyrightLine}</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{t.footer.backToTop}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
