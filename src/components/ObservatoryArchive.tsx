import React, { useMemo, useState } from 'react';
import {
  Layers,
  Globe2,
  Sparkles,
  Library,
  Search,
  X,
  Calendar,
  Clock,
  ArrowUpRight,
  Film,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  EpicCollection,
  EpicDataState,
  Language,
  ObservatoryRecord,
  ObservatorySource,
  SourceDataState
} from '../types/dataContract';
import { translations } from '../i18n/translations';
import {
  EpicDaySeries,
  formatDateLocale,
  getRecordAttribution,
  resolveMedia,
  resolveStoryContent
} from '../services/dataLoader';

type ArchiveTabId = 'epic' | 'apod' | 'library';

interface ObservatoryArchiveProps {
  epicSeries: EpicDaySeries[];
  epicState: EpicDataState;
  apodState: SourceDataState;
  libraryState: SourceDataState;
  releaseId?: string;
  lang: Language;
  onOpenEpicSeries: (dateKey: string, collection: EpicCollection) => void;
  onSelectRecord: (record: ObservatoryRecord, contextList: ObservatoryRecord[]) => void;
  onRetrySource: (source: ObservatorySource) => void;
}

export const ObservatoryArchive: React.FC<ObservatoryArchiveProps> = ({
  epicSeries,
  epicState,
  apodState,
  libraryState,
  releaseId,
  lang,
  onOpenEpicSeries,
  onSelectRecord,
  onRetrySource
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<ArchiveTabId>('epic');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredApod = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return apodState.items;
    return apodState.items.filter((item) => {
      const story = resolveStoryContent(item, lang);
      const attribution = getRecordAttribution(item).toLowerCase();
      return (
        story.title.toLowerCase().includes(q) ||
        (story.body || '').toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        attribution.includes(q)
      );
    });
  }, [apodState.items, searchQuery, lang]);

  const filteredLibrary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return libraryState.items;
    return libraryState.items.filter((item) => {
      const story = resolveStoryContent(item, lang);
      const attribution = getRecordAttribution(item).toLowerCase();
      return (
        story.title.toLowerCase().includes(q) ||
        (story.body || '').toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        attribution.includes(q)
      );
    });
  }, [libraryState.items, searchQuery, lang]);

  const tabs: Array<{ id: ArchiveTabId; label: string; count: number; icon: typeof Globe2 }> = [
    { id: 'epic', label: t.archive.tabEpic, count: epicSeries.length, icon: Globe2 },
    { id: 'apod', label: t.archive.tabApod, count: apodState.items.length, icon: Sparkles },
    { id: 'library', label: t.archive.tabLibrary, count: libraryState.items.length, icon: Library }
  ];

  return (
    <section id="archive" className="py-16 sm:py-20 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.archive.kicker}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-cosmic text-slate-100">
              {t.archive.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              {t.archive.subtitle}
            </p>
          </div>

          {/* Archive Tabs */}
          <div
            className="flex flex-wrap items-center gap-1.5 bg-slate-900/75 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto"
            role="tablist"
            aria-label={t.archive.title}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/45 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-[11px] font-mono text-slate-400">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: EPIC Earth Series by Date (1 card per day — never 74 repetitive cards) */}
        {activeTab === 'epic' && (
          <div>
            {epicState.status === 'error' && epicSeries.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-rose-900/50 text-center max-w-xl mx-auto space-y-4">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm text-slate-200">{t.archive.sourceError}</p>
                <button
                  type="button"
                  onClick={() => onRetrySource('epic')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.archive.retryBtn}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {epicSeries.map((series) => {
                  const previewMedia = resolveMedia(series.previewFrame, undefined, releaseId);
                  const dateLabel = formatDateLocale(series.dateKey, lang);
                  const hasBothModes = series.natural.length > 0 && series.enhanced.length > 0;
                  const timeRange =
                    series.startUtc && series.endUtc
                      ? t.archive.epicSeriesRange(
                          series.startUtc.slice(0, 5),
                          `${series.endUtc.slice(0, 5)} UTC`
                        )
                      : null;

                  return (
                    <article
                      key={series.dateKey}
                      className="group flex flex-col rounded-3xl bg-gradient-to-b from-slate-900/85 to-slate-950/90 border border-slate-800 hover:border-cyan-500/45 overflow-hidden shadow-lg transition-all duration-300"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenEpicSeries(series.dateKey, 'natural')}
                        aria-label={`${t.archive.epicSeriesOpenBtn}: ${dateLabel}`}
                        className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden border-b border-slate-800/80 cursor-pointer"
                      >
                        {previewMedia.displayUrl ? (
                          <img
                            src={previewMedia.displayUrl}
                            alt={dateLabel}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <Globe2 className="w-12 h-12 text-slate-700" />
                        )}
                      </button>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-mono text-cyan-400 tabular-nums">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>{dateLabel}</span>
                            </span>
                            {hasBothModes && (
                              <span className="text-[11px] text-slate-400">
                                {t.archive.epicBothModes}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold font-serif-cosmic text-slate-100">
                            {t.archive.epicSeriesFrames(series.frameCount)}
                          </h3>

                          {timeRange && (
                            <p className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 tabular-nums">
                              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{timeRange}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenEpicSeries(series.dateKey, 'natural')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span>{t.archive.epicSeriesOpenBtn}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          </button>

                          {series.enhanced.length > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenEpicSeries(series.dateKey, 'enhanced')}
                              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {t.earth.enhancedLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APOD Stories Archive */}
        {activeTab === 'apod' && (
          <div className="space-y-6">
            {apodState.status === 'error' ? (
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-rose-900/50 text-center max-w-xl mx-auto space-y-4">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm text-slate-200">{t.archive.sourceError}</p>
                <button
                  type="button"
                  onClick={() => onRetrySource('apod')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.archive.retryBtn}</span>
                </button>
              </div>
            ) : (
              <>
                {apodState.items.length > 0 && (
                  <div className="relative max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.archive.searchPlaceholder}
                      aria-label={t.archive.searchPlaceholder}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label={t.archive.resetSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {filteredApod.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                    <p className="text-sm text-slate-400">
                      {searchQuery ? t.archive.noMatches : t.stories.emptyTitle}
                    </p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 cursor-pointer"
                      >
                        {t.archive.resetSearch}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredApod.map((item) => {
                      const media = resolveMedia(item, undefined, releaseId);
                      const story = resolveStoryContent(item, lang);
                      const thumb = media.displayUrl || media.thumbnailUrl;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectRecord(item, filteredApod)}
                          className="group flex flex-col sm:flex-row rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/45 overflow-hidden text-left transition-all cursor-pointer"
                        >
                          <div className="relative sm:w-44 aspect-video sm:aspect-auto bg-black shrink-0 flex items-center justify-center overflow-hidden">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={story.title}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <Sparkles className="w-8 h-8 text-slate-700" />
                            )}
                            {media.isArtisticPlaceholder && (
                              <span className="absolute inset-x-2 bottom-2 px-2 py-1 rounded-md bg-slate-950/85 text-[10px] leading-tight text-slate-200">
                                {t.stories.artisticPlaceholderNotice}
                              </span>
                            )}
                            {media.isVideo && (
                              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono text-amber-300">
                                <Film className="w-3 h-3" />
                                <span>{t.stories.videoLabel}</span>
                              </span>
                            )}
                          </div>

                          <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1.5 min-w-0">
                            <div className="text-xs font-mono text-cyan-400 tabular-nums">
                              {formatDateLocale(item.date, lang)} · {getRecordAttribution(item)}
                            </div>
                            <h3 className="text-base font-bold font-serif-cosmic text-slate-100 group-hover:text-cyan-200 transition-colors line-clamp-2">
                              {story.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 font-light">
                              {!story.needsCollectorText && story.body
                                ? story.body
                                : story.disclosure
                                  ? story.disclosure
                                : lang === 'ru'
                                  ? t.stories.needsExplanationRu
                                  : t.stories.needsExplanationEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: NASA Image & Video Library — Calm Future Direction */}
        {activeTab === 'library' && (
          <div>
            {libraryState.status === 'error' ? (
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-rose-900/50 text-center max-w-xl mx-auto space-y-4">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm text-slate-200">{t.archive.sourceError}</p>
                <button
                  type="button"
                  onClick={() => onRetrySource('library')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.archive.retryBtn}</span>
                </button>
              </div>
            ) : filteredLibrary.length === 0 ? (
              <div className="rounded-3xl bg-gradient-to-br from-slate-900/75 via-slate-950/85 to-indigo-950/20 border border-slate-800/90 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center mx-auto text-indigo-300">
                  <Library className="w-7 h-7" />
                </div>
                <div className="text-xs font-mono text-indigo-300 tracking-wide uppercase">
                  {t.archive.libraryBadge}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-cosmic text-slate-100">
                  {t.archive.libraryTitle}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {t.archive.libraryDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLibrary.map((item) => {
                  const media = resolveMedia(item, undefined, releaseId);
                  const story = resolveStoryContent(item, lang);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectRecord(item, filteredLibrary)}
                      className="group flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/45 overflow-hidden text-left transition-all cursor-pointer"
                    >
                      {media.displayUrl && (
                        <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
                          <img
                            src={media.displayUrl}
                            alt={story.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {media.isArtisticPlaceholder && (
                            <span className="absolute inset-x-2 bottom-2 px-2 py-1 rounded-md bg-slate-950/85 text-[10px] leading-tight text-slate-200">
                              {t.stories.artisticPlaceholderNotice}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-5 space-y-1.5">
                        <div className="text-xs font-mono text-cyan-400 tabular-nums">
                          {formatDateLocale(item.date, lang)}
                        </div>
                        <h3 className="text-base font-bold font-serif-cosmic text-slate-100 line-clamp-2">
                          {story.title}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
