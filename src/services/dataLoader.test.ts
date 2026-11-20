import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildEpicDaySeries,
  canRenderAiSummary,
  clearLastValidReleaseBundle,
  computeVectorDistanceKm,
  extractDateKey,
  extractUtcTime,
  filterPublications,
  findSyncedEpicFrameIndex,
  formatDateLocale,
  getAvailableMonths,
  getArtisticPlaceholderKind,
  getArtisticPlaceholderUrl,
  getLocalizedDisclosure,
  getNextEpicFrameIndex,
  isPublishableRecord,
  isSafeRelativePath,
  loadObservatoryRelease,
  loadReleaseSources,
  resolveIndexUrl,
  resolveLocalMediaUrl,
  resolveMedia,
  resolveStoryContent,
  validateManifest
} from './dataLoader';
import { DataManifest, ObservatoryRecord } from '../types/dataContract';

const RELEASE_ID = 'ff159441091a0e74f8805390';

const mockApodMediaOnlyImage: ObservatoryRecord = {
  id: 'apod:2026-09-05',
  source: 'apod',
  date: '2026-09-05',
  title: "Chasing the Moon's Shadow",
  description: 'NASA APOD media dated 2026-09-05. The original APOD explanation is not included; see the source publication.',
  mediaType: 'image',
  mediaUrl: 'https://assets.science.nasa.gov/example.jpg',
  thumbnailUrl: 'https://assets.science.nasa.gov/example.jpg',
  sourceUrl: 'https://science.nasa.gov/image-article/apod-2026-september-5-chasing-the-moons-shadow/',
  credits: 'NASA',
  copyright: 'NASA',
  attribution: 'NASA',
  retrievedAt: '2026-11-05T19:53:48.877863Z',
  localMediaUrl: `data/releases/${RELEASE_ID}/media/apod/2026/09/apod_2026-09-05.jpg`,
  mediaStorageStatus: 'local_public',
  rightsStatus: 'nasa_public_domain',
  publicationStatus: 'approved',
  cardType: 'media_only',
  contentType: 'metadata',
  rights: {
    media: { status: 'approved', basis: 'confirmed_nasa_origin', attribution: 'NASA' },
    text: { status: 'review_required', basis: 'insufficient_evidence' }
  }
};

const mockApodMediaOnlyMp4: ObservatoryRecord = {
  id: 'apod:2026-08-31',
  source: 'apod',
  date: '2026-08-31',
  title: 'Launch of the Roman Space Telescope',
  description: 'NASA APOD media dated 2026-08-31. The original APOD explanation is not included; see the source publication.',
  mediaType: 'video',
  mediaUrl: 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/august/RomanLaunch.mp4',
  thumbnailUrl: 'https://assets.science.nasa.gov/dynamicimage/RomanLaunch_NASA.jpg',
  sourceUrl: 'https://science.nasa.gov/image-article/apod-2026-august-31-launch-of-the-roman-space-telescope/',
  credits: 'NASA',
  attribution: 'NASA',
  retrievedAt: '2026-11-06T10:38:55.919633Z',
  localMediaUrl: null,
  mediaStorageStatus: 'external_only',
  rightsStatus: 'nasa_public_domain',
  publicationStatus: 'approved',
  cardType: 'media_only',
  contentType: 'metadata',
  rights: {
    media: { status: 'approved', basis: 'confirmed_nasa_origin', attribution: 'NASA' },
    text: { status: 'review_required', basis: 'insufficient_evidence' }
  }
};

