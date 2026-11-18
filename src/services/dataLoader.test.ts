import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMedia, filterPublications, getAvailableMonths, formatDateLocale } from './dataLoader';
import { ApodRecord } from '../types/dataContract';

const mockPubLocalPublic: ApodRecord = {
  id: 'apod:2026-09-05',
  source: 'apod',
  date: '2026-09-05',
  title: "Chasing the Moon's Shadow",
  description: 'Chasing the shadow of a New Moon, NASA’s WB-57F high altitude research aircraft took to the skies.',
  mediaType: 'image',
  mediaUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/september/2026Eclipse_WB57GoPro_Totality_H264_Abridged.jpg',
  thumbnailUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/september/2026Eclipse_WB57GoPro_Totality_H264_Abridged.jpg',
  sourceUrl: 'https://science.nasa.gov/image-article/apod-2026-september-5-chasing-the-moons-shadow/',
  credits: 'NASA',
  copyright: 'NASA',
  retrievedAt: '2026-11-05T19:53:48.877863Z',
  localMediaUrl: 'media/apod/2026/09/2026-09-05.jpg',
  mediaStorageStatus: 'local_public',
  rightsStatus: 'nasa_public_domain'
};

const mockPubVideo: ApodRecord = {
  id: 'apod:2026-10-18',
  source: 'apod',
  date: '2026-10-18',
  title: 'Flight Through the Orion Nebula in 3D',
  description: 'Embark on an immersive three-dimensional journey through Orion.',
  mediaType: 'video',
  mediaUrl: 'https://www.youtube.com/watch?v=1d_F4mZ513s',
  thumbnailUrl: 'https://img.youtube.com/vi/1d_F4mZ513s/hqdefault.jpg',
  sourceUrl: 'https://science.nasa.gov/image-article/apod-2026-october-18-orion/',
  credits: 'NASA, ESA',
  copyright: null,
  retrievedAt: '2026-11-05T19:53:48.877863Z',
  localMediaUrl: null,
  mediaStorageStatus: 'external_only',
  rightsStatus: 'nasa_public_domain'
};

const mockPubPrivateArchiveReview: ApodRecord = {
  id: 'apod:2026-11-04',
  source: 'apod',
  date: '2026-11-04',
  title: 'The Not-So-Hidden Galaxy, IC 342',
  description: 'IC 342 has its own dust intermittently blocking the glow of hydrogen gas.',
  mediaType: 'image',
  mediaUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/ic342.png',
  thumbnailUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/ic342.png',
  sourceUrl: 'https://science.nasa.gov/image-article/apod-2026-november-4-the-not-so-hidden-galaxy-ic-342/',
  credits: 'Artem Mironov',
  copyright: 'Artem Mironov',
  retrievedAt: '2026-11-05T19:53:48.877863Z',
  localMediaUrl: null,
  mediaStorageStatus: 'private_archive',
  rightsStatus: 'review_required'
};

test('resolveMedia correctly handles authorized public domain local media', () => {
  const resolved = resolveMedia(mockPubLocalPublic, '/');
  assert.equal(resolved.isVideo, false);
  assert.equal(resolved.isAllowedLocally, true);
  assert.equal(resolved.status, 'allowed_local');
  assert.equal(resolved.displayUrl, '/media/apod/2026/09/2026-09-05.jpg');
});

test('resolveMedia correctly detects video and transforms youtube URL to embed', () => {
  const resolved = resolveMedia(mockPubVideo, '/');
  assert.equal(resolved.isVideo, true);
  assert.equal(resolved.embedUrl, 'https://www.youtube.com/embed/1d_F4mZ513s');
  assert.equal(resolved.status, 'video_embed');
});

test('resolveMedia serves remote mediaUrl when local media is private_archive', () => {
  const resolved = resolveMedia(mockPubPrivateArchiveReview, '/');
  assert.equal(resolved.isAllowedLocally, false);
  assert.equal(resolved.displayUrl, mockPubPrivateArchiveReview.mediaUrl);
  assert.equal(resolved.status, 'review_required');
});

test('filterPublications correctly filters by search query in title, credits, description', () => {
  const list = [mockPubLocalPublic, mockPubVideo, mockPubPrivateArchiveReview];
  
  const searchOrion = filterPublications(list, {
    searchQuery: 'Orion',
    mediaType: 'all',
    rightsFilter: 'all'
  });
  assert.equal(searchOrion.length, 1);
  assert.equal(searchOrion[0].id, 'apod:2026-10-18');

  const searchAuthor = filterPublications(list, {
    searchQuery: 'Mironov',
    mediaType: 'all',
    rightsFilter: 'all'
  });
  assert.equal(searchAuthor.length, 1);
  assert.equal(searchAuthor[0].id, 'apod:2026-11-04');
});

test('filterPublications correctly filters by media type', () => {
  const list = [mockPubLocalPublic, mockPubVideo, mockPubPrivateArchiveReview];
  
  const videos = filterPublications(list, {
    searchQuery: '',
    mediaType: 'video',
    rightsFilter: 'all'
  });
  assert.equal(videos.length, 1);
  assert.equal(videos[0].mediaType, 'video');

  const images = filterPublications(list, {
    searchQuery: '',
    mediaType: 'image',
    rightsFilter: 'all'
  });
  assert.equal(images.length, 2);
});

test('getAvailableMonths correctly groups months and counts', () => {
  const list = [mockPubLocalPublic, mockPubVideo, mockPubPrivateArchiveReview];
  const months = getAvailableMonths(list, 'en');
  assert.equal(months.length, 3);
  assert.equal(months[0].ym, '2026-11');
  assert.equal(months[1].ym, '2026-10');
  assert.equal(months[2].ym, '2026-09');
});

test('formatDateLocale formats properly in ru and en', () => {
  const formattedEn = formatDateLocale('2026-09-05', 'en');
  assert.match(formattedEn, /September 5, 2026/i);
  
  const formattedRu = formatDateLocale('2026-09-05', 'ru');
  assert.match(formattedRu, /5 сентября 2026/i);
});
