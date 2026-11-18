/**
 * NASA Observatory Data Contract Types
 * Schema Version: 1
 * Strictly matching data-contract.md
 */

export type ApodMediaType = 'image' | 'video' | 'iframe' | 'other';

export type MediaStorageStatus = 'private_archive' | 'local_public' | 'external_only';

export type RightsStatus = 'nasa_public_domain' | 'review_required';

export interface ApodRecord {
  id: string;
  source: 'apod';
  date: string;
  title: string;
  description: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
  credits: string | null;
  copyright: string | null;
  retrievedAt: string;
  localMediaUrl?: string | null;
  mediaStorageStatus?: MediaStorageStatus;
  rightsStatus?: RightsStatus;
}

/**
 * Backward compatibility alias for ApodRecord
 */
export type ApodPublication = ApodRecord;

export interface ManifestSource {
  count: number;
  index: string;
}

export interface DataManifest {
  schemaVersion: number;
  generatedAt: string | null;
  sources: {
    apod: ManifestSource;
    epic: ManifestSource;
    library: ManifestSource;
  };
}

export interface ApodIndexFile {
  schemaVersion: number;
  source: 'apod';
  generatedAt: string;
  items: ApodRecord[];
}

export type Language = 'ru' | 'en';

export interface FilterState {
  searchQuery: string;
  mediaType: 'all' | 'image' | 'video';
  rightsFilter: 'all' | 'nasa_public_domain' | 'review_required';
  selectedDate?: string;
  selectedMonth?: string; // YYYY-MM
}
