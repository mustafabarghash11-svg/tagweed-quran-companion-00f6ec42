import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchAllSurahs, fetchPage, fetchJuz } from '@/lib/quran-api';

export function useSurahs() {
  return useQuery({
    queryKey: ['surahs'],
    queryFn: fetchAllSurahs,
    staleTime: Infinity,
  });
}

export function useQuranPage(pageNumber: number) {
  const queryClient = useQueryClient();

  // prefetch الصفحة السابقة والتالية في الخلفية
  useEffect(() => {
    const prev = pageNumber - 1;
    const next = pageNumber + 1;

    if (prev >= 1) {
      queryClient.prefetchQuery({
        queryKey: ['quran-page', prev],
        queryFn: () => fetchPage(prev),
        staleTime: Infinity,
      });
    }
    if (next <= 604) {
      queryClient.prefetchQuery({
        queryKey: ['quran-page', next],
        queryFn: () => fetchPage(next),
        staleTime: Infinity,
      });
    }
  }, [pageNumber, queryClient]);

  return useQuery({
    queryKey: ['quran-page', pageNumber],
    queryFn: () => fetchPage(pageNumber),
    staleTime: Infinity,
    enabled: pageNumber >= 1 && pageNumber <= 604,
  });
}

export function useJuz(juzNumber: number) {
  return useQuery({
    queryKey: ['juz', juzNumber],
    queryFn: () => fetchJuz(juzNumber),
    staleTime: Infinity,
    enabled: juzNumber >= 1 && juzNumber <= 30,
  });
}
