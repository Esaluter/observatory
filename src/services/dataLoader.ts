import { ApodRecord, DataManifest, FilterState, Language } from '../types/dataContract';

/**
 * Resolves the base URL for public static data, supporting GitHub Pages subdirectory deployments.
 */
export function getBaseUrl(): string {
  const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Loads the manifest.json with a timestamp query param to prevent stale browser caching.
 */
export async function loadManifest(customBaseUrl?: string): Promise<DataManifest> {
  const base = customBaseUrl ?? getBaseUrl();
  const manifestUrl = `${base}data/manifest.json?_t=${Date.now()}`;
  
  const response = await fetch(manifestUrl, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-cache'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${response.status} ${response.statusText}`);
  }
  
  const manifest = (await response.json()) as DataManifest;
  
  if (!manifest || typeof manifest.schemaVersion !== 'number' || !manifest.sources || !manifest.sources.apod) {
    throw new Error('Invalid manifest.json structure: missing schemaVersion or sources.apod');
  }
  
  return manifest;
}

/**
 * Loads the APOD index based on the path specified in the manifest.
 * Index file contains { schemaVersion: 1, source: "apod", generatedAt: "...", items: [...] }
 */
export async function loadApodIndex(manifest: DataManifest, customBaseUrl?: string): Promise<ApodRecord[]> {
  const base = customBaseUrl ?? getBaseUrl();
  const rawPath = manifest.sources.apod.index || 'apod/index.json';
  
  // Per data-contract.md: index path stays inside the data directory
  const cleanPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  const url = cleanPath.startsWith('data/') ? `${base}${cleanPath}` : `${base}data/${cleanPath}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to load APOD archive from ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : data.items;
  
  if (!Array.isArray(items)) {
    throw new Error('APOD index items is not an array');
  }

  return items as ApodRecord[];
}

export interface ResolvedMedia {
  displayUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  isVideo: boolean;
  isAllowedLocally: boolean;
  status: 'allowed_local' | 'allowed_remote' | 'review_required' | 'video_embed';
  explanationText: string;
}

/**
 * Evaluates media storage status and legal authorization to resolve displayable media URL.
 * Strictly adheres to data-contract.md:
 * - localMediaUrl is used when mediaStorageStatus === "local_public"
 * - Videos return embedUrl for responsive iframe rendering
 * - Remote mediaUrl is used as permitted external source
 * - Fallbacks preserve sourceUrl link to NASA canonical page
 */
export function resolveMedia(pub: ApodRecord, customBaseUrl?: string): ResolvedMedia {
  const base = customBaseUrl ?? getBaseUrl();

  const isVideo = pub.mediaType === 'video' || pub.mediaType === 'iframe';
  if (isVideo) {
    let embed: string | null = null;
    if (pub.mediaUrl) {
      if (pub.mediaUrl.includes('youtube.com/watch?v=')) {
        embed = pub.mediaUrl.replace('watch?v=', 'embed/');
      } else if (pub.mediaUrl.includes('youtu.be/')) {
        const id = pub.mediaUrl.split('youtu.be/')[1]?.split('?')[0];
        embed = id ? `https://www.youtube.com/embed/${id}` : pub.mediaUrl;
      } else {
        embed = pub.mediaUrl;
      }
    }
    return {
      displayUrl: pub.thumbnailUrl || null,
      embedUrl: embed,
      thumbnailUrl: pub.thumbnailUrl || null,
      isVideo: true,
      isAllowedLocally: false,
      status: 'video_embed',
      explanationText: pub.rightsStatus === 'nasa_public_domain' ? 'NASA Public Domain Video' : 'Video publication'
    };
  }

  // 1. Confirmed local public asset (e.g. 2026-09-05.jpg)
  if (pub.mediaStorageStatus === 'local_public' && pub.localMediaUrl) {
    const cleanLocal = pub.localMediaUrl.startsWith('/') ? pub.localMediaUrl.slice(1) : pub.localMediaUrl;
    return {
      displayUrl: `${base}${cleanLocal}`,
      embedUrl: null,
      thumbnailUrl: pub.thumbnailUrl || null,
      isVideo: false,
      isAllowedLocally: true,
      status: 'allowed_local',
      explanationText: 'Confirmed Local NASA Public Domain Asset'
    };
  }

  // 2. NASA Public Domain Remote
  if (pub.rightsStatus === 'nasa_public_domain' && pub.mediaUrl) {
    return {
      displayUrl: pub.mediaUrl,
      embedUrl: null,
      thumbnailUrl: pub.thumbnailUrl || null,
      isVideo: false,
      isAllowedLocally: false,
      status: 'allowed_remote',
      explanationText: 'NASA Public Domain (External Source)'
    };
  }

  // 3. Review required / external only with original source
  if (pub.mediaUrl) {
    return {
      displayUrl: pub.mediaUrl,
      embedUrl: null,
      thumbnailUrl: pub.thumbnailUrl || null,
      isVideo: false,
      isAllowedLocally: false,
      status: 'review_required',
      explanationText: pub.credits ? `Credits: ${pub.credits}` : 'Review required / Editorial citation'
    };
  }

  return {
    displayUrl: null,
    embedUrl: null,
    thumbnailUrl: null,
    isVideo: false,
    isAllowedLocally: false,
    status: 'review_required',
    explanationText: 'No direct media available'
  };
}

