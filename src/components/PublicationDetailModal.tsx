import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Film,
  ChevronDown,
  ChevronUp,
  Compass,
  Clock,
  User
} from 'lucide-react';
import { Language, ObservatoryRecord } from '../types/dataContract';
import { translations } from '../i18n/translations';
import {
  resolveMedia,
  resolveStoryContent,
  formatDateLocale,
  getEffectiveCardType,
  getRecordAttribution,
  extractUtcTime,
  computeVectorDistanceKm
} from '../services/dataLoader';

interface PublicationDetailModalProps {
  publication: ObservatoryRecord;
  publications: ObservatoryRecord[];
  releaseId?: string;
  lang: Language;
  onClose: () => void;
  onNavigatePublication: (pub: ObservatoryRecord) => void;
}

export const PublicationDetailModal: React.FC<PublicationDetailModalProps> = ({
  publication,
  publications,
  releaseId,
  lang,
  onClose,
  onNavigatePublication
}) => {
  const t = translations[lang];
  const resolved = resolveMedia(publication, undefined, releaseId);
  const story = resolveStoryContent(publication, lang);
  const formattedDate = formatDateLocale(publication.date, lang);
  const utcTime = extractUtcTime(publication.date);
  const cardType = getEffectiveCardType(publication);
  const attribution = getRecordAttribution(publication);

  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  useEffect(() => {
    setImgError(false);
    setVideoError(false);
    setShowTelemetry(false);
  }, [publication.id]);

  const currentIndex = publications.findIndex((p) => p.id === publication.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < publications.length - 1 && currentIndex >= 0;

  const handlePrev = () => {
    if (hasPrev) onNavigatePublication(publications[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigatePublication(publications[currentIndex + 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [publication, publications, currentIndex]);

  const isEpic = publication.source === 'epic';
  const displayTitle = isEpic
    ? `${t.earth.title} · ${publication.collection === 'enhanced' ? t.earth.enhancedLabel : t.earth.naturalLabel}`
    : story.title;

  const hasEpicTelemetry =
    isEpic &&
    Boolean(
      publication.centroidCoordinates ||
        publication.dscovrJ2000Position ||
        publication.sunJ2000Position ||
        publication.lunarJ2000Position
    );

  const dscovrDistKm = computeVectorDistanceKm(publication.dscovrJ2000Position);
  const sunDistKm = computeVectorDistanceKm(publication.sunJ2000Position);
  const lunarDistKm = computeVectorDistanceKm(publication.lunarJ2000Position);

  const formatNumber = (n: number) =>
    new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(n);
  const kmUnit = lang === 'ru' ? 'км' : 'km';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-900/90 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 truncate tabular-nums">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isEpic
                ? `DSCOVR EPIC · ${formattedDate}${utcTime ? ` · ${utcTime}` : ''}`
                : `${formattedDate} · ${attribution}`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {publications.length > 1 && currentIndex >= 0 && (
              <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 mr-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                  aria-label={t.modal.prev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 px-1.5 tabular-nums">
                  {currentIndex + 1} / {publications.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                  aria-label={t.modal.next}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label={t.modal.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">

          {/* Media Viewport — omitted for text_ai_summary */}
          {cardType !== 'text_ai_summary' && (
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              {resolved.isVideo && resolved.isMediaApproved ? (
                resolved.isDirectVideo && resolved.videoUrl && !videoError ? (
                  <video
                    src={resolved.videoUrl}
                    poster={resolved.thumbnailUrl || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoError(true)}
                    className="w-full max-h-[65vh] bg-black"
                  />
                ) : resolved.embedUrl && !videoError ? (
                  <div className="w-full aspect-video">
                    <iframe
                      src={resolved.embedUrl}
                      title={displayTitle}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-400 max-w-lg mx-auto space-y-3">
                    <Film className="w-12 h-12 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{t.modal.videoFallbackDesc}</p>
                    <a
                      href={publication.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-all"
                    >
                      <span>{t.modal.sourceBtn(publication.source)}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )
              ) : resolved.displayUrl && !imgError ? (
                <img
                  src={resolved.displayUrl}
                  alt={displayTitle}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="max-h-[65vh] w-auto object-contain mx-auto"
                />
              ) : (
                <div className="p-10 text-center max-w-xl mx-auto space-y-3">
                  <h4 className="text-base font-bold font-serif-cosmic text-slate-100">
                    {t.modal.mediaFallbackTitle}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.modal.mediaFallbackDesc}
                  </p>
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
                  >
                    <span>{t.modal.sourceBtn(publication.source)}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Title & Concise Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-cyan-400 tabular-nums">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formattedDate}</span>
              </span>
              {utcTime && (
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{utcTime}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{attribution}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif-cosmic text-white leading-tight">
              {displayTitle}
            </h2>
          </div>

          {/* Story Narrative & Source Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-800">
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.modal.storySectionTitle}
                </h3>

                {isEpic ? (
                  <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                    {lang === 'ru'
                      ? t.earth.subtitle
                      : publication.description || t.earth.subtitle}
                  </p>
                ) : !story.needsCollectorText && story.body ? (
                  <div className="space-y-4">
                    <div className="text-slate-200 font-light text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {story.body}
                    </div>

                    {story.disclosure && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200/90 leading-relaxed">
                        {story.disclosure}
                      </div>
                    )}

                    {story.factSources.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-xs font-mono text-slate-400">
                          {t.modal.factSourcesLabel}:
                        </div>
                        <ul className="space-y-1">
                          {story.factSources.map((srcUrl) => (
                            <li key={srcUrl}>
                              <a
                                href={srcUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 break-all"
                              >
                                <span>{srcUrl}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    {lang === 'ru' ? t.stories.needsExplanationRu : t.stories.needsExplanationEn}
                  </p>
                )}
              </div>

              {/* Collapsible EPIC Scientific Parameters (optional, non-technical) */}
              {hasEpicTelemetry && (
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTelemetry((prev) => !prev)}
                    aria-expanded={showTelemetry}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t.modal.epicDetailsToggle}</span>
                    </span>
                    {showTelemetry ? (
                      <ChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {showTelemetry && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
                      {publication.centroidCoordinates && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t.earth.centroidLabel}</div>
                          <div className="font-mono text-slate-200">
                            {publication.centroidCoordinates.lat.toFixed(2)}° /{' '}
                            {publication.centroidCoordinates.lon.toFixed(2)}°
                          </div>
                        </div>
                      )}

                      {dscovrDistKm && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t.earth.dscovrDistanceLabel}</div>
                          <div className="font-mono text-slate-200">{formatNumber(dscovrDistKm)} {kmUnit}</div>
                        </div>
                      )}

                      {sunDistKm && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t.earth.sunDistanceLabel}</div>
                          <div className="font-mono text-slate-200">{formatNumber(sunDistKm)} {kmUnit}</div>
                        </div>
                      )}

                      {lunarDistKm && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t.earth.lunarDistanceLabel}</div>
                          <div className="font-mono text-slate-200">{formatNumber(lunarDistKm)} {kmUnit}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clean Sidebar: Date, Credit, Canonical NASA Link */}
            <div className="lg:col-span-4">
              <div className="p-5 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-4">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono text-slate-400">{t.modal.dateLabel}</div>
                  <div className="text-xs text-slate-200 font-mono tabular-nums">{formattedDate}</div>
                </div>

                {utcTime && (
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-mono text-slate-400">{t.modal.timeLabel}</div>
                    <div className="text-xs text-slate-200 font-mono tabular-nums">{utcTime}</div>
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono text-slate-400">{t.modal.authorLabel}</div>
                  <div className="text-xs text-slate-200 font-medium">{attribution}</div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-medium transition-colors"
                  >
                    <span>{t.modal.sourceBtn(publication.source)}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
