import { QueryClient } from '@tanstack/react-query';

// Create a client with performance optimizations
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time to consider data stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time to keep unused data in cache (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (only if data is stale)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay
      retryDelay: 1000,
    },
  },
});

// Prefetch function for critical data
export const prefetchData = async (queryKey, queryFn) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
  });
};

// Invalidate and refetch function
export const invalidateAndRefetch = async (queryKey) => {
  await queryClient.invalidateQueries({ queryKey });
};

// Optimistic updates helper
export const optimisticUpdate = (queryKey, updater) => {
  return queryClient.setQueryData(queryKey, updater);
};

// Cache management
export const clearCache = () => {
  queryClient.clear();
};

export const removeFromCache = (queryKey) => {
  queryClient.removeQueries({ queryKey });
};
