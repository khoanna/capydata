/**
 * Type definitions for real blockchain data
 * Replaces mockData.ts with actual on-chain types
 */

export type AssetType = "dataset" | "algorithm" | "stream" | "storage";
export type PriceModel = "free" | "fixed" | "dynamic";
export type Chain = "sui";

/**
 * On-chain Dataset structure (mirrors Move struct)
 */
export interface Dataset {
  // Object ID
  id: string;

  // Dataset metadata
  title: string;
  description: string;

  // Access control
  allowlistId: string;

  // Storage
  walrusBlobId: string;

  // Pricing
  price: number; // in MIST

  // Ownership
  seller: string; // address

  // Stats
  salesCount: number;
  createdAt: number; // epoch

  // Seal encryption metadata
  sealThreshold: number;
  sealKemType: number;
  sealDemType: number;
}

/**
 * Allowlist structure
 */
export interface AllowlistData {
  id: string;
  name: string;
  list: string[]; // addresses with access
}

/**
 * Display-friendly dataset with computed fields
 */
export interface DatasetDisplay extends Dataset {
  // Computed display fields
  formattedPrice: string;
  priceInSui: number;
  tags?: string[];
  type?: AssetType;
  featured?: boolean;
  ownerDisplay?: {
    address: string;
    ens?: string;
    avatar?: string;
  };
}

/**
 * Purchase event
 */
export interface PurchaseEvent {
  datasetId: string;
  buyer: string;
  seller: string;
  price: number;
  timestamp: number;
}

/**
 * Dataset published event
 */
export interface DatasetPublishedEvent {
  datasetId: string;
  seller: string;
  allowlistId: string;
  walrusBlobId: string;
  price: number;
  timestamp: number;
}

/**
 * Query filters for browsing datasets
 */
export interface DatasetFilters {
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string; // search in title/description
  sortBy?: 'price' | 'sales' | 'created';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination
 */
export interface PaginationParams {
  limit: number;
  cursor?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}