const mockEpicFullWithLegacyReviewRequired: ObservatoryRecord = {
  id: 'epic:natural:20261114222224',
  source: 'epic',
  collection: 'natural',
  identifier: '20261114222224',
  date: '2026-11-14 22:17:35',
  title: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
  description: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
  mediaType: 'image',
  mediaUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/11/14/png/epic_1b_20261114222224.png',
  thumbnailUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/11/14/thumbs/epic_1b_20261114222224.jpg',
  sourceUrl: 'https://epic.gsfc.nasa.gov/',
  retrievedAt: '2026-11-18T10:55:19.073381Z',
  rightsStatus: 'review_required', // Legacy top-level value in Collector output
  publicationStatus: 'approved',
  cardType: 'full',
  contentType: 'source_text',
  attribution: 'NASA EPIC Team',
  localMediaUrl: `data/releases/${RELEASE_ID}/media/epic/2026/11/epic_natural_20261114222224.jpg`,
  mediaStorageStatus: 'local_public',
  rights: {
    media: { status: 'approved', attribution: 'NASA EPIC Team', policyUrl: 'https://epic.gsfc.nasa.gov/about' },
    text: { status: 'approved', attribution: 'NASA EPIC Team', policyUrl: 'https://epic.gsfc.nasa.gov/about' }
  },
  centroidCoordinates: { lat: -13.227539, lon: -168.222656 },
  dscovrJ2000Position: { x: -1060725.05, y: -918843.18, z: -326775.52 }
};

const mockAiSummaryCard: ObservatoryRecord = {
  id: 'apod:2026-11-10',
  source: 'apod',
  date: '2026-11-10',
  title: 'Independent Russian explanation',
  description: 'Summary description',
  mediaType: 'none',
  mediaUrl: 'https://unapproved.example.com/should-never-load.jpg',
  thumbnailUrl: null,
  sourceUrl: 'https://science.nasa.gov/apod/2026-11-10/',
  retrievedAt: '2026-11-18T10:00:00Z',
  localMediaUrl: null,
  mediaStorageStatus: 'none',
  publicationStatus: 'approved',
  cardType: 'text_ai_summary',
  contentType: 'ai_summary',
  rights: {
    media: { status: 'review_required' },
    text: { status: 'review_required' },
    aiSummary: { status: 'approved' }
  },
  aiSummary: {
    contentType: 'ai_summary',
    language: 'ru',
    title: 'Независимое объяснение туманности',
    body: 'Научное описание явления на русском языке.',
    factSources: ['https://science.nasa.gov/'],
    reviewStatus: 'approved',
    disclosure: {
      ru: 'Объяснение подготовлено с помощью ИИ на основе научных источников.',
      en: 'Explanation prepared with AI assistance using scientific sources.'
    }
  }
};

test('isSafeRelativePath rejects traversal, backslashes, URLs, and foreign release IDs', () => {
  assert.equal(isSafeRelativePath(`releases/${RELEASE_ID}/apod/index.json`, RELEASE_ID), true);
  assert.equal(isSafeRelativePath(`data/releases/${RELEASE_ID}/media/apod/2026/09/a.jpg`, RELEASE_ID), true);
  assert.equal(isSafeRelativePath(`releases/other_release_123/apod/index.json`, RELEASE_ID), false);
  assert.equal(isSafeRelativePath(`../secret.json`, RELEASE_ID), false);
  assert.equal(isSafeRelativePath(`releases\\${RELEASE_ID}\\apod\\index.json`, RELEASE_ID), false);
  assert.equal(isSafeRelativePath(`https://evil.example.com/index.json`, RELEASE_ID), false);
});

test('resolveIndexUrl and resolveLocalMediaUrl work with root and non-root Vite base', () => {
  assert.equal(
    resolveIndexUrl(`releases/${RELEASE_ID}/apod/index.json`, RELEASE_ID, '/'),
    `/data/releases/${RELEASE_ID}/apod/index.json`
  );
  assert.equal(
    resolveIndexUrl(`releases/${RELEASE_ID}/apod/index.json`, RELEASE_ID, '/nasa-observatory/'),
    `/nasa-observatory/data/releases/${RELEASE_ID}/apod/index.json`
  );
  assert.equal(
    resolveLocalMediaUrl(mockApodMediaOnlyImage.localMediaUrl, RELEASE_ID, '/nasa-observatory/'),
    `/nasa-observatory/data/releases/${RELEASE_ID}/media/apod/2026/09/apod_2026-09-05.jpg`
  );
  assert.throws(() => resolveIndexUrl(`releases/foreign_id/apod/index.json`, RELEASE_ID, '/'));
});

