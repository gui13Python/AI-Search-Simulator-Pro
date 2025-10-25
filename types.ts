
export interface SearchParameters {
  query: string;
  location: string;
  device: string;
  language: string;
  country: string;
  googleDomain: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface AdResult {
  title: string;
  displayUrl: string;
  destinationUrl: string;
  description: string;
}

export interface OrganicResult {
  title: string;
  displayUrl: string;
  destinationUrl: string;
  description: string;
}

export interface SimulatedSERP {
  ads: AdResult[];
  organic: OrganicResult[];
}

export interface SearchResult {
  summary: string;
  sources: GroundingChunk[];
  searchVolume?: string;
  cpc?: {
    local?: string;
    usd?: string;
  };
  historicalData?: TrendDataPoint[];
  serp?: SimulatedSERP;
}

export type Language = 'pt' | 'en' | 'es';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
