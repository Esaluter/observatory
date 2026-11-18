import React, { useState } from 'react';
import { Sparkles, Calendar, User, ShieldCheck, ArrowRight, Play, Maximize2, ExternalLink } from 'lucide-react';
import { ApodRecord, Language, DataManifest } from '../types/dataContract';
import { translations } from '../i18n/translations';
import { resolveMedia, formatDateLocale } from '../services/dataLoader';

interface HeroFeaturedProps {
  publication: ApodRecord;
  lang: Language;
  manifest: DataManifest | null;
  onOpenDetail: (pub: ApodRecord) => void;
  onScrollToArchive: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  publication,
  lang,
  manifest,
  onOpenDetail,
  onScrollToArchive
}) => {
  const t = translations[lang];
  const resolved = resolveMedia(publication);
  const formattedDate = formatDateLocale(publication.date, lang);
  const displayTitle = publication.title;

  const totalCount = manifest?.sources?.apod?.count || 66;

  const [imgError, setImgError] = useState(false);
  const isPublicDomain = publication.rightsStatus === 'nasa_public_domain';
  const isLocalVerified = publication.mediaStorageStatus === 'local_public';

  return (
    <section id="hero" className="relative pt-6 pb-20 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Tag & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-4 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.hero.tag}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{totalCount} NASA APOD Items</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-cosmic text-slate-100 tracking-tight leading-tight mb-4">
            {t.hero.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {t.hero.lead}
          </p>
        </div>

        {/* Grand Featured Window Card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#050b18] border border-slate-700/60 overflow-hidden shadow-2xl shadow-cyan-950/40 group">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            
            {/* Visual Viewport (Col 1-7) */}
            <div className="relative lg:col-span-7 bg-black min-h-[380px] lg:min-h-full flex items-center justify-center overflow-hidden">
              
              {resolved.isVideo ? (
                resolved.embedUrl ? (
                  <iframe
                    src={resolved.embedUrl}
                    title={publication.title}
                    className="w-full h-full min-h-[380px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Play className="w-16 h-16 text-cyan-400 mb-3" />
                    <span>{t.detail.videoNotice}</span>
                  </div>
                )
              ) : (resolved.displayUrl && !imgError) ? (
                <div 
                  className="relative w-full h-full cursor-pointer overflow-hidden"
                  onClick={() => onOpenDetail(publication)}
                >
                  <img
                    src={resolved.displayUrl}
                    alt={displayTitle}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-950/75 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold font-serif-cosmic text-slate-200">{displayTitle}</h4>
                  <p className="text-xs max-w-sm text-slate-400">{t.detail.copyrightFallbackDesc}</p>
                  <a
                    href={publication.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono"
                  >
                    <span>NASA APOD</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Verified Public Domain Badge */}
              {(isPublicDomain || isLocalVerified) && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium backdrop-blur-md shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isLocalVerified ? (lang === 'ru' ? 'Подтверждённый локальный файл' : 'Verified Local Asset') : t.hero.verifiedDomainBadge}</span>
                </div>
              )}
            </div>

            {/* Scientific Narrative & Context (Col 8-12) */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">APOD #{publication.date}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-serif-cosmic text-white mb-4 leading-snug">
                  {displayTitle}
                </h2>

                {/* Scientific Explanation Excerpt */}
                <div className="relative mb-6">
                  <p className="text-sm text-slate-300 font-light leading-relaxed line-clamp-4">
                    {publication.description}
                  </p>
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{t.detail.scienceNotice}</span>
                  </div>
                </div>

                {/* Authorship & Credit */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 mb-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">{t.detail.authorLabel}:</span>
                    <strong className="text-slate-200 truncate">{publication.credits || publication.copyright || 'NASA'}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">{t.detail.rightsLabel}:</span>
                    <span className="text-cyan-300 truncate">
                      {isPublicDomain ? 'NASA Public Domain' : 'Review Required (Citation)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenDetail(publication)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wider transition-all shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/80 cursor-pointer"
                >
                  <span>{t.hero.ctaExplore}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onScrollToArchive}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition-colors cursor-pointer"
                >
                  <span>{t.hero.ctaArchive}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
