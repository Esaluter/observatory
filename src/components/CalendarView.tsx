import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ApodRecord, Language } from '../types/dataContract';
import { translations } from '../i18n/translations';

interface CalendarViewProps {
  publications: ApodRecord[];
  lang: Language;
  onSelectPublication: (pub: ApodRecord) => void;
  onFilterByDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  publications,
  lang,
  onSelectPublication,
  onFilterByDate
}) => {
  const t = translations[lang];

  // Map publications by date
  const pubByDate = useMemo(() => {
    const map = new Map<string, ApodRecord>();
    for (const pub of publications) {
      map.set(pub.date, pub);
    }
    return map;
  }, [publications]);

  // Dynamically compute available year-months in archive sorted newest first
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(publications.map(p => p.date.slice(0, 7)))).sort().reverse();
    return months.length > 0 ? months : ['2026-11', '2026-10', '2026-09'];
  }, [publications]);

  const [currentYmIndex, setCurrentYmIndex] = useState(0);
  const currentYm = availableMonths[Math.min(currentYmIndex, availableMonths.length - 1)] || '2026-11';

  const [yearStr, monthStr] = currentYm.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed

  // Month days computation
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 is Sunday
  // Normalize to Monday = 0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const weekdaysRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdays = lang === 'ru' ? weekdaysRu : weekdaysEn;

  const monthNamesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthLabel = `${(lang === 'ru' ? monthNamesRu : monthNamesEn)[month - 1]} ${year}`;

  const monthPubsCount = publications.filter(p => p.date.startsWith(currentYm)).length;

  return (
    <section id="calendar" className="py-16 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>ASTRONOMICAL CHRONOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-cosmic text-slate-100">
            {t.calendar.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t.calendar.subtitle}
          </p>
        </div>

        {/* Calendar Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800/80">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-cosmic text-white">
                {currentMonthLabel}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {t.calendar.monthSummary(monthPubsCount)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentYmIndex(prev => Math.min(prev + 1, availableMonths.length - 1))}
                disabled={currentYmIndex === availableMonths.length - 1}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-slate-300 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentYmIndex(prev => Math.max(prev - 1, 0))}
                disabled={currentYmIndex === 0}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-slate-300 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {weekdays.map(d => (
              <div key={d} className="text-xs font-mono font-medium text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            
            {/* Blank offset days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[74px] sm:min-h-[88px] rounded-xl bg-slate-950/20 border border-slate-900/40 opacity-20" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const pub = pubByDate.get(dateStr);
              const hasPub = Boolean(pub);
              const isVideo = pub?.mediaType === 'video' || pub?.mediaType === 'iframe';
              const isPublicDomain = pub?.rightsStatus === 'nasa_public_domain';
              const isLocalVerified = pub?.mediaStorageStatus === 'local_public';
              const displayTitle = pub ? pub.title : '';

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (pub) {
                      onSelectPublication(pub);
                    }
                  }}
                  className={`relative min-h-[74px] sm:min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all group ${
                    hasPub
                      ? 'bg-slate-950/90 border-slate-700/80 hover:border-cyan-400 hover:bg-slate-900 cursor-pointer shadow-md hover:shadow-cyan-950/60'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-semibold ${hasPub ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-600'}`}>
                      {day}
                    </span>

                    {hasPub && (
                      <span className="flex items-center">
                        {isVideo ? (
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                        ) : (isLocalVerified || isPublicDomain) ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-cyan-400" />
                        )}
                      </span>
                    )}
                  </div>

                  {hasPub ? (
                    <div className="mt-1">
                      <p className="text-[10px] sm:text-[11px] font-serif-cosmic text-slate-300 group-hover:text-white line-clamp-2 leading-tight">
                        {displayTitle}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-700 font-mono italic">—</div>
                  )}

                  {/* Highlight bar at bottom */}
                  {hasPub && (
                    <div className={`h-0.5 w-full rounded-full mt-1 ${
                      isVideo ? 'bg-amber-400/80' : (isLocalVerified ? 'bg-emerald-400/90' : 'bg-cyan-500/80')
                    }`} />
                  )}
                </div>
              );
            })}

          </div>

          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>{lang === 'ru' ? 'Public Domain / Локальный файл' : 'Public Domain / Local Asset'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>{lang === 'ru' ? 'Изображение NASA' : 'NASA Image'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>{lang === 'ru' ? 'Видеоматериал' : 'Video Publication'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
