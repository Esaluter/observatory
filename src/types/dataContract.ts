/**
 * NASA Observatory Data Contract Types
 * Schema Version: 1 (Sprint 009/010 — GEMINI_INTEGRATION_HANDOFF.md)
 * Backward-compatible with existing APOD fields while supporting EPIC, Library,
 * component-level rights, cardType variants, aiSummary, and safeStubs.
 */

export type ObservatorySource = 'apod' | 'epic' | 'library';

export type EpicCollection = 'natural' | 'enhanced';

export type ApodMediaType = 'image' | 'video' | 'iframe' | 'other' | 'none';

export type MediaStorageStatus = 'private_archive' | 'local_public' | 'external_only' | 'none';

export type RightsStatus = 'nasa_public_domain' | 'review_required' | 'restricted';

export type ComponentRightStatus = 'approved' | 'review_required' | 'restricted';

export type CardType = 'full' | 'media_only' | 'text_ai_summary';

export type ContentType = 'source_text' | 'metadata' | 'ai_summary';

export interface ComponentRight {
  status: ComponentRightStatus;
  basis?: string;
  policyUrl?: string;
  attribution?: string;
  evidence?: string;
}

export interface RecordRights {
  media?: ComponentRight;
  text?: ComponentRight;
  translation?: ComponentRight;
  aiSummary?: ComponentRight;
}

export interface AiSummaryBlock {
  contentType?: 'ai_summary';
  language?: string;
  title: string;
  body: string;
  factSources?: string[];
  reviewStatus?: string;
  disclosure?: {
    ru?: string;
    en?: string;
    [key: string]: string | undefined;
  };
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AttitudeQuaternions {
  q0: number;
  q1: number;
  q2: number;
  q3: number;
}

export interface CentroidCoordinates {
  lat: number;
  lon: number;
}

export interface ObservatoryRecord {
  id: string;
  source: ObservatorySource;
  date: string;
  title: string;
  description: string;
  mediaType: ApodMediaType;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string;
  credits?: string | null;
  copyright?: string | null;
  retrievedAt: string;
  localMediaUrl?: string | null;
  mediaStorageStatus?: MediaStorageStatus;
  rightsStatus?: RightsStatus;

  // Sprint 009/010 component-level publication contract fields
  publicationStatus?: ComponentRightStatus;
  cardType?: CardType;
  contentType?: ContentType;
  rights?: RecordRights;
  rightsEvidence?: string;
  attribution?: string | null;
  aiSummary?: AiSummaryBlock | null;
  mediaSha256?: string;
  mediaSizeBytes?: number;

  // EPIC-specific scientific telemetry fields
  collection?: EpicCollection;
  identifier?: string;
  image?: string;
  version?: string;
  centroidCoordinates?: CentroidCoordinates;
  dscovrJ2000Position?: Vector3D;
  lunarJ2000Position?: Vector3D;
  sunJ2000Position?: Vector3D;
  attitudeQuaternions?: AttitudeQuaternions;
}

/**
 * Backward-compatibility aliases
 */
export type ApodRecord = ObservatoryRecord;
export type ApodPublication = ObservatoryRecord;

export interface SafeStub {
  id: string;
  source: ObservatorySource;
  date: string;
  sourceUrl: string;
  mediaType: ApodMediaType;
  rightsStatus?: RightsStatus;
  publicationStatus?: ComponentRightStatus;
  rights?: RecordRights;
  collection?: EpicCollection;
  identifier?: string;
}

export interface CardTypeCounts {
  full: number;
  mediaOnly: number;
  textAiSummary: number;
}

export interface ManifestSource {
  count: number;
  candidateCount?: number;
  safeStubCount?: number;
  index: string;
  cards?: CardTypeCounts;
  sourceSchemaVersion?: number;
  sourceGeneratedAt?: string;
  collections?: {
    natural: string;
    enhanced: string;
  };
}

export interface DataManifest {
  schemaVersion: number;
  releaseId?: string;
  generatedAt: string | null;
  records?: number;
  mediaFiles?: number;
  rights?: {
    fullRecords: number;
    safeStubs: number;
    excludedMedia: number;
    excludedTranslations: number;
  };
  cards?: CardTypeCounts;
  aiSummaries?: {
    approved: number;
  };
  translations?: number;
  checksums?: Record<string, string>;
  sources: {
    apod: ManifestSource;
    epic: ManifestSource;
    library: ManifestSource;
  };
}

export interface SourceIndexFile<T = ObservatoryRecord> {
  schemaVersion: number;
  source: ObservatorySource;
  collection?: EpicCollection;
  generatedAt: string;
  items: T[];
  safeStubs?: SafeStub[];
}

export type ApodIndexFile = SourceIndexFile<ObservatoryRecord>;

export type SourceLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface SourceDataState {
  status: SourceLoadStatus;
  items: ObservatoryRecord[];
  safeStubs: SafeStub[];
  generatedAt: string | null;
  error: string | null;
}

export interface EpicDataState extends SourceDataState {
  natural: SourceDataState;
  enhanced: SourceDataState;
}

export interface ObservatoryReleaseBundle {
  manifest: DataManifest;
  apod: SourceDataState;
  epic: EpicDataState;
  library: SourceDataState;
}

export type Language = 'ru' | 'en';

export type ArchiveSourceTab = 'all' | 'apod' | 'epic-natural' | 'epic-enhanced' | 'library';

export interface FilterState {
  sourceTab: ArchiveSourceTab;
  searchQuery: string;
  mediaType: 'all' | 'image' | 'video';
  cardTypeFilter?: 'all' | CardType;
  rightsFilter?: 'all' | 'nasa_public_domain' | 'review_required';
  selectedDate?: string; // YYYY-MM-DD
  selectedMonth?: string; // YYYY-MM
}
