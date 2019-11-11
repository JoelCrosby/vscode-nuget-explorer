export interface SearchResult {
  '@context': Context;
  totalHits: number;
  lastReopen: string;
  index: string;
  data: Datum[];
}

export interface Context {
  '@vocab': string;
  '@base': string;
}

export interface Datum {
  '@id': string;
  '@type': string;
  registration: string;
  id: string;
  version: string;
  description: string;
  summary: string;
  title: string;
  iconUrl?: string;
  projectUrl: string;
  tags: string[];
  authors: string[];
  totalDownloads: number;
  verified: boolean;
  versions: Version[];
  licenseUrl?: string;
}

export interface Version {
  version: string;
  downloads: number;
  '@id': string;
}