test('resolveMedia approves EPIC full card despite legacy top-level rightsStatus=review_required', () => {
  const resolved = resolveMedia(mockEpicFullWithLegacyReviewRequired, '/obs/', RELEASE_ID);
  assert.equal(resolved.status, 'allowed_local');
  assert.equal(resolved.isMediaApproved, true);
  assert.equal(resolved.isAllowedLocally, true);
  assert.equal(
    resolved.displayUrl,
    `/obs/data/releases/${RELEASE_ID}/media/epic/2026/11/epic_natural_20261114222224.jpg`
  );
});

test('resolveMedia detects approved external_only MP4 video as direct HTML5 video', () => {
  const resolved = resolveMedia(mockApodMediaOnlyMp4, '/', RELEASE_ID);
  assert.equal(resolved.isVideo, true);
  assert.equal(resolved.isDirectVideo, true);
  assert.equal(resolved.status, 'video_direct');
  assert.equal(resolved.videoUrl, mockApodMediaOnlyMp4.mediaUrl);
  assert.equal(resolved.embedUrl, null);
});

test('resolveMedia uses a labelled local illustration for text_ai_summary without rendering source media', () => {
  const resolved = resolveMedia(mockAiSummaryCard, '/', RELEASE_ID);
  assert.equal(resolved.status, 'artistic_placeholder');
  assert.equal(resolved.isArtisticPlaceholder, true);
  assert.match(resolved.displayUrl || '', /^\/placeholders\/placeholder_/);
  assert.equal(resolved.videoUrl, null);
  assert.equal(resolved.embedUrl, null);
  assert.equal(isPublishableRecord(mockAiSummaryCard), true);
  assert.match(getLocalizedDisclosure(mockAiSummaryCard.aiSummary, 'ru'), /ИИ/);
  assert.match(getLocalizedDisclosure(mockAiSummaryCard.aiSummary, 'en'), /AI assistance/);
});

test('resolveMedia NEVER falls back from missing local approved file to unreviewed remote URL', () => {
  const missingLocal: ObservatoryRecord = {
    ...mockApodMediaOnlyImage,
    localMediaUrl: null,
    mediaStorageStatus: 'local_public'
  };
  const resolved = resolveMedia(missingLocal, '/', RELEASE_ID);
  assert.equal(resolved.status, 'artistic_placeholder');
  assert.equal(resolved.isArtisticPlaceholder, true);
  assert.notEqual(resolved.displayUrl, missingLocal.mediaUrl);
});

test('artistic placeholders are thematic, Vite-base aware, unique assets', () => {
  assert.equal(getArtisticPlaceholderKind(mockApodMediaOnlyImage), 'planet');
  assert.equal(
    getArtisticPlaceholderUrl({ ...mockApodMediaOnlyImage, title: 'A distant galaxy' }, '/observatory/'),
    '/observatory/placeholders/placeholder_galaxy.png'
  );
  const assets = fs.readdirSync(path.resolve('public/placeholders')).filter(name => name.endsWith('.png'));
  assert.equal(assets.length, 10);
  assert.equal(new Set(assets).size, 10);
  for (const asset of assets) {
    assert.ok(fs.statSync(path.resolve('public/placeholders', asset)).size > 0);
  }
});

test('isPublishableRecord rejects restricted items and unapproved AI summary drafts', () => {
  const restricted: ObservatoryRecord = {
    ...mockApodMediaOnlyImage,
    publicationStatus: 'restricted'
  };
  assert.equal(isPublishableRecord(restricted), false);

  const unapprovedAi: ObservatoryRecord = {
    ...mockAiSummaryCard,
    rights: { aiSummary: { status: 'review_required' } },
    aiSummary: { ...mockAiSummaryCard.aiSummary!, reviewStatus: 'needs_review' }
  };
  assert.equal(isPublishableRecord(unapprovedAi), false);
});

test('extractDateKey, extractUtcTime, formatDateLocale, and computeVectorDistanceKm handle APOD and EPIC formats', () => {
  assert.equal(extractDateKey('2026-11-14 22:17:35'), '2026-11-14');
  assert.equal(extractUtcTime('2026-11-14 22:17:35'), '22:17:35 UTC');
  assert.equal(extractUtcTime('2026-09-05'), null);

  assert.match(formatDateLocale('2026-11-14 22:17:35', 'en'), /November 14, 2026/i);
  assert.match(formatDateLocale('2026-11-14 22:17:35', 'ru'), /14 ноября 2026/i);

  const dist = computeVectorDistanceKm(mockEpicFullWithLegacyReviewRequired.dscovrJ2000Position);
  assert.ok(dist && dist > 1_400_000 && dist < 1_500_000);
});

