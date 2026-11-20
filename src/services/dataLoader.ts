import {
  AiSummaryBlock,
  CardType,
  DataManifest,
  EpicCollection,
  EpicDataState,
  FilterState,
  Language,
  ObservatoryRecord,
  ObservatoryReleaseBundle,
  ObservatorySource,
  SafeStub,
  SourceDataState,
  SourceIndexFile
} from '../types/dataContract';

/**
 * In-memory cache of the last successfully loaded immutable release (Handoff §9.7).
 */
let lastValidReleaseBundle: ObservatoryReleaseBundle | null = null;

export function getLastValidReleaseBundle(): ObservatoryReleaseBundle | null {
  return lastValidReleaseBundle;
}

export function clearLastValidReleaseBundle(): void {
  lastValidReleaseBundle = null;
}

/**
 * Resolves the base URL for public static data, supporting root and non-root Vite `base` deployments.
 */
export function getBaseUrl(): string {
  const base =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function normalizeBaseUrl(customBaseUrl?: string): string {
  const base = customBaseUrl ?? getBaseUrl();
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Validates that a manifest/index/media relative path is safe (Handoff §10):
 * - Rejects empty paths, backslashes, `..` traversal segments, and absolute URLs/schemes.
 * - When `expectedReleaseId` is provided and path targets `releases/<id>/...`, rejects foreign release IDs.
 */
export function isSafeRelativePath(rawPath: string | null | undefined, expectedReleaseId?: string): boolean {
  if (!rawPath || typeof rawPath !== 'string') return false;
  const trimmed = rawPath.trim();
  if (!trimmed) return false;

  // Reject backslashes, URL schemes, protocol-relative URLs, null bytes
  if (
    trimmed.includes('\\') ||
    trimmed.includes('\0') ||
    trimmed.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return false;
  }

  const normalized = trimmed.replace(/^\/+/, '');
  const segments = normalized.split('/');
  if (segments.some(seg => seg === '..' || seg === '.')) {
    return false;
  }

  if (expectedReleaseId) {
    const releaseMatch = normalized.match(/^(?:data\/)?releases\/([^/]+)\//);
    if (releaseMatch && releaseMatch[1] !== expectedReleaseId) {
      return false;
    }
  }

  return true;
}

/**
 * Resolves an index path from `manifest.sources.*` relative to `<Vite base>data/`.
 * Rejects unsafe paths or foreign release IDs.
 */
export function resolveIndexUrl(
  rawIndexPath: string,
  expectedReleaseId?: string,
  customBaseUrl?: string
): string {
  if (!isSafeRelativePath(rawIndexPath, expectedReleaseId)) {
    throw new Error(`Rejected unsafe index path: ${rawIndexPath}`);
  }
  const base = normalizeBaseUrl(customBaseUrl);
  const cleanPath = rawIndexPath.replace(/^\/+/, '');
  return cleanPath.startsWith('data/') ? `${base}${cleanPath}` : `${base}data/${cleanPath}`;
}

/**
 * Resolves `localMediaUrl` relative to Vite `base` (Handoff §4).
 * Note: `localMediaUrl` already includes `data/releases/<releaseId>/...` in Sprint 009+ releases.
 */
export function resolveLocalMediaUrl(
  localMediaUrl: string | null | undefined,
  expectedReleaseId?: string,
  customBaseUrl?: string
): string | null {
  if (!localMediaUrl) return null;
  if (!isSafeRelativePath(localMediaUrl, expectedReleaseId)) {
    return null;
  }
  const base = normalizeBaseUrl(customBaseUrl);
  const cleanLocal = localMediaUrl.replace(/^\/+/, '');
  return `${base}${cleanLocal}`;
}

/**
 * Returns the canonical cardType, defaulting safely for backward compatibility.
 */
export function getEffectiveCardType(record: ObservatoryRecord): CardType {
  if (
    record.cardType === 'full' ||
    record.cardType === 'media_only' ||
    record.cardType === 'text_ai_summary' ||
    record.cardType === 'text_source' ||
    record.cardType === 'source_link'
  ) {
    return record.cardType;
  }
  return 'full';
}

/**
 * Evaluates component-level publication rights per Handoff §3, §6, §10.
 * Never relies solely on legacy `rightsStatus` when component rights or `publicationStatus` exist.
 */
export function isPublishableRecord(record: ObservatoryRecord): boolean {
  if (!record || !record.id || !record.sourceUrl) return false;
  const cardType = getEffectiveCardType(record);
  if (cardType === 'source_link') {
    return record.publicationStatus === 'published' || record.publicationStatus === 'approved';
  }
  if (record.publicationStatus === 'restricted' || record.rightsStatus === 'restricted') {
    return false;
  }
  if (
    record.publicationStatus &&
    record.publicationStatus !== 'approved' &&
    record.publicationStatus !== 'published'
  ) {
    return false;
  }

  if (cardType === 'text_ai_summary') {
    return canRenderAiSummary(record);
  }
  if (cardType === 'text_source') {
    return canRenderSourceText(record);
  }
  if (cardType === 'media_only') {
    return canRenderMedia(record);
  }
  // Full card requires approved media or legacy backward-compatible record without component rights
  return canRenderMedia(record) || canRenderSourceText(record);
}

export function canRenderMedia(record: ObservatoryRecord): boolean {
  const cardType = getEffectiveCardType(record);
  if (
    cardType === 'text_ai_summary' ||
    cardType === 'text_source' ||
    cardType === 'source_link' ||
    record.mediaType === 'none'
  ) {
    return false;
  }
  if (record.publicationStatus === 'restricted' || record.rightsStatus === 'restricted') {
    return false;
  }
  if (record.rights?.media) {
    return record.rights.media.status === 'approved';
  }
  // Backward compatibility for legacy records without component rights object
  return record.mediaStorageStatus === 'local_public' || record.rightsStatus === 'nasa_public_domain';
}

export function canRenderSourceText(record: ObservatoryRecord): boolean {
  const cardType = getEffectiveCardType(record);
  if (cardType !== 'full' && cardType !== 'text_source') {
    return false;
  }
  if (record.publicationStatus === 'restricted' || record.rightsStatus === 'restricted') {
    return false;
  }
  if (record.rights?.text) {
    return record.rights.text.status === 'approved';
  }
  return true;
}

export function canRenderAiSummary(record: ObservatoryRecord): boolean {
  if (!record.aiSummary || !record.aiSummary.body) return false;
  if (record.publicationStatus === 'restricted' || record.rightsStatus === 'restricted') {
    return false;
  }
  if (record.aiSummary.reviewStatus && record.aiSummary.reviewStatus !== 'approved') {
    return false;
  }
  if (record.rights?.aiSummary) {
    return record.rights.aiSummary.status === 'approved';
  }
  return record.aiSummary.reviewStatus === 'approved';
}

export function getLocalizedDisclosure(aiSummary: AiSummaryBlock | null | undefined, lang: Language): string {
  if (!aiSummary?.disclosure) {
    return lang === 'ru'
      ? 'Объяснение подготовлено с помощью ИИ на основе научных источников. Не является официальным переводом NASA.'
      : 'Explanation prepared with AI assistance using scientific sources. This is not an official NASA translation.';
  }
  return (
    aiSummary.disclosure[lang] ||
    aiSummary.disclosure.en ||
    aiSummary.disclosure.ru ||
    ''
  );
}

export function getRecordAttribution(record: ObservatoryRecord): string {
  return (
    record.attribution ||
    record.rights?.media?.attribution ||
    record.rights?.text?.attribution ||
    record.credits ||
    record.copyright ||
    'NASA'
  );
}

export interface ResolvedMedia {
  displayUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  isVideo: boolean;
  isDirectVideo: boolean;
  isAllowedLocally: boolean;
  isMediaApproved: boolean;
  isArtisticPlaceholder: boolean;
  status:
    | 'allowed_local'
    | 'allowed_remote'
    | 'video_direct'
    | 'video_embed'
    | 'missing_local_media'
    | 'media_not_approved'
    | 'text_only'
    | 'artistic_placeholder';
  explanationText: string;
}

const PLACEHOLDER_RULES: Array<{ kind: string; pattern: RegExp }> = [
  { kind: 'blackhole', pattern: /black\s*hole|ч[её]рн\w*\s+дыр/i },
  { kind: 'comet', pattern: /comet|asteroid|комет|астероид/i },
  { kind: 'eclipse', pattern: /eclipse|затмен/i },
  { kind: 'supernova', pattern: /supernova|сверхнов|nova\b/i },
  { kind: 'nebula', pattern: /nebula|туманност/i },
  { kind: 'galaxy', pattern: /galaxy|galactic|milky\s+way|галактик|млечн/i },
  { kind: 'planet', pattern: /planet|\bmoon\b|\bmars\b|jupiter|saturn|venus|mercury|планет|лун|марс|юпитер|сатурн|венер|меркур/i },
  { kind: 'observatory', pattern: /observatory|telescope|обсерватор|телескоп/i },
  { kind: 'stars', pattern: /\bstars?\b|stellar|constellation|зв[её]зд|созвезди/i }
];

export function getArtisticPlaceholderKind(record: ObservatoryRecord): string {
  const searchable = [
    record.title,
    record.description,
    record.aiSummary?.title,
    record.aiSummary?.body
  ].filter(Boolean).join(' ');
  return PLACEHOLDER_RULES.find(rule => rule.pattern.test(searchable))?.kind || 'universe';
}

export function getArtisticPlaceholderUrl(
  record: ObservatoryRecord,
  customBaseUrl?: string
): string {
  const base = normalizeBaseUrl(customBaseUrl);
  return `${base}placeholders/placeholder_${getArtisticPlaceholderKind(record)}.png`;
}

function artisticPlaceholder(record: ObservatoryRecord, customBaseUrl?: string): ResolvedMedia {
  const url = getArtisticPlaceholderUrl(record, customBaseUrl);
  return {
    displayUrl: url,
    videoUrl: null,
    embedUrl: null,
    thumbnailUrl: url,
    isVideo: false,
    isDirectVideo: false,
    isAllowedLocally: true,
    isMediaApproved: false,
    isArtisticPlaceholder: true,
    status: 'artistic_placeholder',
    explanationText: 'Artistic illustration; original media remains available at the canonical NASA source'
  };
}

function isDirectVideoUrl(url: string): boolean {
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mov');
}

function toYouTubeEmbedUrl(url: string): string | null {
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('watch?v=')[1]?.split('&')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/')) {
    return url;
  }
  return null;
}

/**
 * Evaluates component-level rights and storage status to resolve safe displayable media.
 * Strictly adheres to GEMINI_INTEGRATION_HANDOFF.md §§3, 4, 6, 9.5, 9.6, 10:
 * - Never renders unapproved source media; safe artistic placeholders are separate local assets.
 * - Uses `localMediaUrl` when `mediaStorageStatus === 'local_public'`.
 * - Never falls back from a missing/invalid local approved file to an unreviewed remote URL.
 * - Supports direct HTML5 MP4 videos (`external_only` with approved media rights) and YouTube embeds.
 */
export function resolveMedia(
  pub: ObservatoryRecord,
  customBaseUrl?: string,
  expectedReleaseId?: string
): ResolvedMedia {
  const cardType = getEffectiveCardType(pub);

  if (cardType === 'text_ai_summary' || pub.mediaType === 'none') {
    return artisticPlaceholder(pub, customBaseUrl);
  }

  const mediaApproved = canRenderMedia(pub);
  if (!mediaApproved) {
    return artisticPlaceholder(pub, customBaseUrl);
  }

  const isVideo = pub.mediaType === 'video' || pub.mediaType === 'iframe';

  // Local approved media path (never falls back to remote URL if missing/unsafe — §9.6)
  if (pub.mediaStorageStatus === 'local_public') {
    const safeLocalUrl = resolveLocalMediaUrl(pub.localMediaUrl, expectedReleaseId, customBaseUrl);
    if (!safeLocalUrl) {
      return artisticPlaceholder(pub, customBaseUrl);
    }

    if (isVideo) {
      return {
        displayUrl: null,
        videoUrl: safeLocalUrl,
        embedUrl: null,
        thumbnailUrl: pub.thumbnailUrl || null,
        isVideo: true,
        isDirectVideo: true,
        isAllowedLocally: true,
        isMediaApproved: true,
        isArtisticPlaceholder: false,
        status: 'video_direct',
        explanationText: 'Approved local video asset'
      };
    }

    return {
      displayUrl: safeLocalUrl,
      videoUrl: null,
      embedUrl: null,
      thumbnailUrl: safeLocalUrl,
      isVideo: false,
      isDirectVideo: false,
      isAllowedLocally: true,
      isMediaApproved: true,
      isArtisticPlaceholder: false,
      status: 'allowed_local',
      explanationText: 'Verified local public release asset'
    };
  }

  // Approved external_only video (e.g. apod:2026-08-31 MP4 or YouTube embed)
  if (isVideo) {
    if (pub.mediaUrl && isDirectVideoUrl(pub.mediaUrl)) {
      return {
        displayUrl: pub.thumbnailUrl || null,
        videoUrl: pub.mediaUrl,
        embedUrl: null,
        thumbnailUrl: pub.thumbnailUrl || null,
        isVideo: true,
        isDirectVideo: true,
        isAllowedLocally: false,
        isMediaApproved: true,
        isArtisticPlaceholder: false,
        status: 'video_direct',
        explanationText: 'Approved NASA video publication (MP4)'
      };
    }

    const embed = pub.mediaUrl ? toYouTubeEmbedUrl(pub.mediaUrl) : null;
    if (!embed && !pub.thumbnailUrl) {
      return artisticPlaceholder(pub, customBaseUrl);
    }
    return {
      displayUrl: pub.thumbnailUrl || null,
      videoUrl: null,
      embedUrl: embed,
      thumbnailUrl: pub.thumbnailUrl || null,
      isVideo: true,
      isDirectVideo: false,
      isAllowedLocally: false,
      isMediaApproved: true,
      isArtisticPlaceholder: false,
      status: 'video_embed',
      explanationText: 'Approved NASA video publication'
    };
  }

  // Approved external_only image
  if (pub.mediaStorageStatus === 'external_only' && pub.mediaUrl) {
    return {
      displayUrl: pub.mediaUrl,
      videoUrl: null,
      embedUrl: null,
      thumbnailUrl: pub.thumbnailUrl || pub.mediaUrl,
      isVideo: false,
      isDirectVideo: false,
      isAllowedLocally: false,
      isMediaApproved: true,
      isArtisticPlaceholder: false,
      status: 'allowed_remote',
      explanationText: 'Approved external NASA media source'
    };
  }

  return artisticPlaceholder(pub, customBaseUrl);
}

/**
 * Validates manifest.json structure (Handoff §1, §9.2, §10).
 */
export function validateManifest(manifest: unknown): DataManifest {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Invalid manifest.json: expected JSON object');
  }
  const m = manifest as DataManifest;
  if (m.schemaVersion !== 1) {
    throw new Error(`Unsupported manifest schemaVersion: ${String(m.schemaVersion)}`);
  }
  if (!m.sources || !m.sources.apod || !m.sources.epic || !m.sources.library) {
    throw new Error('Invalid manifest.json: missing required sources descriptors (apod, epic, library)');
  }

  const releaseId = m.releaseId;
  const requiredPaths = [
    m.sources.apod.index,
    m.sources.epic.index,
    m.sources.library.index,
    m.sources.epic.collections?.natural,
    m.sources.epic.collections?.enhanced
  ].filter(Boolean) as string[];

  for (const p of requiredPaths) {
    if (!isSafeRelativePath(p, releaseId)) {
      throw new Error(`Invalid manifest.json: unsafe or foreign-release path "${p}"`);
    }
  }

  return m;
}

/**
 * Loads `data/manifest.json` with cache revalidation (Handoff §9.1).
 */
export async function loadManifest(
  customBaseUrl?: string,
  fetchImpl: typeof fetch = fetch
): Promise<DataManifest> {
  const base = normalizeBaseUrl(customBaseUrl);
  const manifestUrl = `${base}data/manifest.json`;

  const response = await fetchImpl(manifestUrl, {
    headers: { Accept: 'application/json' },
    cache: 'no-cache'
  });

  if (!response.ok) {
    throw new Error(`Failed to load manifest.json: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return validateManifest(raw);
}

function sanitizeSafeStubs(rawStubs: unknown, fallbackSource: ObservatorySource): SafeStub[] {
  if (!Array.isArray(rawStubs)) return [];
  const stubs: SafeStub[] = [];
  for (const entry of rawStubs) {
    if (!entry || typeof entry !== 'object') continue;
    const s = entry as Partial<SafeStub>;
    if (!s.id || !s.date || !s.sourceUrl) continue;
    stubs.push({
      id: s.id,
      source: s.source || fallbackSource,
      date: s.date,
      sourceUrl: s.sourceUrl,
      mediaType: s.mediaType || 'other',
      rightsStatus: s.rightsStatus,
      publicationStatus: s.publicationStatus,
      rights: s.rights,
      cardType: s.cardType,
      contentType: s.contentType,
      presentation: s.presentation,
      collection: s.collection,
      identifier: s.identifier
    });
  }
  return stubs;
}

function safeStubToRecord(stub: SafeStub): ObservatoryRecord {
  const sourceLabel = stub.source === 'apod' ? 'NASA APOD' : stub.source === 'epic' ? 'NASA EPIC' : 'NASA Library';
  return {
    id: stub.id,
    source: stub.source,
    date: stub.date,
    title: `${sourceLabel} · ${stub.date.slice(0, 10)}`,
    description: '',
    mediaType: 'none',
    mediaUrl: null,
    thumbnailUrl: null,
    sourceUrl: stub.sourceUrl,
    retrievedAt: '',
    localMediaUrl: null,
    mediaStorageStatus: 'none',
    rightsStatus: stub.rightsStatus,
    publicationStatus: stub.publicationStatus || 'published',
    rights: stub.rights,
    cardType: 'source_link',
    contentType: 'metadata',
    presentation: stub.presentation,
    collection: stub.collection,
    identifier: stub.identifier,
    attribution: 'NASA'
  };
}

/**
 * Loads a single source index declared in `manifest.json` (Handoff §2, §9.3, §10).
 */
export async function loadSourceIndex(
  manifest: DataManifest,
  source: ObservatorySource,
  customBaseUrl?: string,
  epicCollection?: EpicCollection,
  fetchImpl: typeof fetch = fetch
): Promise<SourceDataState> {
  const sourceDesc = manifest.sources[source];
  const rawIndexPath =
    source === 'epic' && epicCollection && sourceDesc.collections?.[epicCollection]
      ? sourceDesc.collections[epicCollection]
      : sourceDesc.index;

  const url = resolveIndexUrl(rawIndexPath, manifest.releaseId, customBaseUrl);

  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${source}${epicCollection ? `/${epicCollection}` : ''} index: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as Partial<SourceIndexFile<ObservatoryRecord>>;
  if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
    throw new Error(`Invalid index structure for ${source}: missing items array`);
  }

  const validItems = data.items
    .filter(item => isPublishableRecord(item))
    .map(item => ({
      ...item,
      source: item.source || source,
      collection: item.collection || epicCollection
    }));

  const safeStubs = sanitizeSafeStubs(data.safeStubs, source);
  const stubRecords = safeStubs.map(safeStubToRecord);

  return {
    status: 'loaded',
    items: [...validItems, ...stubRecords].sort((a, b) => b.date.localeCompare(a.date)),
    safeStubs,
    generatedAt: data.generatedAt || null,
    error: null
  };
}

/**
 * Backward-compatible helper for loading APOD items only.
 */
export async function loadApodIndex(
  manifest: DataManifest,
  customBaseUrl?: string,
  fetchImpl: typeof fetch = fetch
): Promise<ObservatoryRecord[]> {
  const result = await loadSourceIndex(manifest, 'apod', customBaseUrl, undefined, fetchImpl);
  return result.items;
}

function createErrorSourceState(err: unknown): SourceDataState {
  return {
    status: 'error',
    items: [],
    safeStubs: [],
    generatedAt: null,
    error: err instanceof Error ? err.message : String(err || 'Unknown load error')
  };
}

/**
 * Loads APOD, EPIC (Natural + Enhanced), and Library indexes independently (Handoff §9.3, §9.4).
 * A failure in one source never blanks other sources.
 */
export async function loadReleaseSources(
  manifest: DataManifest,
  customBaseUrl?: string,
  fetchImpl: typeof fetch = fetch
): Promise<ObservatoryReleaseBundle> {
  const hasCollections = Boolean(
    manifest.sources.epic.collections?.natural && manifest.sources.epic.collections?.enhanced
  );

  const [apodRes, epicNatRes, epicEnhRes, libRes] = await Promise.allSettled([
    loadSourceIndex(manifest, 'apod', customBaseUrl, undefined, fetchImpl),
    hasCollections
      ? loadSourceIndex(manifest, 'epic', customBaseUrl, 'natural', fetchImpl)
      : loadSourceIndex(manifest, 'epic', customBaseUrl, undefined, fetchImpl),
    hasCollections
      ? loadSourceIndex(manifest, 'epic', customBaseUrl, 'enhanced', fetchImpl)
      : Promise.resolve<SourceDataState>({
          status: 'loaded',
          items: [],
          safeStubs: [],
          generatedAt: null,
          error: null
        }),
    loadSourceIndex(manifest, 'library', customBaseUrl, undefined, fetchImpl)
  ]);

  const apod = apodRes.status === 'fulfilled' ? apodRes.value : createErrorSourceState(apodRes.reason);
  const epicNatural =
    epicNatRes.status === 'fulfilled' ? epicNatRes.value : createErrorSourceState(epicNatRes.reason);
  const epicEnhanced =
    epicEnhRes.status === 'fulfilled' ? epicEnhRes.value : createErrorSourceState(epicEnhRes.reason);
  const library = libRes.status === 'fulfilled' ? libRes.value : createErrorSourceState(libRes.reason);

  const combinedEpicItems = [...epicNatural.items, ...epicEnhanced.items].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const combinedEpicStubs = [...epicNatural.safeStubs, ...epicEnhanced.safeStubs];

  const epicStatus: EpicDataState['status'] =
    epicNatural.status === 'loaded' || epicEnhanced.status === 'loaded' ? 'loaded' : 'error';
  const epicErrors = [epicNatural.error, epicEnhanced.error].filter(Boolean);

  const epic: EpicDataState = {
    status: epicStatus,
    items: combinedEpicItems,
    safeStubs: combinedEpicStubs,
    generatedAt: epicNatural.generatedAt || epicEnhanced.generatedAt,
    error: epicErrors.length > 0 ? epicErrors.join(' | ') : null,
    natural: epicNatural,
    enhanced: epicEnhanced
  };

  return {
    manifest,
    apod,
    epic,
    library
  };
}

/**
 * Full release loader with in-memory retention of the last valid immutable release on refresh failure (§9.7).
 */
export async function loadObservatoryRelease(
  customBaseUrl?: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ bundle: ObservatoryReleaseBundle; refreshWarning: string | null }> {
  try {
    const manifest = await loadManifest(customBaseUrl, fetchImpl);
    const bundle = await loadReleaseSources(manifest, customBaseUrl, fetchImpl);
    lastValidReleaseBundle = bundle;
    return { bundle, refreshWarning: null };
  } catch (err) {
    if (lastValidReleaseBundle) {
      return {
        bundle: lastValidReleaseBundle,
        refreshWarning: err instanceof Error ? err.message : String(err)
      };
    }
    throw err;
  }
}

/**
 * Normalizes both `YYYY-MM-DD` (APOD) and `YYYY-MM-DD HH:MM:SS` (EPIC) into `YYYY-MM-DD`.
 */
export function extractDateKey(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : dateStr.slice(0, 10);
}

/**
 * Extracts UTC time component from EPIC timestamps (`YYYY-MM-DD HH:MM:SS`).
 */
export function extractUtcTime(dateStr: string): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/\d{4}-\d{2}-\d{2}[ T](\d{2}:\d{2}:\d{2})/);
  return match ? `${match[1]} UTC` : null;
}

/**
 * Filters publications across sources, collections, search query, media type, card type, date, and month.
 */
export function filterPublications(
  pubs: ObservatoryRecord[],
  filters: FilterState
): ObservatoryRecord[] {
  return pubs.filter(pub => {
    // Source / collection tab filter
    if (filters.sourceTab && filters.sourceTab !== 'all') {
      if (filters.sourceTab === 'apod' && pub.source !== 'apod') return false;
      if (filters.sourceTab === 'library' && pub.source !== 'library') return false;
      if (filters.sourceTab === 'epic-natural' && (pub.source !== 'epic' || pub.collection !== 'natural')) {
        return false;
      }
      if (filters.sourceTab === 'epic-enhanced' && (pub.source !== 'epic' || pub.collection !== 'enhanced')) {
        return false;
      }
    }

    // Search filter in title, description, aiSummary, attribution, credits, copyright, date, identifier
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const attribution = getRecordAttribution(pub).toLowerCase();
      const inTitle = (pub.title || '').toLowerCase().includes(q);
      const inDesc = (pub.description || '').toLowerCase().includes(q);
      const inAiTitle = (pub.aiSummary?.title || '').toLowerCase().includes(q);
      const inAiBody = (pub.aiSummary?.body || '').toLowerCase().includes(q);
      const inCredits = (pub.credits || '').toLowerCase().includes(q);
      const inCopyright = (pub.copyright || '').toLowerCase().includes(q);
      const inAttribution = attribution.includes(q);
      const inDate = pub.date.toLowerCase().includes(q);
      const inCollection = (pub.collection || '').toLowerCase().includes(q);
      const inId = pub.id.toLowerCase().includes(q);

      if (
        !inTitle &&
        !inDesc &&
        !inAiTitle &&
        !inAiBody &&
        !inCredits &&
        !inCopyright &&
        !inAttribution &&
        !inDate &&
        !inCollection &&
        !inId
      ) {
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

    // Card type filter
    if (filters.cardTypeFilter && filters.cardTypeFilter !== 'all') {
      if (getEffectiveCardType(pub) !== filters.cardTypeFilter) return false;
    }

    // Legacy rights filter compatibility
    if (filters.rightsFilter === 'nasa_public_domain') {
      if (!canRenderMedia(pub)) return false;
    } else if (filters.rightsFilter === 'review_required') {
      if (canRenderMedia(pub)) return false;
    }

    const dateKey = extractDateKey(pub.date);

    // Selected single date
    if (filters.selectedDate) {
      if (dateKey !== extractDateKey(filters.selectedDate)) return false;
    }

    // Selected Month (YYYY-MM)
    if (filters.selectedMonth) {
      if (!dateKey.startsWith(filters.selectedMonth)) return false;
    }

    return true;
  });
}

/**
 * Aggregates all unique months present in the dataset with count of publications.
 */
export function getAvailableMonths(pubs: Array<{ date: string }>, lang: Language = 'ru') {
  const map = new Map<string, number>();
  for (const pub of pubs) {
    const ym = extractDateKey(pub.date).slice(0, 7); // "YYYY-MM"
    if (/^\d{4}-\d{2}$/.test(ym)) {
      map.set(ym, (map.get(ym) || 0) + 1);
    }
  }

  const result: { ym: string; year: number; month: number; label: string; count: number }[] = [];
  const monthNamesRu = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ];
  const monthNamesEn = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

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
 * Formats `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS` into localized date string.
 */
export function formatDateLocale(dateStr: string, lang: Language = 'ru'): string {
  try {
    const dateKey = extractDateKey(dateStr);
    const [y, m, d] = dateKey.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
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

/**
 * Computes Euclidean distance from Earth center (km) for a J2000 3D vector.
 */
export function computeVectorDistanceKm(vec?: { x: number; y: number; z: number }): number | null {
  if (!vec) return null;
  const dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
  return Number.isFinite(dist) ? Math.round(dist) : null;
}

export interface EpicDaySeries {
  dateKey: string;
  natural: ObservatoryRecord[];
  enhanced: ObservatoryRecord[];
  frameCount: number;
  startUtc: string | null;
  endUtc: string | null;
  previewFrame: ObservatoryRecord;
}

/**
 * Groups EPIC Natural and Enhanced records by calendar date (`YYYY-MM-DD`).
 * Within each day, frames are sorted chronologically ascending (for Earth rotation playback).
 * Days are sorted newest-first so index 0 is always the latest available observation day.
 */
export function buildEpicDaySeries(
  naturalItems: ObservatoryRecord[],
  enhancedItems: ObservatoryRecord[]
): EpicDaySeries[] {
  const byDay = new Map<string, { natural: ObservatoryRecord[]; enhanced: ObservatoryRecord[] }>();

  for (const item of naturalItems) {
    const key = extractDateKey(item.date);
    if (!key) continue;
    const entry = byDay.get(key) || { natural: [], enhanced: [] };
    entry.natural.push(item);
    byDay.set(key, entry);
  }

  for (const item of enhancedItems) {
    const key = extractDateKey(item.date);
    if (!key) continue;
    const entry = byDay.get(key) || { natural: [], enhanced: [] };
    entry.enhanced.push(item);
    byDay.set(key, entry);
  }

  const sortedDays = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDays
    .map((dateKey) => {
      const bucket = byDay.get(dateKey)!;
      const natural = [...bucket.natural].sort((a, b) => a.date.localeCompare(b.date));
      const enhanced = [...bucket.enhanced].sort((a, b) => a.date.localeCompare(b.date));
      const primary = natural.length > 0 ? natural : enhanced;
      if (primary.length === 0) return null;

      const first = primary[0];
      const last = primary[primary.length - 1];
      // Mid-day / sunlit representative preview frame
      const previewFrame = primary[Math.floor(primary.length / 2)] || last;

      return {
        dateKey,
        natural,
        enhanced,
        frameCount: Math.max(natural.length, enhanced.length),
        startUtc: extractUtcTime(first.date),
        endUtc: extractUtcTime(last.date),
        previewFrame
      };
    })
    .filter((s): s is EpicDaySeries => s !== null);
}

/**
 * Synchronizes the frame index when switching between EPIC `natural` and `enhanced`
 * by matching the exact frame `identifier`, falling back to matching timestamp or closest index.
 */
export function findSyncedEpicFrameIndex(
  targetFrames: ObservatoryRecord[],
  currentFrame: ObservatoryRecord | null | undefined,
  fallbackIndex = 0
): number {
  if (targetFrames.length === 0) return 0;
  if (!currentFrame) {
    return Math.max(0, Math.min(fallbackIndex, targetFrames.length - 1));
  }

  if (currentFrame.identifier) {
    const byId = targetFrames.findIndex((f) => f.identifier === currentFrame.identifier);
    if (byId >= 0) return byId;
  }

  const byDate = targetFrames.findIndex((f) => f.date === currentFrame.date);
  if (byDate >= 0) return byDate;

  return Math.max(0, Math.min(fallbackIndex, targetFrames.length - 1));
}

/**
 * Circular frame stepper for EPIC playback and Prev/Next controls.
 */
export function getNextEpicFrameIndex(
  currentIndex: number,
  totalFrames: number,
  delta: number
): number {
  if (totalFrames <= 0) return 0;
  return ((currentIndex + delta) % totalFrames + totalFrames) % totalFrames;
}

export interface ResolvedStoryContent {
  title: string;
  body: string | null;
  kind: 'ai_summary' | 'source_text' | 'source_link' | 'needs_explanation';
  disclosure: string | null;
  factSources: string[];
  needsCollectorText: boolean;
}

/**
 * Resolves visitor-facing popular-science story content for APOD & Library cards
 * strictly respecting Sprint 011 §3 language & rights rules:
 * - Never fabricates explanations or displays unapproved/draft text.
 * - RU: displays approved Russian `aiSummary`; otherwise an approved English source text with a clear notice.
 * - EN: displays original source text ONLY when `cardType === 'full'` and `rights.text.status === 'approved'`;
 *       otherwise displays approved English `aiSummary` if present, or marks `needsCollectorText: true`.
 */
export function resolveStoryContent(
  record: ObservatoryRecord,
  lang: Language
): ResolvedStoryContent {
  const aiApproved = canRenderAiSummary(record);
  const sourceTextApproved = canRenderSourceText(record);
  const ai = record.aiSummary;

  if (getEffectiveCardType(record) === 'source_link') {
    return {
      title: record.title,
      body: null,
      kind: 'source_link',
      disclosure: lang === 'ru'
        ? 'Описание доступно на сайте NASA'
        : "Description available on NASA's website",
      factSources: [],
      needsCollectorText: true
    };
  }

  if (lang === 'ru') {
    if (aiApproved && ai && (!ai.language || ai.language.toLowerCase().startsWith('ru'))) {
      return {
        title: ai.title || record.title,
        body: ai.body,
        kind: 'ai_summary',
        disclosure: getLocalizedDisclosure(ai, 'ru'),
        factSources: ai.factSources || [],
        needsCollectorText: false
      };
    }

    if (sourceTextApproved && record.description) {
      return {
        title: record.title,
        body: record.description,
        kind: 'source_text',
        disclosure: 'Автоматический пересказ ИИ недоступен. Показан оригинальный текст на английском языке',
        factSources: [],
        needsCollectorText: false
      };
    }

    return {
      title: record.title,
      body: null,
      kind: 'needs_explanation',
      disclosure: null,
      factSources: [],
      needsCollectorText: true
    };
  }

  // English mode
  if (sourceTextApproved && record.description) {
    return {
      title: record.title,
      body: record.description,
      kind: 'source_text',
      disclosure: 'AI-generated summary is unavailable. The original English text is shown',
      factSources: [],
      needsCollectorText: false
    };
  }

  if (aiApproved && ai && ai.language?.toLowerCase().startsWith('en')) {
    return {
      title: ai.title || record.title,
      body: ai.body,
      kind: 'ai_summary',
      disclosure: getLocalizedDisclosure(ai, 'en'),
      factSources: ai.factSources || [],
      needsCollectorText: false
    };
  }

  return {
    title: record.title,
    body: null,
    kind: 'needs_explanation',
    disclosure: null,
    factSources: [],
    needsCollectorText: true
  };
}
