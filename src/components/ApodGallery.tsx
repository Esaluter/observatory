import React, { useState } from 'react';
import { Search, Film, Image as ImageIcon, ShieldCheck, Calendar, User, X, Sparkles, AlertCircle } from 'lucide-react';
import { ApodRecord, FilterState, Language } from '../types/dataContract';
import { translations } from '../i18n/translations';
import { resolveMedia, formatDateLocale, getAvailableMonths } from '../services/dataLoader';

interface ApodGalleryProps {
  publications: ApodRecord[];
  filteredPublications: ApodRecord[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  lang: Language;
  onSelectPublication: (pub: ApodRecord) => void;
}

export const ApodGallery: React.FC<ApodGalleryProps> = ({
  publications,
  filteredPublications,
  filters,
  onFilterChange,
  lang,
  onSelectPublication
}) => {
  const t = translations[lang];
  const availableMonths = getAvailableMonths(publications, lang);

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      mediaType: 'all',
      rightsFilter: 'all',
      selectedDate: undefined,
      selectedMonth: undefined
    });
  };

  const hasActiveFilters = 
    Boolean(filters.searchQuery) || 
    filters.mediaType !== 'all' || 
    filters.rightsFilter !== 'all' || 
    Boolean(filters.selectedDate) || 
    Boolean(filters.selectedMonth);

  return (
    <section id="gallery" className="py-16 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLECTOR ARCHIVE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-cosmic text-slate-100">
              {t.gallery.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {t.gallery.subtitle}
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            {t.gallery.resultsCount(filteredPublications.length, publications.length)}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl mb-10 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder={t.gallery.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Media type filter */}
              <div className="inline-flex rounded-lg bg-slate-950/90 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => onFilterChange({ mediaType: 'all' })}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filters.mediaType === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.gallery.allMedia}
                </button>
                <button
                  onClick={() => onFilterChange({ mediaType: 'image' })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filters.mediaType === 'image'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t.gallery.imagesOnly}</span>
                </button>
                <button
                  onClick={() => onFilterChange({ mediaType: 'video' })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filters.mediaType === 'video'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{t.gallery.videosOnly}</span>
                </button>
              </div>

              {/* Rights filter */}
              <div className="inline-flex rounded-lg bg-slate-950/90 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => onFilterChange({ rightsFilter: 'all' })}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filters.rightsFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.gallery.allRights}
                </button>
                <button
                  onClick={() => onFilterChange({ rightsFilter: 'nasa_public_domain' })}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filters.rightsFilter === 'nasa_public_domain'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.gallery.publicDomainOnly}</span>
                </button>
              </div>

              {/* Month Selector */}
              <select
                value={filters.selectedMonth || ''}
                onChange={(e) => onFilterChange({ selectedMonth: e.target.value || undefined })}
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500 outline-none font-mono"
              >
                <option value="">{t.gallery.allMonths}</option>
                {availableMonths.map(m => (
                  <option key={m.ym} value={m.ym}>
                    {m.label} ({m.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/40 border border-rose-900/50 hover:bg-rose-950/80 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>{t.gallery.resetFilters}</span>
              </button>
            )}

          </div>

          {/* Active single date tag if selected via calendar */}
          {filters.selectedDate && (
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-cyan-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Фильтр по дате:' : 'Date filter:'} {formatDateLocale(filters.selectedDate, lang)}</span>
              <button
                onClick={() => onFilterChange({ selectedDate: undefined })}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Publications Grid */}
        {filteredPublications.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2 font-serif-cosmic">
              {t.gallery.noResults}
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-light">
              {t.gallery.noResultsHint}
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-all cursor-pointer"
            >
              {t.gallery.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((pub) => (
              <ApodCard
                key={pub.id}
                pub={pub}
                lang={lang}
                onSelect={() => onSelectPublication(pub)}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

interface ApodCardProps {
  pub: ApodRecord;
  lang: Language;
  onSelect: () => void;
}

const ApodCard: React.FC<ApodCardProps> = ({ pub, lang, onSelect }) => {
  const t = translations[lang];
  const resolved = resolveMedia(pub);
  const formattedDate = formatDateLocale(pub.date, lang);
  const [imgError, setImgError] = useState(false);

  const displayTitle = pub.title;
  const isVideo = pub.mediaType === 'video' || pub.mediaType === 'iframe';
  const isLocalVerified = pub.mediaStorageStatus === 'local_public';
  const isPublicDomain = pub.rightsStatus === 'nasa_public_domain';
  const authorCredit = pub.credits || pub.copyright || 'NASA';

  return (
    <article
      onClick={onSelect}
      className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-950/40 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      {/* Visual Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
        {isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50">
            {resolved.thumbnailUrl && !imgError ? (
              <img
                src={resolved.thumbnailUrl}
                alt={displayTitle}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/30 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-amber-300/90 mt-2 px-2 py-0.5 rounded bg-black/50">
                VIDEO
              </span>
            </div>
          </div>
        ) : (resolved.displayUrl && !imgError) ? (
          <>
            <img
              src={resolved.displayUrl}
              alt={displayTitle}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
          </>
        ) : (
          /* Dignified placeholder for restricted or loading fallback */
          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-950 to-slate-900/80">
            <ShieldCheck className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
            <span className="text-xs font-serif-cosmic text-slate-300 line-clamp-1">{displayTitle}</span>
            <span className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[90%]">
              {authorCredit}
            </span>
          </div>
        )}

        {/* Verified Public Domain Badge */}
        {isLocalVerified ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono backdrop-blur-md">
            Local Public
          </div>
        ) : isPublicDomain ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono backdrop-blur-md">
            Public Domain
          </div>
        ) : null}

        {/* Date Pill */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-800">
          {pub.date}
        </div>

      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-base font-bold font-serif-cosmic text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-2">
            {displayTitle}
          </h3>

          <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3 mb-4">
            {pub.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[200px]" title={authorCredit}>
            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{authorCredit}</span>
          </div>
          
          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium">
            {t.gallery.cardReadMore} →
          </span>
        </div>
      </div>

    </article>
  );
};