test('filterPublications filters across source tabs, search, media type, and EPIC date keys', () => {
  const all = [mockApodMediaOnlyImage, mockApodMediaOnlyMp4, mockEpicFullWithLegacyReviewRequired];
  const onlyEpicNatural = filterPublications(all, {
    sourceTab: 'epic-natural',
    searchQuery: '',
    mediaType: 'all'
  });
  assert.equal(onlyEpicNatural.length, 1);
  assert.equal(onlyEpicNatural[0].id, mockEpicFullWithLegacyReviewRequired.id);

  const byEpicDay = filterPublications(all, {
    sourceTab: 'all',
    searchQuery: '',
    mediaType: 'all',
    selectedDate: '2026-11-14'
  });
  assert.equal(byEpicDay.length, 1);
  assert.equal(byEpicDay[0].source, 'epic');

  const months = getAvailableMonths(all, 'en');
  assert.equal(months[0].ym, '2026-11');
});

test('loadReleaseSources isolates a failed source index without blanking other sources', async () => {
  const manifest: DataManifest = {
    schemaVersion: 1,
    releaseId: RELEASE_ID,
    generatedAt: '2026-11-19T13:14:39Z',
    sources: {
      apod: { count: 1, index: `releases/${RELEASE_ID}/apod/index.json` },
      epic: {
        count: 1,
        index: `releases/${RELEASE_ID}/epic/index.json`,
        collections: {
          natural: `releases/${RELEASE_ID}/epic/natural/index.json`,
          enhanced: `releases/${RELEASE_ID}/epic/enhanced/index.json`
        }
      },
      library: { count: 0, index: `releases/${RELEASE_ID}/library/index.json` }
    }
  };

  const mockFetch = (async (url: string | URL) => {
    const u = String(url);
    if (u.includes('apod/index.json')) {
      return new Response(
        JSON.stringify({
          schemaVersion: 1,
          source: 'apod',
          generatedAt: '2026-11-18T00:00:00Z',
          items: [mockApodMediaOnlyImage],
          safeStubs: [{
            id: 'apod:2026-11-17', source: 'apod', date: '2026-11-17',
            sourceUrl: 'https://science.nasa.gov/apod/2026-11-17', mediaType: 'image',
            publicationStatus: 'published', cardType: 'source_link', contentType: 'metadata'
          }]
        }),
        { status: 200 }
      );
    }
    if (u.includes('epic/natural/index.json')) {
      return new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    }
    if (u.includes('epic/enhanced/index.json')) {
      return new Response(
        JSON.stringify({ schemaVersion: 1, source: 'epic', collection: 'enhanced', generatedAt: '2026-11-18T00:00:00Z', items: [{ ...mockEpicFullWithLegacyReviewRequired, id: 'epic:enhanced:1', collection: 'enhanced' }], safeStubs: [] }),
        { status: 200 }
      );
    }
    if (u.includes('library/index.json')) {
      return new Response(
        JSON.stringify({ schemaVersion: 1, source: 'library', generatedAt: '2026-11-18T00:00:00Z', items: [], safeStubs: [] }),
        { status: 200 }
      );
    }
    return new Response('Not Found', { status: 404 });
  }) as unknown as typeof fetch;

  const bundle = await loadReleaseSources(manifest, '/subpath/', mockFetch);
  assert.equal(bundle.apod.status, 'loaded');
  assert.equal(bundle.apod.items.length, 2);
  assert.equal(bundle.apod.safeStubs.length, 1);
  const sourceLinkCard = bundle.apod.items.find(item => item.cardType === 'source_link')!;
  assert.ok(sourceLinkCard);
  assert.equal(resolveStoryContent(sourceLinkCard, 'ru').kind, 'source_link');
  assert.equal(bundle.epic.natural.status, 'error');
  assert.equal(bundle.epic.enhanced.status, 'loaded');
  assert.equal(bundle.epic.enhanced.items.length, 1);
  assert.equal(bundle.library.status, 'loaded');
  assert.equal(bundle.library.items.length, 0);
});

