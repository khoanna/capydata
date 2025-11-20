/**
 * Marketplace API - Fetches real on-chain data
 * Replaces mock data with actual blockchain queries
 */

import { SuiClient } from '@mysten/sui/client';
import { config } from './config';
import type {
  Dataset,
  DatasetDisplay,
  AllowlistData,
  DatasetFilters,
  PaginationParams,
  PaginatedResponse,
  PurchaseEvent,
  DatasetPublishedEvent,
} from './types';

const MIST_PER_SUI = 1_000_000_000;

export class MarketplaceAPI {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  /**
   * Get dataset by ID
   */
  async getDatasetById(id: string): Promise<Dataset | null> {
    try {
      const object = await this.client.getObject({
        id,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;

      return {
        id: object.data.objectId,
        title: fields.title,
        description: fields.description,
        allowlistId: fields.allowlist_id,
        walrusBlobId: fields.walrus_blob_id,
        price: parseInt(fields.price),
        seller: fields.seller,
        salesCount: parseInt(fields.sales_count),
        createdAt: parseInt(fields.created_at),
        sealThreshold: parseInt(fields.seal_threshold),
        sealKemType: parseInt(fields.seal_kem_type),
        sealDemType: parseInt(fields.seal_dem_type),
      };
    } catch (error) {
      console.error('Error fetching dataset:', error);
      return null;
    }
  }

  /**
   * Get all datasets (paginated)
   */
  async getAllDatasets(
    filters?: DatasetFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DatasetDisplay>> {
    try {
      // Query all Dataset objects
      const response = await this.client.getOwnedObjects({
        filter: {
          StructType: `${config.marketplacePackageId}::marketplace::Dataset`,
        },
        options: {
          showContent: true,
          showOwner: true,
        },
        limit: pagination?.limit || 50,
        cursor: pagination?.cursor,
      });

      const datasets: DatasetDisplay[] = [];

      for (const item of response.data) {
        if (item.data?.content && item.data.content.dataType === 'moveObject') {
          const fields = item.data.content.fields as any;

          const dataset: Dataset = {
            id: item.data.objectId,
            title: fields.title,
            description: fields.description,
            allowlistId: fields.allowlist_id,
            walrusBlobId: fields.walrus_blob_id,
            price: parseInt(fields.price),
            seller: fields.seller,
            salesCount: parseInt(fields.sales_count),
            createdAt: parseInt(fields.created_at),
            sealThreshold: parseInt(fields.seal_threshold),
            sealKemType: parseInt(fields.seal_kem_type),
            sealDemType: parseInt(fields.seal_dem_type),
          };

          // Apply filters
          if (filters) {
            if (filters.seller && dataset.seller !== filters.seller) continue;
            if (filters.minPrice && dataset.price < filters.minPrice) continue;
            if (filters.maxPrice && dataset.price > filters.maxPrice) continue;
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              if (
                !dataset.title.toLowerCase().includes(searchLower) &&
                !dataset.description.toLowerCase().includes(searchLower)
              ) {
                continue;
              }
            }
          }

          datasets.push(this.toDatasetDisplay(dataset));
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        datasets.sort((a, b) => {
          let aVal: number, bVal: number;
          if (filters.sortBy === 'price') {
            aVal = a.price;
            bVal = b.price;
          } else if (filters.sortBy === 'sales') {
            aVal = a.salesCount;
            bVal = b.salesCount;
          } else {
            aVal = a.createdAt;
            bVal = b.createdAt;
          }

          return filters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });
      }

      return {
        data: datasets,
        hasMore: response.hasNextPage,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error fetching datasets:', error);
      return {
        data: [],
        hasMore: false,
      };
    }
  }

  /**
   * Get datasets by seller
   */
  async getDatasetsBySeller(sellerAddress: string): Promise<DatasetDisplay[]> {
    const response = await this.getAllDatasets({ seller: sellerAddress });
    return response.data;
  }

  /**
   * Get allowlist by ID
   */
  async getAllowlistById(id: string): Promise<AllowlistData | null> {
    try {
      const object = await this.client.getObject({
        id,
        options: {
          showContent: true,
        },
      });

      if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;

      return {
        id: object.data.objectId,
        name: fields.name,
        list: fields.list || [],
      };
    } catch (error) {
      console.error('Error fetching allowlist:', error);
      return null;
    }
  }

  /**
   * Check if address has access to dataset
   */
  async hasAccess(allowlistId: string, address: string): Promise<boolean> {
    const allowlist = await this.getAllowlistById(allowlistId);
    if (!allowlist) return false;
    return allowlist.list.includes(address);
  }

  /**
   * Get purchase events for a dataset
   */
  async getPurchaseEvents(datasetId: string): Promise<PurchaseEvent[]> {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${config.marketplacePackageId}::marketplace::Purchase`,
        },
      });

      const purchases: PurchaseEvent[] = [];

      for (const event of events.data) {
        const fields = event.parsedJson as any;
        if (fields.dataset_id === datasetId) {
          purchases.push({
            datasetId: fields.dataset_id,
            buyer: fields.buyer,
            seller: fields.seller,
            price: parseInt(fields.price),
            timestamp: parseInt(event.timestampMs || '0'),
          });
        }
      }

      return purchases;
    } catch (error) {
      console.error('Error fetching purchase events:', error);
      return [];
    }
  }

  /**
   * Get all published datasets events
   */
  async getPublishedEvents(): Promise<DatasetPublishedEvent[]> {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${config.marketplacePackageId}::marketplace::DatasetPublished`,
        },
      });

      return events.data.map((event) => {
        const fields = event.parsedJson as any;
        return {
          datasetId: fields.dataset_id,
          seller: fields.seller,
          allowlistId: fields.allowlist_id,
          walrusBlobId: fields.walrus_blob_id,
          price: parseInt(fields.price),
          timestamp: parseInt(event.timestampMs || '0'),
        };
      });
    } catch (error) {
      console.error('Error fetching published events:', error);
      return [];
    }
  }

  /**
   * Convert Dataset to DatasetDisplay with computed fields
   */
  private toDatasetDisplay(dataset: Dataset): DatasetDisplay {
    const priceInSui = dataset.price / MIST_PER_SUI;

    return {
      ...dataset,
      formattedPrice: `${priceInSui.toLocaleString()} SUI`,
      priceInSui,
      ownerDisplay: {
        address: dataset.seller,
      },
    };
  }
}

/**
 * Utility: Format MIST to SUI
 */
export function mistToSui(mist: number): number {
  return mist / MIST_PER_SUI;
}

/**
 * Utility: Format SUI to MIST
 */
export function suiToMist(sui: number): number {
  return Math.floor(sui * MIST_PER_SUI);
}
