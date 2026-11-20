/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  DataManifest,
  EpicCollection,
  EpicDataState,
  Language,
  ObservatoryRecord,
  ObservatorySource,
  SourceDataState
} from './types/dataContract';
import {
  buildEpicDaySeries,
  extractDateKey,
  loadObservatoryRelease,
  loadSourceIndex
} from './services/dataLoader';
import { translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { EarthObservatory } from './components/EarthObservatory';
import { ApodStoriesSection } from './components/ApodStoriesSection';
import { ObservatoryArchive } from './components/ObservatoryArchive';
import { Footer } from './components/Footer';
import { PublicationDetailModal } from './components/PublicationDetailModal';
import { Telescope, AlertCircle, RefreshCw } from 'lucide-react';

const EMPTY_SOURCE: SourceDataState = {
  status: 'idle',
  items: [],
  safeStubs: [],
  generatedAt: null,
  error: null
};

const EMPTY_EPIC: EpicDataState = {
  ...EMPTY_SOURCE,
  natural: EMPTY_SOURCE,
  enhanced: EMPTY_SOURCE
};

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [manifest, setManifest] = useState<DataManifest | null>(null);
  const [apodState, setApodState] = useState<SourceDataState>(EMPTY_SOURCE);
  const [epicState, setEpicState] = useState<EpicDataState>(EMPTY_EPIC);
  const [libraryState, setLibraryState] = useState<SourceDataState>(EMPTY_SOURCE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('earth');

  const [selectedEpicDate, setSelectedEpicDate] = useState<string>('');
  const [epicCollection, setEpicCollection] = useState<EpicCollection>('natural');

  const [selectedPublication, setSelectedPublication] = useState<ObservatoryRecord | null>(null);
  const [modalContextList, setModalContextList] = useState<ObservatoryRecord[]>([]);

  // Load manifest + independent source indexes with immutable in-memory fallback
  const initData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshWarning(null);
      const { bundle, refreshWarning: warn } = await loadObservatoryRelease();
      setManifest(bundle.manifest);
      setApodState(bundle.apod);
      setEpicState(bundle.epic);
      setLibraryState(bundle.library);
      setRefreshWarning(warn);
    } catch (err: unknown) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unable to load observatory archive');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  // Group EPIC Natural & Enhanced frames by observation date (newest first)
  const epicSeries = useMemo(
    () => buildEpicDaySeries(epicState.natural.items, epicState.enhanced.items),
    [epicState.natural.items, epicState.enhanced.items]
  );

  // Default to the latest available EPIC observation day
  useEffect(() => {
    if (epicSeries.length > 0) {
      const exists = epicSeries.some((s) => s.dateKey === selectedEpicDate);
      if (!selectedEpicDate || !exists) {
        setSelectedEpicDate(epicSeries[0].dateKey);
      }
    }
  }, [epicSeries, selectedEpicDate]);

  // Expose silent developer diagnostics outside visible visitor UI
  useEffect(() => {
    if (!manifest) return;
    (window as unknown as Record<string, unknown>).__OBSERVATORY_DIAGNOSTICS__ = {
      releaseId: manifest.releaseId,
      schemaVersion: manifest.schemaVersion,
      generatedAt: manifest.generatedAt,
      sources: {
        apod: {
          status: apodState.status,
          items: apodState.items.length,
          safeStubs: apodState.safeStubs.length,
          error: apodState.error
        },
        epic: {
          status: epicState.status,
          days: epicSeries.length,
          natural: epicState.natural.items.length,
          enhanced: epicState.enhanced.items.length,
          error: epicState.error
        },
        library: {
          status: libraryState.status,
          items: libraryState.items.length,
          error: libraryState.error
        }
      }
    };
  }, [manifest, apodState, epicState, epicSeries.length, libraryState]);

  // Isolated retry for a single failed source index
  const handleRetrySource = useCallback(
    async (source: ObservatorySource) => {
      if (!manifest) {
        initData();
        return;
      }

      if (source === 'apod') {
        try {
          const next = await loadSourceIndex(manifest, 'apod');
          setApodState(next);
        } catch (err: unknown) {
          setApodState({
            status: 'error',
            items: [],
            safeStubs: [],
            generatedAt: null,
            error: err instanceof Error ? err.message : 'Failed to load APOD index'
          });
        }
        return;
      }

      if (source === 'library') {
        try {
          const next = await loadSourceIndex(manifest, 'library');
          setLibraryState(next);
        } catch (err: unknown) {
          setLibraryState({
            status: 'error',
            items: [],
            safeStubs: [],
            generatedAt: null,
            error: err instanceof Error ? err.message : 'Failed to load Library index'
          });
        }
        return;
      }

      if (source === 'epic') {
        const hasCollections = Boolean(
          manifest.sources.epic.collections?.natural && manifest.sources.epic.collections?.enhanced
        );
        const [natRes, enhRes] = await Promise.allSettled([
          loadSourceIndex(manifest, 'epic', undefined, hasCollections ? 'natural' : undefined),
          hasCollections
            ? loadSourceIndex(manifest, 'epic', undefined, 'enhanced')
            : Promise.resolve<SourceDataState>({
                status: 'loaded',
                items: [],
                safeStubs: [],
                generatedAt: null,
                error: null
              })
        ]);

        const natural: SourceDataState =
          natRes.status === 'fulfilled'
            ? natRes.value
            : {
                status: 'error',
                items: [],
                safeStubs: [],
                generatedAt: null,
                error: natRes.reason instanceof Error ? natRes.reason.message : String(natRes.reason)
              };

        const enhanced: SourceDataState =
          enhRes.status === 'fulfilled'
            ? enhRes.value
            : {
                status: 'error',
                items: [],
                safeStubs: [],
                generatedAt: null,
                error: enhRes.reason instanceof Error ? enhRes.reason.message : String(enhRes.reason)
              };

        const items = [...natural.items, ...enhanced.items].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        const errs = [natural.error, enhanced.error].filter(Boolean);

        setEpicState({
          status: natural.status === 'loaded' || enhanced.status === 'loaded' ? 'loaded' : 'error',
          items,
          safeStubs: [...natural.safeStubs, ...enhanced.safeStubs],
          generatedAt: natural.generatedAt || enhanced.generatedAt,
          error: errs.length > 0 ? errs.join(' | ') : null,
          natural,
          enhanced
        });
      }
    },
    [manifest, initData]
  );

  const allPublications = useMemo(
    () => [...apodState.items, ...epicState.items, ...libraryState.items],
    [apodState.items, epicState.items, libraryState.items]
  );

  // URL hash deep linking (e.g. #apod:2026-09-05, #apod-2026-09-05)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      if (!hash || ['earth', 'stories', 'archive', 'about'].includes(hash)) return;
      const normalized = hash.replace(/^apod-/, 'apod:');
      const found = allPublications.find(
        (p) =>
          p.id === hash ||
          p.id === normalized ||
          extractDateKey(p.date) === hash ||
          extractDateKey(p.date) === hash.replace(/^apod[-:]/, '')
      );
      if (found) {
        setSelectedPublication(found);
        setModalContextList(found.source === 'apod' ? apodState.items : [found]);
      }
    };

    if (allPublications.length > 0) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allPublications, apodState.items]);

  // Keep Navbar active indicator synced as visitor scrolls through sections
  useEffect(() => {
    if (loading || error || typeof IntersectionObserver === 'undefined') return;
    const sectionIds = ['earth', 'stories', 'archive', 'about'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, error]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenEpicSeries = (dateKey: string, collection: EpicCollection) => {
    setSelectedEpicDate(dateKey);
    setEpicCollection(collection);
    handleNavigate('earth');
  };

  const handleOpenModal = (record: ObservatoryRecord, list: ObservatoryRecord[]) => {
    setSelectedPublication(record);
    setModalContextList(list.length > 0 ? list : [record]);
  };

  const t = translations[lang];

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030611] text-white flex flex-col items-center justify-center p-6 cosmic-stars-backdrop">
        <div className="relative w-20 h-20 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-950">
          <Telescope className="w-10 h-10 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-ping" />
        </div>
        <h2 className="text-xl font-serif-cosmic font-bold text-slate-100 tracking-wider mb-2 text-center">
          {t.appName}
        </h2>
        <p className="text-xs font-mono text-cyan-300">{t.loadingText}</p>
      </div>
    );
  }

  // Fatal Load Error (only when no cached observation data is available)
  if (error) {
    return (
      <div className="min-h-screen bg-[#030611] text-white flex flex-col items-center justify-center p-6 cosmic-stars-backdrop">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-900/60 shadow-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold font-serif-cosmic text-slate-100">
            {t.loadErrorTitle}
          </h2>
          <button
            type="button"
            onClick={initData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.loadErrorRetry}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 cosmic-stars-backdrop flex flex-col selection:bg-cyan-500 selection:text-slate-950">

      {/* Clean Observatory Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Non-blocking notice if refresh failed while previous data remains active */}
      {refreshWarning && (
        <div className="bg-amber-950/60 border-b border-amber-700/40 px-4 py-2 text-center text-xs text-amber-200 font-mono">
          {t.refreshNotice}
        </div>
      )}

      <main className="flex-1">

        {/* Primary Interactive Experience: Earth from Space (DSCOVR EPIC) */}
        <EarthObservatory
          epicSeries={epicSeries}
          epicState={epicState}
          selectedDateKey={selectedEpicDate}
          onSelectDateKey={setSelectedEpicDate}
          collection={epicCollection}
          onSelectCollection={setEpicCollection}
          releaseId={manifest?.releaseId}
          lang={lang}
          onInspectFrame={(frame, seriesFrames) => handleOpenModal(frame, seriesFrames)}
          onRetryEpic={() => handleRetrySource('epic')}
        />

        {/* Editorial Space Stories (APOD) */}
        <ApodStoriesSection
          apodState={apodState}
          releaseId={manifest?.releaseId}
          lang={lang}
          onOpenStory={(story) => handleOpenModal(story, apodState.items)}
          onRetryApod={() => handleRetrySource('apod')}
        />

        {/* Simplified Archive: EPIC by Date Series, APOD Stories, NASA Library */}
        <ObservatoryArchive
          epicSeries={epicSeries}
          epicState={epicState}
          apodState={apodState}
          libraryState={libraryState}
          releaseId={manifest?.releaseId}
          lang={lang}
          onOpenEpicSeries={handleOpenEpicSeries}
          onSelectRecord={(rec, list) => handleOpenModal(rec, list)}
          onRetrySource={handleRetrySource}
        />

      </main>

      {/* Clean Independent Observatory Footer */}
      <Footer lang={lang} />

      {/* Focused Detail Modal */}
      {selectedPublication && (
        <PublicationDetailModal
          publication={selectedPublication}
          publications={modalContextList}
          releaseId={manifest?.releaseId}
          lang={lang}
          onClose={() => {
            setSelectedPublication(null);
            if (window.location.hash.length > 1) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onNavigatePublication={(pub) => setSelectedPublication(pub)}
        />
      )}

    </div>
  );
}
