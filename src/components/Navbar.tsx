import React, { useState } from 'react';
import { Telescope, Globe2, Compass, Calendar as CalendarIcon, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';
import { DataManifest, Language } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  manifest: DataManifest | null;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  manifest,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const navItems = [
    { id: 'hero', label: t.nav.home, icon: Compass },
    { id: 'gallery', label: t.nav.archive, icon: Sparkles },
    { id: 'calendar', label: t.nav.calendar, icon: CalendarIcon },
    { id: 'coming-soon', label: t.nav.directions, icon: Globe2 },
    { id: 'about', label: t.nav.about, icon: ShieldCheck }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const apodSource = manifest?.sources?.apod;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#030611]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-900/40 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:border-cyan-400 transition-colors">
              <Telescope className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-[#030611]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-slate-100 group-hover:text-cyan-200 transition-colors">
                  ЕНОТКОРП
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 font-mono">
                  OBSERVATORY
                </span>
              </div>
              <span className="text-xs text-slate-400 font-light tracking-wide">
                {lang === 'ru' ? 'Окно во Вселенную' : 'Window to the Universe'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Collector Pill & Language Selector */}
          <div className="hidden lg:flex items-center gap-3">
            {apodSource && (
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono"
                title={`${t.stats.collectorActive} • ${apodSource.count} items`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Collector: <strong className="text-slate-200">{apodSource.count} APOD</strong></span>
              </div>
            )}

            <button
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-300 transition-all font-mono"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{lang.toUpperCase()}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-500 hover:text-slate-300">{lang === 'ru' ? 'EN' : 'RU'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
            >
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-400"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#040816]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {apodSource && (
            <div className="pt-2 px-4 border-t border-slate-800/60 text-xs text-slate-500 font-mono flex items-center justify-between">
              <span>NASA Collector: {apodSource.count} APOD</span>
              <span className="text-emerald-400">● Online</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
