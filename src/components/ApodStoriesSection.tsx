import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  User,
  ExternalLink,
  Maximize2,
  Film,
  AlertCircle,
  RefreshCw,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Language, ObservatoryRecord, SourceDataState } from '../types/dataContract';
import { translations } from '../i18n/translations';
import {
  formatDateLocale,
  getEffectiveCardType,
  getRecordAttribution,
  resolveMedia,
  resolveStoryContent
} from '../services/dataLoader';

interface ApodStoriesSectionProps {
  apodState: SourceDataState;
  releaseId?: string;
  lang: Language;
  onOpenStory: (record: ObservatoryRecord) => void;
  onRetryApod: () => void;
}

export const ApodStoriesSection: React.FC<ApodStoriesSectionProps> = ({
  apodState,
  releaseId,
  lang,
  onOpenStory,
  onRetryApod
}) => {
  const t = translations[lang];
  const items = apodState.items;

  return (
    <section id="stories" className="py-16 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.stories.kicker}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-cosmic text-slate-100">
            {t.stories.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            {t.stories.subtitle}
          </p>
        </div>

        {/* Error / Empty / Editorial Showcase */}
        {apodState.status === 'error' ? (
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-rose-900/50 text-center max-w-xl mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-lg font-serif-cosmic font-semibold text-slate-100">
              {t.stories.errorTitle}
            </h3>
            <button
              type="button"
              onClick={onRetryApod}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.stories.retryBtn}</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-sm text-slate-400">
            {t.stories.emptyTitle}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {items.map((item) => (
              <ApodStoryCard
                key={item.id}
                item={item}
                releaseId={releaseId}
                lang={lang}
                onOpen={() => onOpenStory(item)}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

interface ApodStoryCardProps {
  item: ObservatoryRecord;
  releaseId?: string;
  lang: Language;
  onOpen: () => void;
}

const ApodStoryCard: React.FC<ApodStoryCardProps> = ({ item, releaseId, lang, onOpen }) => {
  const t = translations[lang];
  const resolved = resolveMedia(item, undefined, releaseId);
  const story = resolveStoryContent(item, lang);
  const cardType = getEffectiveCardType(item);
  const formattedDate = formatDateLocale(item.date, lang);
  const attribution = getRecordAttribution(item);
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <article className="group flex flex-col rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-cyan-500/45 shadow-xl overflow-hidden transition-all duration-300">

      {/* Large Media Showcase — omitted for text_ai_summary cards */}
      {cardType !== 'text_ai_summary' && (
        <div className="relative aspect-[16/10] w-full bg-black overflow-hidden border-b border-slate-800/80">
          {resolved.isVideo && resolved.isMediaApproved ? (
            resolved.isDirectVideo && resolved.videoUrl && !videoError ? (
              <video
                src={resolved.videoUrl}
                poster={resolved.thumbnailUrl || undefined}
                controls
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover bg-black"
              />
            ) : resolved.embedUrl && !videoError ? (
              <iframe
                src={resolved.embedUrl}
                title={story.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-2">
                <Film className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-400">{t.modal.videoFallbackDesc}</p>
              </div>
            )
          ) : resolved.displayUrl && !imgError ? (
            <button
              type="button"
              onClick={onOpen}
              aria-label={`${t.stories.readStoryBtn}: ${story.title}`}
              className="relative w-full h-full block cursor-pointer overflow-hidden text-left"
            >
              <img
                src={resolved.displayUrl}
                alt={story.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50 pointer-events-none" />
              <span className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/75 border border-slate-700 text-slate-200 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400">{t.modal.mediaFallbackTitle}</p>
            </div>
          )}
        </div>
      )}

      {/* Editorial Narrative */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-cyan-400 tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formattedDate}</span>
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{attribution}</span>
            </span>
            {story.kind === 'ai_summary' && (
              <>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-indigo-300">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span>{t.stories.aiExplanationLabel}</span>
                </span>
              </>
            )}
          </div>

          <h3 className="text-2xl sm:text-2xl font-bold font-serif-cosmic text-white leading-snug">
            {story.title}
          </h3>

          {!story.needsCollectorText && story.body ? (
            <div className="space-y-2.5">
              <p className="text-sm text-slate-300 font-light leading-relaxed line-clamp-4">
                {story.body}
              </p>
              {story.disclosure && (
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {story.disclosure}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              {lang === 'ru' ? t.stories.needsExplanationRu : t.stories.needsExplanationEn}
            </p>
          )}
        </div>

        {/* Clean Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>{resolved.isVideo ? t.stories.watchVideoBtn : t.stories.readStoryBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors font-mono"
          >
            <span>{t.stories.openSourceBtn}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </article>
  );
};
