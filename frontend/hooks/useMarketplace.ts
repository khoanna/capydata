/**
 * React hooks for marketplace data
 * Provides real-time on-chain data with React Query caching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { MarketplaceAPI } from '@/lib/marketplace-api';
import type { DatasetFilters, PaginationParams } from '@/lib/types';

/**
 * Hook to get marketplace API instance
 */
function useMarketplaceAPI() {
  const client = useSuiClient();
  return new MarketplaceAPI(client);
}

/**
 * Get dataset by ID
 */
export function useDataset(id: string | undefined) {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['dataset', id],
    queryFn: () => (id ? api.getDatasetById(id) : null),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get all datasets (paginated, filterable)
 */
export function useDatasets(
  filters?: DatasetFilters,
  pagination?: PaginationParams
) {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['datasets', filters, pagination],
    queryFn: () => api.getAllDatasets(filters, pagination),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get datasets by seller address
 */
export function useDatasetsBySeller(sellerAddress: string | undefined) {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['datasets', 'seller', sellerAddress],
    queryFn: () => (sellerAddress ? api.getDatasetsBySeller(sellerAddress) : []),
    enabled: !!sellerAddress,
    staleTime: 30000,
  });
}

/**
 * Get current user's datasets
 */
export function useMyDatasets() {
  const currentAccount = useCurrentAccount();
  return useDatasetsBySeller(currentAccount?.address);
}

/**
 * Get allowlist by ID
 */
export function useAllowlist(id: string | undefined) {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['allowlist', id],
    queryFn: () => (id ? api.getAllowlistById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Check if current user has access to a dataset
 */
export function useHasAccess(allowlistId: string | undefined) {
  const api = useMarketplaceAPI();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: ['access', allowlistId, currentAccount?.address],
    queryFn: () => {
      if (!allowlistId || !currentAccount?.address) return false;
      return api.hasAccess(allowlistId, currentAccount.address);
    },
    enabled: !!allowlistId && !!currentAccount,
    staleTime: 30000,
  });
}

/**
 * Get purchase events for a dataset
 */
export function usePurchaseEvents(datasetId: string | undefined) {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['purchases', datasetId],
    queryFn: () => (datasetId ? api.getPurchaseEvents(datasetId) : []),
    enabled: !!datasetId,
    staleTime: 60000,
  });
}

/**
 * Get all published dataset events
 */
export function usePublishedEvents() {
  const api = useMarketplaceAPI();

  return useQuery({
    queryKey: ['published-events'],
    queryFn: () => api.getPublishedEvents(),
    staleTime: 60000,
  });
}

/**
 * Invalidate queries after mutations
 */
export function useInvalidateMarketplace() {
  const queryClient = useQueryClient();

  return {
    invalidateDataset: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ['dataset', id] });
    },
    invalidateAllDatasets: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    invalidateAllowlist: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ['allowlist', id] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}