test('loadObservatoryRelease keeps last successfully loaded immutable release in memory on refresh failure', async () => {
  clearLastValidReleaseBundle();
  const manifest: DataManifest = {
    schemaVersion: 1,
    releaseId: RELEASE_ID,
    generatedAt: '2026-11-19T13:14:39Z',
    sources: {
      apod: { count: 1, index: `releases/${RELEASE_ID}/apod/index.json` },
      epic: { count: 0, index: `releases/${RELEASE_ID}/epic/index.json` },
      library: { count: 0, index: `releases/${RELEASE_ID}/library/index.json` }
    }
  };

  const okFetch = (async (url: string | URL) => {
    const u = String(url);
    if (u.includes('manifest.json')) return new Response(JSON.stringify(manifest), { status: 200 });
    if (u.includes('apod/index.json')) {
      return new Response(
        JSON.stringify({ schemaVersion: 1, source: 'apod', generatedAt: '2026-11-18', items: [mockApodMediaOnlyImage], safeStubs: [] }),
        { status: 200 }
      );
    }
    return new Response(JSON.stringify({ schemaVersion: 1, source: 'epic', generatedAt: '2026-11-18', items: [], safeStubs: [] }), { status: 200 });
  }) as unknown as typeof fetch;

  const first = await loadObservatoryRelease('/', okFetch);
  assert.equal(first.refreshWarning, null);
  assert.equal(first.bundle.manifest.releaseId, RELEASE_ID);

  const failingFetch = (async () => {
    throw new Error('Network offline');
  }) as unknown as typeof fetch;

  const second = await loadObservatoryRelease('/', failingFetch);
  assert.ok(second.refreshWarning);
  assert.equal(second.bundle.manifest.releaseId, RELEASE_ID);
  assert.equal(second.bundle.apod.items.length, 1);
});

test('Actual public/data/manifest.json and release files satisfy Sprint 010 data contract', () => {
  const manifestPath = path.resolve('public/data/manifest.json');
  const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifest = validateManifest(rawManifest);

  assert.ok(manifest.releaseId && /^[a-f0-9]{24}$/.test(manifest.releaseId));
  assert.equal(manifest.records, 1046);
  assert.equal(manifest.sources.apod.count, 62);
  assert.equal(manifest.sources.apod.safeStubCount, 27);
  assert.equal(manifest.sources.epic.count, 877);
  assert.equal(manifest.sources.library.count, 0);
  assert.equal(manifest.sources.library.safeStubCount, 80);
  assert.equal(manifest.aiSummaries?.approved, 61);
  assert.equal(manifest.aiSummaries?.fallback, 13);
  assert.equal(manifest.translations, 0);

  const apodRaw = JSON.parse(
    fs.readFileSync(path.resolve('public/data', manifest.sources.apod.index), 'utf8')
  );
  assert.equal(apodRaw.items.length, manifest.sources.apod.count);
  assert.equal(apodRaw.safeStubs.length, manifest.sources.apod.safeStubCount);
  for (const item of apodRaw.items as ObservatoryRecord[]) {
    assert.equal(isPublishableRecord(item), true);
    const media = resolveMedia(item, '/', manifest.releaseId);
    assert.ok(['allowed_local', 'video_direct', 'video_embed', 'artistic_placeholder'].includes(media.status));
  }
  assert.ok(apodRaw.safeStubs.every((stub: { publicationStatus: string; cardType: string }) =>
    stub.publicationStatus === 'published' && stub.cardType === 'source_link'
  ));
  const approvedAiCards = (apodRaw.items as ObservatoryRecord[]).filter(item => item.aiSummary);
  assert.equal(approvedAiCards.length, manifest.aiSummaries?.approved);
  for (const item of approvedAiCards) {
    assert.equal(canRenderAiSummary(item), true);
    assert.equal(resolveStoryContent(item, 'ru').kind, 'ai_summary');
  }

  const epicNatRaw = JSON.parse(
    fs.readFileSync(path.resolve('public/data', manifest.sources.epic.collections!.natural), 'utf8')
  );
  const epicEnhRaw = JSON.parse(
    fs.readFileSync(path.resolve('public/data', manifest.sources.epic.collections!.enhanced), 'utf8')
  );
  assert.equal(epicNatRaw.items.length + epicEnhRaw.items.length, manifest.sources.epic.count);
  for (const item of [...epicNatRaw.items, ...epicEnhRaw.items] as ObservatoryRecord[]) {
    assert.equal(isPublishableRecord(item), true);
    const media = resolveMedia(item, '/', manifest.releaseId);
    assert.equal(media.status, 'allowed_local');
  }
});

