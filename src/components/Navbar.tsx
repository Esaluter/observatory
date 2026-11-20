import React, { useState } from 'react';
import { Telescope, Globe2, Sparkles, Layers, Info, Menu, X } from 'lucide-react';
import { Language } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const navItems = [
    { id: 'earth', label: t.nav.earth, icon: Globe2 },
    { id: 'stories', label: t.nav.stories, icon: Sparkles },
    { id: 'archive', label: t.nav.archive, icon: Layers },
    { id: 'about', label: t.nav.about, icon: Info }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#030611]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Brand Logo & Title */}
          <button
            type="button"
            onClick={() => handleNavClick('earth')}
            className="flex items-center gap-3.5 cursor-pointer group text-left shrink-0"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-900/40 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:border-cyan-400 transition-colors">
              <Telescope className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-slate-100 group-hover:text-cyan-200 transition-colors whitespace-nowrap">
                  {lang === 'ru' ? 'ЕНОТКОРП' : 'RACCOONCORP'}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-cyan-300/90 font-mono tracking-widest whitespace-nowrap">
                  OBSERVATORY
                </span>
              </div>
              <span className="text-xs text-slate-400 font-light tracking-wide whitespace-nowrap">
                {t.appSubtitle}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-slate-800/80"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Language Switcher (Desktop) */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-300 transition-all font-mono cursor-pointer whitespace-nowrap"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{lang.toUpperCase()}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-500 hover:text-slate-300">{lang === 'ru' ? 'EN' : 'RU'}</span>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 cursor-pointer"
            >
              {lang.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-400 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#040816]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
        </div>
      )}
    </header>
  );
};
