import { useQuery } from '@tanstack/react-query';
import { fetchAllSurahs, fetchPage, fetchJuz } from '@/lib/quran-api';

export function useSurahs() {
  return useQuery({
    queryKey: ['surahs'],
    queryFn: fetchAllSurahs,
    staleTime: Infinity,
  });
}

export function useQuranPage(pageNumber: number) {
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