test('buildEpicDaySeries groups the real EPIC release chronologically and syncs Natural/Enhanced frames', () => {
  const manifestRaw = JSON.parse(fs.readFileSync(path.resolve('public/data/manifest.json'), 'utf8')) as DataManifest;
  const natItems = JSON.parse(
    fs.readFileSync(path.resolve('public/data', manifestRaw.sources.epic.collections!.natural), 'utf8')
  ).items as ObservatoryRecord[];
  const enhItems = JSON.parse(
    fs.readFileSync(path.resolve('public/data', manifestRaw.sources.epic.collections!.enhanced), 'utf8')
  ).items as ObservatoryRecord[];

  const series = buildEpicDaySeries(natItems, enhItems);
  assert.ok(series.length > 0);
  assert.equal(series.length, new Set([...natItems, ...enhItems].map(item => extractDateKey(item.date))).size);
  assert.ok(series.every((entry, index) => index === 0 || series[index - 1].dateKey > entry.dateKey));

  // Chronological ascending within a day
  assert.ok(series[0].natural[0].date < series[0].natural[series[0].natural.length - 1].date);

  // Exact identifier sync between Natural and Enhanced
  const paired = series.find(entry => entry.natural.length > 0 && entry.enhanced.length > 0)!;
  const sampleNatural = paired.natural[Math.min(6, paired.natural.length - 1)];
  const syncedIdx = findSyncedEpicFrameIndex(paired.enhanced, sampleNatural);
  assert.equal(paired.enhanced[syncedIdx].identifier, sampleNatural.identifier);

  // Circular stepping
  assert.equal(getNextEpicFrameIndex(12, 13, 1), 0);
  assert.equal(getNextEpicFrameIndex(0, 13, -1), 12);
});

test('resolveStoryContent enforces RU/EN rights and language rules without fabricating explanations', () => {
  // Current media_only APOD without approved explanation -> honest needsCollectorText in both RU & EN
  const ruMediaOnly = resolveStoryContent(mockApodMediaOnlyImage, 'ru');
  assert.equal(ruMediaOnly.needsCollectorText, true);
  assert.equal(ruMediaOnly.body, null);

  const enMediaOnly = resolveStoryContent(mockApodMediaOnlyImage, 'en');
  assert.equal(enMediaOnly.needsCollectorText, true);
  assert.equal(enMediaOnly.body, null);

  // Approved Russian AI summary -> rendered in RU with disclosure, not forced as EN explanation
  const ruAi = resolveStoryContent(mockAiSummaryCard, 'ru');
  assert.equal(ruAi.needsCollectorText, false);
  assert.equal(ruAi.kind, 'ai_summary');
  assert.equal(ruAi.title, 'Независимое объяснение туманности');
  assert.ok(ruAi.disclosure && ruAi.disclosure.includes('ИИ'));

  // Approved source text remains available in EN and as an explicitly labelled RU fallback.
  const enFull = resolveStoryContent(mockEpicFullWithLegacyReviewRequired, 'en');
  assert.equal(enFull.needsCollectorText, false);
  assert.equal(enFull.kind, 'source_text');
  assert.ok(enFull.body && enFull.body.includes('DSCOVR'));
  const ruFullFallback = resolveStoryContent(mockEpicFullWithLegacyReviewRequired, 'ru');
  assert.equal(ruFullFallback.kind, 'source_text');
  assert.ok(ruFullFallback.body && ruFullFallback.body.includes('DSCOVR'));
  assert.match(ruFullFallback.disclosure || '', /оригинальный текст на английском языке/);
});
