import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toArabicNumeral } from '@/lib/quran-api';
import { useSurahs } from '@/hooks/use-quran';

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

// بيانات قرآن محلية (سيتم تحميلها عند الحاجة)
let localQuranData: SearchAyah[] | null = null;

async function loadLocalQuran(): Promise<SearchAyah[]> {
  if (localQuranData) return localQuranData;
  
  try {
    // تحميل بيانات القرآن من ملف محلي (يمكن إنشاؤه لاحقاً)
    // مؤقتاً: نستخدم API لجلب البيانات وتخزينها محلياً
    const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    const json = await response.json();
    
    const ayahs: SearchAyah[] = [];
    let ayahNumber = 1;
    
    for (const surah of json.data.surahs) {
      for (const ayah of surah.ayahs) {
        ayahs.push({
          number: ayahNumber++,
          text: ayah.text,
          numberInSurah: ayah.numberInSurah,
          page: ayah.page || Math.ceil(ayahNumber / 15), // تقدير رقم الصفحة
          surah: {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
          },
        });
      }
    }
    
    localQuranData = ayahs;
    return ayahs;
  } catch (error) {
    console.error('فشل تحميل بيانات القرآن:', error);
    return [];
  }
}

function searchLocal(q: string, data: SearchAyah[]): SearchAyah[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  
  return data.filter(ayah => {
    // بحث في النص (إزالة التشكيل لمطابقة أفضل)
    const cleanText = ayah.text.replace(/[ًٌٍَُِّْ]/g, '').toLowerCase();
    return cleanText.includes(query);
  }).slice(0, 50); // حد أقصى 50 نتيجة
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchAyah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const { data: surahs } = useSurahs();

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // المحاولة الأولى: استخدام API
    if (!useLocalOnly) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثواني مهلة
        
        const res = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/quran-uthmani`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        const json = await res.json();
        if (json.code === 200 && json.data?.matches?.length > 0) {
          setResults(json.data.matches);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.log('API search failed, using local search', err.message);
        // فشل API → نستخدم البحث المحلي
        setUseLocalOnly(true);
      }
    }
    
    // البحث المحلي
    try {
      const localData = await loadLocalQuran();
      const localResults = searchLocal(q, localData);
      setResults(localResults);
      if (localResults.length === 0 && !useLocalOnly) {
        setError('لا توجد نتائج. جرب كلمة أخرى.');
      }
    } catch (err) {
      setError('حدث خطأ في البحث. تأكد من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  }, [useLocalOnly]);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    try {
      // إزالة التشكيل من النص قبل البحث
      const cleanText = text.replace(/[ًٌٍَُِّْ]/g, '');
      const regex = new RegExp(`(${q})`, 'gi');
      const parts = cleanText.split(regex);
      
      // إعادة بناء النص مع التشكيل الأصلي
      let result: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let matchIndex = 0;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (regex.test(part)) {
          // البحث عن النص الأصلي مع التشكيل
          const originalMatch = text.slice(lastIndex, lastIndex + part.length + (text[lastIndex + part.length]?.match(/[ًٌٍَُِّْ]/) ? 1 : 0));
          result.push(
            <mark key={matchIndex++} className="bg-primary/20 text-primary rounded px-0.5">
              {originalMatch}
            </mark>
          );
          lastIndex += part.length;
        } else if (part) {
          result.push(part);
          lastIndex += part.length;
        }
      }
      
      return result.length ? result : text;
    } catch {
      return text;
    }
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
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
          <div className="mt-8 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="font-ui text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && debouncedQuery && results.length === 0 && !error && (
          <p className="mt-12 text-center font-ui text-muted-foreground">
            لا توجد نتائج لـ «{debouncedQuery}»
          </p>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <>
            <p className="mb-3 font-ui text-sm text-muted-foreground">
              {toArabicNumeral(results.length)} نتيجة
            </p>
            <div className="space-y-2">
              {results.map((ayah) => (
                <Link
                  key={ayah.number}
                  to={`/page/${ayah.page}`}
                  className="block rounded-xl border border-primary/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                    <span className="font-ui text-sm font-bold text-primary">
                      {ayah.surah.name}
                    </span>
                    <span className="font-ui text-xs text-muted-foreground">
                      آية {toArabicNumeral(ayah.numberInSurah)} · صفحة {toArabicNumeral(ayah.page)}
                    </span>
                  </div>
                  <p className="font-quran text-lg leading-loose text-right text-foreground">
                    {highlightMatch(ayah.text, debouncedQuery)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* إعادة محاولة البحث */}
        {error && (
          <button
            onClick={() => {
              setUseLocalOnly(false);
              doSearch(debouncedQuery);
            }}
            className="mt-4 w-full rounded-xl border border-primary/20 py-2 text-center font-ui text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
      }
