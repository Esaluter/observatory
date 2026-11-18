/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { DataManifest, ApodRecord, Language, FilterState } from './types/dataContract';
import { loadManifest, loadApodIndex, filterPublications } from './services/dataLoader';
import { Navbar } from './components/Navbar';
import { HeroFeatured } from './components/HeroFeatured';
import { ApodGallery } from './components/ApodGallery';
import { CalendarView } from './components/CalendarView';
import { ComingSoonSection } from './components/ComingSoonSection';
import { Footer } from './components/Footer';
import { PublicationDetailModal } from './components/PublicationDetailModal';
import { Telescope, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [manifest, setManifest] = useState<DataManifest | null>(null);
  const [publications, setPublications] = useState<ApodRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedPublication, setSelectedPublication] = useState<ApodRecord | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    mediaType: 'all',
    rightsFilter: 'all',
    selectedDate: undefined,
    selectedMonth: undefined
  });

  // Fetch manifest and APOD archive
  const initData = async () => {
    try {
      setLoading(true);
      setError(null);
      const m = await loadManifest();
      setManifest(m);
      const pubs = await loadApodIndex(m);
      setPublications(pubs);
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError(err?.message || 'Unknown error while loading data archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // Handle URL hash changes for deep linking (e.g. #apod-2026-09-05 or #2026-09-05)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const targetDate = hash.replace('apod-', '').replace('apod:', '');
        const found = publications.find(p => p.id === hash || p.id === `apod:${targetDate}` || p.date === targetDate);
        if (found) {
          setSelectedPublication(found);
        }
      }
    };

    if (publications.length > 0) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [publications]);

  const handleToggleLang = () => {
    setLang(prev => (prev === 'ru' ? 'en' : 'ru'));
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find featured publication: prioritize confirmed local public domain asset (2026-09-05), or newest
  const featuredPublication = useMemo(() => {
    if (publications.length === 0) return null;
    const confirmed = publications.find(p => p.mediaStorageStatus === 'local_public');
    return confirmed || publications[0];
  }, [publications]);

  // Filtered publications
  const filteredPublications = useMemo(() => {
    return filterPublications(publications, filters);
  }, [publications, filters]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030611] text-white flex flex-col items-center justify-center p-6 cosmic-stars-backdrop">
        <div className="relative w-20 h-20 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-950">
          <Telescope className="w-10 h-10 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-ping" />
        </div>
        <h2 className="text-xl font-serif-cosmic font-bold text-slate-100 tracking-wider mb-2">
          ЕНОТКОРП — NASA Observatory
        </h2>
        <p className="text-xs font-mono text-cyan-300">
          {lang === 'ru' ? 'Синхронизация с NASA Collector...' : 'Synchronizing with NASA Collector...'}
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#030611] text-white flex flex-col items-center justify-center p-6 cosmic-stars-backdrop">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-900/60 shadow-2xl text-center">
          <AlertCircle className="w-14 h-14 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-serif-cosmic text-slate-100 mb-2">
            {lang === 'ru' ? 'Ошибка загрузки архива' : 'Archive Load Error'}
          </h2>
          <p className="text-xs font-mono text-rose-300/80 mb-6 bg-rose-950/40 p-3 rounded-xl border border-rose-900/40">
            {error}
          </p>
          <button
            onClick={initData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Повторить попытку' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 cosmic-stars-backdrop flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Sticky Atmospheric Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        manifest={manifest}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        
        {/* Grand Hero Section with Featured APOD (Verified local public domain asset 2026-09-05) */}
        {featuredPublication && (
          <HeroFeatured
            publication={featuredPublication}
            lang={lang}
            manifest={manifest}
            onOpenDetail={(pub) => setSelectedPublication(pub)}
            onScrollToArchive={() => handleNavigate('gallery')}
          />
        )}

        {/* APOD Gallery with Multi-Filter System (All 66 Records) */}
        <ApodGallery
          publications={publications}
          filteredPublications={filteredPublications}
          filters={filters}
          onFilterChange={handleFilterChange}
          lang={lang}
          onSelectPublication={(pub) => setSelectedPublication(pub)}
        />

        {/* Astronomical Chronology Calendar */}
        <CalendarView
          publications={publications}
          lang={lang}
          onSelectPublication={(pub) => setSelectedPublication(pub)}
          onFilterByDate={(dateStr) => {
            handleFilterChange({ selectedDate: dateStr });
            handleNavigate('gallery');
          }}
        />

        {/* Exploration Frontiers (EPIC, Library, Lab) */}
        <ComingSoonSection lang={lang} />

      </main>

      {/* Footer with Legal & Architecture Status */}
      <Footer lang={lang} manifest={manifest} />

      {/* Publication Detail Modal */}
      {selectedPublication && (
        <PublicationDetailModal
          publication={selectedPublication}
          publications={publications}
          lang={lang}
          onClose={() => {
            setSelectedPublication(null);
            // clear hash if present
            if (window.location.hash.startsWith('#apod') || window.location.hash.length > 1) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onNavigatePublication={(pub) => setSelectedPublication(pub)}
        />
      )}

    </div>
  );
}