/**
 * Filter publications by search term, media type, date, or rights status
 */
export function filterPublications(
  pubs: ApodRecord[],
  filters: FilterState
): ApodRecord[] {
  return pubs.filter(pub => {
    // Search filter in title, description, credits, copyright, date
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const inTitle = pub.title.toLowerCase().includes(q);
      const inDesc = pub.description.toLowerCase().includes(q);
      const inCredits = pub.credits ? pub.credits.toLowerCase().includes(q) : false;
      const inCopyright = pub.copyright ? pub.copyright.toLowerCase().includes(q) : false;
      const inDate = pub.date.includes(q);

      if (!inTitle && !inDesc && !inCredits && !inCopyright && !inDate) {
        return false;
      }
    }

    // Media type filter
    if (filters.mediaType !== 'all') {
      if (filters.mediaType === 'video') {
        if (pub.mediaType !== 'video' && pub.mediaType !== 'iframe') return false;
      } else if (filters.mediaType === 'image') {
        if (pub.mediaType !== 'image') return false;
      }
    }

    // Rights filter
    if (filters.rightsFilter === 'nasa_public_domain') {
      if (pub.rightsStatus !== 'nasa_public_domain') return false;
    } else if (filters.rightsFilter === 'review_required') {
      if (pub.rightsStatus !== 'review_required') return false;
    }

    // Selected single date
    if (filters.selectedDate) {
      if (pub.date !== filters.selectedDate) return false;
    }

    // Selected Month (YYYY-MM)
    if (filters.selectedMonth) {
      if (!pub.date.startsWith(filters.selectedMonth)) return false;
    }

    return true;
  });
}

/**
 * Aggregates all unique months present in the dataset with count of publications
 */
export function getAvailableMonths(pubs: ApodRecord[], lang: Language = 'ru') {
  const map = new Map<string, number>();
  for (const pub of pubs) {
    const ym = pub.date.slice(0, 7); // "YYYY-MM"
    map.set(ym, (map.get(ym) || 0) + 1);
  }

  const result: { ym: string; year: number; month: number; label: string; count: number }[] = [];
  const monthNamesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const sortedKeys = Array.from(map.keys()).sort().reverse();
  for (const ym of sortedKeys) {
    const [yStr, mStr] = ym.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const mName = lang === 'ru' ? monthNamesRu[month - 1] : monthNamesEn[month - 1];
    result.push({
      ym,
      year,
      month,
      label: `${mName} ${year}`,
      count: map.get(ym) || 0
    });
  }
  return result;
}

/**
 * Formats YYYY-MM-DD into localized date string
 */
export function formatDateLocale(dateStr: string, lang: Language = 'ru'): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  } catch {
    return dateStr;
  }
}
