import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface Entity {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Custom hook for fetching entity data with caching
 * Uses lightweight endpoints for better performance
 */
export function useEntityData<T = Entity[]>(
  entityType: 'dairy' | 'bmc' | 'society' | 'farmer' | 'machine',
  lightweight: boolean = true,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  const endpoint = lightweight 
    ? `/api/user/${entityType}/list` 
    : `/api/user/${entityType}`;

  return useQuery<T, Error>({
    queryKey: [entityType, lightweight ? 'list' : 'full'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType} data`);
      }

      const result: ApiResponse<T> = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook for fetching multiple entity types in parallel
 */
export function useDashboardData() {
  const dairies = useEntityData('dairy', true);
  const bmcs = useEntityData('bmc', true);
  const societies = useEntityData('society', true);

  return {
    dairies,
    bmcs,
    societies,
    isLoading: dairies.isLoading || bmcs.isLoading || societies.isLoading,
    isError: dairies.isError || bmcs.isError || societies.isError,
    error: dairies.error || bmcs.error || societies.error,
  };
}

/**
 * Hook for fetching analytics data with caching
 * Caches for 10 minutes to reduce server load
 */
export function useAnalytics(params: {
  days?: number;
  from?: string;
  to?: string;
  dairy?: string[];
  bmc?: string[];
  society?: string[];
  machine?: string[];
  channel?: string;
  shift?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (params.days) queryParams.set('days', params.days.toString());
  if (params.from) queryParams.set('from', params.from);
  if (params.to) queryParams.set('to', params.to);
  if (params.dairy?.length) queryParams.set('dairy', params.dairy.join(','));
  if (params.bmc?.length) queryParams.set('bmc', params.bmc.join(','));
  if (params.society?.length) queryParams.set('society', params.society.join(','));
  if (params.machine?.length) queryParams.set('machine', params.machine.join(','));
  if (params.channel) queryParams.set('channel', params.channel);
  if (params.shift) queryParams.set('shift', params.shift);

  return useQuery({
    queryKey: ['analytics', params],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/user/analytics?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - analytics data doesn't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

/**
 * Hook for fetching user profile with caching
 * Caches for 5 minutes to reduce repeated profile fetches
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
