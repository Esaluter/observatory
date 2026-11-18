import React from 'react';
import { Globe, Database, Atom, Clock, ShieldAlert } from 'lucide-react';
import { Language } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface ComingSoonSectionProps {
  lang: Language;
}

export const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({ lang }) => {
  const t = translations[lang];

  const modules = [
    {
      id: 'epic',
      title: t.comingSoon.epicTitle,
      desc: t.comingSoon.epicDesc,
      icon: Globe,
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      badgeColor: 'text-blue-400 bg-blue-950/80 border-blue-800/60'
    },
    {
      id: 'library',
      title: t.comingSoon.libraryTitle,
      desc: t.comingSoon.libraryDesc,
      icon: Database,
      color: 'from-purple-500/20 to-indigo-500/10',
      borderColor: 'border-purple-500/30',
      badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-800/60'
    },
    {
      id: 'lab',
      title: t.comingSoon.labTitle,
      desc: t.comingSoon.labDesc,
      icon: Atom,
      color: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60'
    }
  ];

  return (
    <section id="coming-soon" className="py-16 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 mb-3">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>ROADMAP & FUTURE PIPELINES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif-cosmic text-slate-100">
            {t.comingSoon.title}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t.comingSoon.subtitle}
          </p>
        </div>

        {/* 3 Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b ${m.color} to-slate-950/90 border ${m.borderColor} shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-200" />
                    </div>
                    <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${m.badgeColor}`}>
                      {t.comingSoon.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif-cosmic text-white mb-3">
                    {m.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Collector: offline</span>
                  <span className="text-slate-400">0 records</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Scientific Note */}
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.comingSoon.honestNote}
          </p>
        </div>

      </div>
    </section>
  );
};
