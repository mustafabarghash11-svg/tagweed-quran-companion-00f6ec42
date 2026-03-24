import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toArabicNumeral } from '@/lib/quran-api';

interface SearchAyah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

interface SearchResult {
  count: number;
  matches: SearchAyah[];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/quran-uthmani`
      );
      const json = await res.json();
      if (json.code === 200) {
        setResults(json.data as SearchResult);
      } else {
        setResults({ count: 0, matches: [] });
      }
    } catch {
      setError('حدث خطأ أثناء البحث');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    try {
      const regex = new RegExp(`(${q})`, 'g');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-primary transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في القرآن الكريم..."
              className="pr-9 font-ui text-right"
              dir="rtl"
            />
          </div>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Idle state */}
        {!debouncedQuery && !isLoading && (
          <p className="mt-12 text-center font-ui text-muted-foreground">
            اكتب كلمة أو جزءاً من آية للبحث
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-8 text-center font-ui text-destructive">{error}</p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && results && results.count === 0 && (
          <p className="mt-12 text-center font-ui text-muted-foreground">
            لا توجد نتائج لـ «{debouncedQuery}»
          </p>
        )}

        {/* Results */}
        {!isLoading && results && results.count > 0 && (
          <>
            <p className="mb-3 font-ui text-sm text-muted-foreground">
              {toArabicNumeral(results.count)} نتيجة
            </p>
            <div className="space-y-2">
              {results.matches.map((ayah) => (
                <Link
                  key={ayah.number}
                  to={`/page/${ayah.page}`}
                  className="block rounded-xl border border-primary/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-ui text-sm font-bold text-primary">
                      {ayah.surah.name}
                    </span>
                    <span className="font-ui text-xs text-muted-foreground">
                      آية {toArabicNumeral(ayah.numberInSurah)} · صفحة {toArabicNumeral(ayah.page)}
                    </span>
                  </div>
                  <p className="font-quran text-lg leading-relaxed text-right text-foreground">
                    {highlightMatch(ayah.text, debouncedQuery)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
