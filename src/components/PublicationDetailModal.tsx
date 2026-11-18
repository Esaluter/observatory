import React, { useState, useEffect } from 'react';
import { X, Calendar, User, ShieldCheck, ExternalLink, Sparkles, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { ApodRecord, Language } from '../types/dataContract';
import { translations } from '../i18n/translations';
import { resolveMedia, formatDateLocale } from '../services/dataLoader';

interface PublicationDetailModalProps {
  publication: ApodRecord;
  publications: ApodRecord[];
  lang: Language;
  onClose: () => void;
  onNavigatePublication: (pub: ApodRecord) => void;
}

export const PublicationDetailModal: React.FC<PublicationDetailModalProps> = ({
  publication,
  publications,
  lang,
  onClose,
  onNavigatePublication
}) => {
  const t = translations[lang];
  const resolved = resolveMedia(publication);
  const formattedDate = formatDateLocale(publication.date, lang);
  const [imgError, setImgError] = useState(false);

  // Reset img error on publication switch
  useEffect(() => {
    setImgError(false);
  }, [publication.id]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [publication, publications]);

  const currentIndex = publications.findIndex(p => p.id === publication.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < publications.length - 1 && currentIndex >= 0;

  const handlePrev = () => {
    if (hasPrev) onNavigatePublication(publications[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigatePublication(publications[currentIndex + 1]);
  };

  const displayTitle = publication.title;
  const isVideo = publication.mediaType === 'video' || publication.mediaType === 'iframe';
  const isLocalVerified = publication.mediaStorageStatus === 'local_public';
  const isPublicDomain = publication.rightsStatus === 'nasa_public_domain';
  const authorCredit = publication.credits || publication.copyright || 'NASA';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>OBSERVATORY WINDOW • APOD #{publication.date}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next buttons */}
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 mr-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                aria-label="Previous publication"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono text-slate-500 px-1.5">
                {currentIndex + 1} / {publications.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                aria-label="Next publication"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          
          {/* Main Viewport Container */}
          <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
            
            {isVideo ? (
              resolved.embedUrl ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={resolved.embedUrl}
                    title={publication.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Film className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-200">{t.detail.videoNotice}</p>
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-all"
                  >
                    <span>{t.detail.nasaSourceBtn}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )
            ) : (resolved.displayUrl && !imgError) ? (
              <div className="relative w-full flex items-center justify-center bg-black">
                <img
                  src={resolved.displayUrl}
                  alt={displayTitle}
                  onError={() => setImgError(true)}
                  className="max-h-[65vh] w-auto object-contain mx-auto"
                />
                {isLocalVerified ? (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-mono shadow-xl backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Local Public Asset</span>
                  </div>
                ) : isPublicDomain ? (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs font-mono shadow-xl backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>NASA Public Domain</span>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Restricted / Load fallback */
              <div className="p-10 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold font-serif-cosmic text-slate-100">
                  {t.detail.copyrightFallbackTitle}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.detail.copyrightFallbackDesc}
                </p>
                <div className="pt-2">
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-950 transition-all"
                  >
                    <span>{t.detail.nasaSourceBtn}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Titles & Original NASA Reference */}
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-cyan-400 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">ID: {publication.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-cosmic text-white mb-2 leading-tight">
              {displayTitle}
            </h1>
          </div>

          {/* 2-Column Scientific Content & Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-800">
            
            {/* Left: Scientific Explanation (Col 1-8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <h3 className="text-base font-bold font-serif-cosmic text-slate-200">
                  {t.detail.originalScientificText}
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {t.detail.scienceNotice}
                </span>
              </div>

              {/* Unabridged scientific text */}
              <div className="prose prose-invert max-w-none text-slate-300 font-light text-sm sm:text-base leading-relaxed space-y-4">
                <p>{publication.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed font-light">
                {t.detail.scienceNoticeDetail}
              </div>
            </div>

            {/* Right: Metadata & Legal Rights (Col 9-12) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  {t.detail.metadataHeader}
                </h4>

                {/* Date */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">{t.detail.dateLabel}</div>
                  <div className="text-xs text-slate-200 font-mono">{publication.date}</div>
                </div>

                {/* Author / Credit */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">{t.detail.authorLabel}</div>
                  <div className="text-xs text-slate-200 font-medium">{authorCredit}</div>
                </div>

                {/* Rights Status */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">{t.detail.rightsLabel}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPublicDomain || isLocalVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-xs text-slate-200">
                      {isPublicDomain ? 'NASA Public Domain' : 'Review Required (Citation)'}
                    </span>
                  </div>
                </div>

                {/* Storage Status */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">{t.detail.cacheStatusLabel}</div>
                  <div className="text-xs font-mono text-slate-300">
                    {isLocalVerified 
                      ? (lang === 'ru' ? 'Локальный файл (проверен)' : 'Local public verified') 
                      : (publication.mediaStorageStatus === 'private_archive'
                          ? (lang === 'ru' ? 'Локальный архив (требует проверки)' : 'Private archive')
                          : (lang === 'ru' ? 'Только внешний URL' : 'External only')
                        )}
                  </div>
                </div>

                {/* Canonical NASA Link */}
                <div className="pt-3 border-t border-slate-800">
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-medium transition-colors"
                  >
                    <span>{t.detail.nasaSourceBtn}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
