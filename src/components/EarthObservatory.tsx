import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  EpicCollection,
  EpicDataState,
  Language,
  ObservatoryRecord
} from '../types/dataContract';
import { translations } from '../i18n/translations';
import {
  EpicDaySeries,
  computeVectorDistanceKm,
  extractUtcTime,
  findSyncedEpicFrameIndex,
  formatDateLocale,
  getNextEpicFrameIndex,
  getRecordAttribution,
  resolveMedia
} from '../services/dataLoader';

interface EarthObservatoryProps {
  epicSeries: EpicDaySeries[];
  epicState: EpicDataState;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  collection: EpicCollection;
  onSelectCollection: (collection: EpicCollection) => void;
  releaseId?: string;
  lang: Language;
  onInspectFrame: (frame: ObservatoryRecord, seriesFrames: ObservatoryRecord[]) => void;
  onRetryEpic: () => void;
}

function formatShortDate(dateKey: string, lang: Language): string {
  try {
    const [y, m, d] = dateKey.split('-').map(Number);
    if (!y || !m || !d) return dateKey;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    }).format(dt);
  } catch {
    return dateKey;
  }
}

export const EarthObservatory: React.FC<EarthObservatoryProps> = ({
  epicSeries,
  epicState,
  selectedDateKey,
  onSelectDateKey,
  collection,
  onSelectCollection,
  releaseId,
  lang,
  onInspectFrame,
  onRetryEpic
}) => {
  const t = translations[lang];
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const activeSeries = useMemo(() => {
    if (epicSeries.length === 0) return null;
    return epicSeries.find((s) => s.dateKey === selectedDateKey) || epicSeries[0];
  }, [epicSeries, selectedDateKey]);

  const activeFrames = useMemo(() => {
    if (!activeSeries) return [];
    const chosen = collection === 'enhanced' ? activeSeries.enhanced : activeSeries.natural;
    if (chosen.length > 0) return chosen;
    return collection === 'enhanced' ? activeSeries.natural : activeSeries.enhanced;
  }, [activeSeries, collection]);

  const hasNatural = Boolean(activeSeries && activeSeries.natural.length > 0);
  const hasEnhanced = Boolean(activeSeries && activeSeries.enhanced.length > 0);

  // When selected observation day changes, jump to its latest frame and pause playback
  useEffect(() => {
    if (activeFrames.length > 0) {
      setFrameIndex(activeFrames.length - 1);
    } else {
      setFrameIndex(0);
    }
    setIsPlaying(false);
    setImgError(false);
  }, [activeSeries?.dateKey]);

  const safeIndex =
    activeFrames.length > 0 ? Math.min(Math.max(frameIndex, 0), activeFrames.length - 1) : 0;
  const currentFrame = activeFrames[safeIndex] || null;

  useEffect(() => {
    setImgError(false);
  }, [currentFrame?.id]);

  // Preload active day frames so Earth rotation playback is smooth without flicker
  useEffect(() => {
    if (typeof Image === 'undefined' || activeFrames.length <= 1) return;
    activeFrames.forEach((frame) => {
      const m = resolveMedia(frame, undefined, releaseId);
      if (m.displayUrl) {
        const img = new Image();
        img.src = m.displayUrl;
      }
    });
  }, [activeFrames, releaseId]);

  // Sequential playback loop across frames of the selected day
  useEffect(() => {
    if (!isPlaying || activeFrames.length <= 1) return;
    const intervalMs = speedMultiplier === 2 ? 450 : 850;
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => getNextEpicFrameIndex(prev, activeFrames.length, 1));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMultiplier, activeFrames.length]);

  // Switch Natural <-> Enhanced while keeping the exact same timestamp/identifier
  const handleSwitchCollection = (nextCollection: EpicCollection) => {
    if (nextCollection === collection || !activeSeries) return;
    const nextFrames = nextCollection === 'enhanced' ? activeSeries.enhanced : activeSeries.natural;
    if (nextFrames.length === 0) return;
    const syncedIdx = findSyncedEpicFrameIndex(nextFrames, currentFrame, safeIndex);
    onSelectCollection(nextCollection);
    setFrameIndex(syncedIdx);
  };

  const handleStep = (delta: number) => {
    if (activeFrames.length <= 1) return;
    setIsPlaying(false);
    setFrameIndex((prev) => getNextEpicFrameIndex(prev, activeFrames.length, delta));
  };

  const isLatestDay = Boolean(
    activeSeries && epicSeries.length > 0 && activeSeries.dateKey === epicSeries[0].dateKey
  );

  // Isolated EPIC error state
  if (epicState.status === 'error' && epicSeries.length === 0) {
    return (
      <section id="earth" className="relative pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900/80 border border-rose-900/50 p-10 text-center max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-serif-cosmic text-slate-100 mb-2">
              {t.earth.errorTitle}
            </h1>
            <p className="text-sm text-slate-400 mb-6">{t.earth.fallbackDesc}</p>
            <button
              type="button"
              onClick={onRetryEpic}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.earth.retryBtn}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!activeSeries || !currentFrame) {
    return null;
  }

  const resolved = resolveMedia(currentFrame, undefined, releaseId);
  const formattedDay = formatDateLocale(activeSeries.dateKey, lang);
  const utcTime = extractUtcTime(currentFrame.date);
  const attribution = getRecordAttribution(currentFrame);
  const dscovrDistKm = computeVectorDistanceKm(currentFrame.dscovrJ2000Position);
  const sunDistKm = computeVectorDistanceKm(currentFrame.sunJ2000Position);
  const lunarDistKm = computeVectorDistanceKm(currentFrame.lunarJ2000Position);
  const formatNum = (n: number) =>
    new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(n);
  const kmUnit = lang === 'ru' ? 'км' : 'km';

  return (
    <section id="earth" className="relative pt-4 sm:pt-6 pb-14 sm:pb-16 overflow-hidden">
      {/* Ambient orbital glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Intro */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300/90 mb-1.5 tracking-wide">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {isLatestDay
                ? t.earth.latestObservationBadge(formattedDay)
                : t.earth.selectedObservationBadge(formattedDay)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold font-serif-cosmic text-slate-100 tracking-tight leading-tight mb-2 [text-wrap:balance]">
            {t.earth.title}
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-300/90 font-light leading-relaxed max-w-2xl mx-auto">
            {t.earth.subtitle}
          </p>
        </div>

        {/* Main Interactive Earth Stage */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-900/85 via-[#050b18]/90 to-[#030611] border border-slate-800/90 shadow-2xl shadow-cyan-950/30 overflow-hidden">

          {/* Top Bar: Observation Date/Time + Natural/Enhanced Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/60">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-300 tabular-nums">
              <span className="inline-flex items-center gap-1.5 text-cyan-300">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formattedDay}</span>
              </span>
              {utcTime && (
                <span className="inline-flex items-center gap-1.5 text-slate-200" data-testid="earth-utc-time">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{utcTime}</span>
                </span>
              )}
              <span className="hidden sm:inline text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-400" data-testid="earth-frame-counter">
                {t.earth.frameCounter(safeIndex + 1, activeFrames.length)}
              </span>
            </div>

            {/* Natural / Enhanced Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div
                className="inline-flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs"
                role="group"
                aria-label="EPIC imagery mode"
              >
                <button
                  type="button"
                  disabled={!hasNatural}
                  onClick={() => handleSwitchCollection('natural')}
                  title={t.earth.naturalHint}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                    collection === 'natural'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.earth.naturalLabel}
                </button>
                <button
                  type="button"
                  disabled={!hasEnhanced}
                  onClick={() => handleSwitchCollection('enhanced')}
                  title={t.earth.enhancedHint}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                    collection === 'enhanced'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.earth.enhancedLabel}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onInspectFrame(currentFrame, activeFrames)}
                aria-label={t.earth.expandView}
                title={t.earth.expandView}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Earth Viewport */}
          <div className="relative bg-black flex items-center justify-center min-h-[290px] sm:min-h-[340px] lg:min-h-[365px] px-4 py-3 select-none">
            {resolved.displayUrl && !imgError ? (
              <img
                key={currentFrame.id}
                src={resolved.displayUrl}
                alt={t.earth.earthAlt(collection, formattedDay, utcTime)}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="max-h-[290px] sm:max-h-[340px] lg:max-h-[355px] w-auto object-contain transition-opacity duration-300"
                loading="eager"
              />
            ) : (
              <div className="p-8 text-center max-w-md space-y-3">
                <Globe className="w-12 h-12 text-slate-600 mx-auto" />
                <h2 className="text-base font-semibold text-slate-200">{t.earth.fallbackTitle}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{t.earth.fallbackDesc}</p>
                <a
                  href={currentFrame.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium"
                >
                  <span>{t.earth.sourceLinkLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Side Prev / Next Overlay Controls on Desktop */}
            {activeFrames.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  aria-label={t.earth.prevFrame}
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-400/60 items-center justify-center text-slate-200 hover:text-cyan-300 backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  aria-label={t.earth.nextFrame}
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-400/60 items-center justify-center text-slate-200 hover:text-cyan-300 backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Subtle mode hint + credit at bottom corners of black viewport */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400/90 pointer-events-none">
              <span className="hidden sm:inline">
                {collection === 'enhanced' ? t.earth.enhancedHint : t.earth.naturalHint}
              </span>
              <span className="ml-auto font-mono text-slate-400">{attribution}</span>
            </div>
          </div>

          {/* Interactive Playback & Timeline Controls */}
          <div className="px-4 sm:px-6 py-4 border-t border-slate-800/80 bg-slate-950/70 space-y-4">
            {activeFrames.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Playback Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    aria-label={t.earth.prevFrame}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap min-w-[136px]"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? t.earth.pauseLabel : t.earth.playLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    aria-label={t.earth.nextFrame}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : 1))}
                    aria-label={`${t.earth.speedLabel}: ${speedMultiplier}x`}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer tabular-nums"
                  >
                    {speedMultiplier}×
                  </button>
                </div>

                {/* Scrubber Slider */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                    {activeSeries.startUtc?.slice(0, 5) || '00:00'}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={activeFrames.length - 1}
                    value={safeIndex}
                    aria-label={t.earth.frameCounter(safeIndex + 1, activeFrames.length)}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setFrameIndex(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                    {activeSeries.endUtc?.slice(0, 5) || '23:59'}
                  </span>
                </div>
              </div>
            )}

            {/* Horizontal Date Strip */}
            <div className="pt-3 border-t border-slate-800/70">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs text-slate-400 font-medium">
                  {t.earth.dateStripLabel}
                </span>
                <a
                  href={currentFrame.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap"
                >
                  <span>{t.earth.sourceLinkLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div
                className="flex items-center gap-2 overflow-x-auto pb-1"
                role="tablist"
                aria-label={t.earth.dateStripLabel}
              >
                {epicSeries.map((series) => {
                  const isSelected = series.dateKey === activeSeries.dateKey;
                  return (
                    <button
                      key={series.dateKey}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => onSelectDateKey(series.dateKey)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer shrink-0 tabular-nums ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/70 text-cyan-100 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold whitespace-nowrap">
                        {formatShortDate(series.dateKey, lang)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        {t.earth.framesShort(series.frameCount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Scientific Observation Parameters (non-intrusive) */}
            <div className="pt-2 border-t border-slate-800/70">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                aria-expanded={showDetails}
                className="w-full flex items-center justify-between gap-2 py-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400/90 shrink-0" />
                  <span>{t.earth.detailsToggle}</span>
                </span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDetails && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs tabular-nums">
                  {currentFrame.centroidCoordinates && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">{t.earth.centroidLabel}</div>
                      <div className="font-mono text-slate-100">
                        {currentFrame.centroidCoordinates.lat.toFixed(2)}° /{' '}
                        {currentFrame.centroidCoordinates.lon.toFixed(2)}°
                      </div>
                    </div>
                  )}

                  {dscovrDistKm && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">{t.earth.dscovrDistanceLabel}</div>
                      <div className="font-mono text-slate-100">{formatNum(dscovrDistKm)} {kmUnit}</div>
                    </div>
                  )}

                  {sunDistKm && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">{t.earth.sunDistanceLabel}</div>
                      <div className="font-mono text-slate-100">{formatNum(sunDistKm)} {kmUnit}</div>
                    </div>
                  )}

                  {lunarDistKm && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">{t.earth.lunarDistanceLabel}</div>
                      <div className="font-mono text-slate-100">{formatNum(lunarDistKm)} {kmUnit}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
