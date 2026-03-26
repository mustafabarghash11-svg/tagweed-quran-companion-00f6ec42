import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2, BookOpen, BookMarked, Filter, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toArabicNumeral, SURAH_START_PAGES } from '@/lib/quran-api';
import { useSurahs } from '@/hooks/use-quran';

interface SearchResult {
  type: 'surah' | 'juz';
  title: string;
  subtitle: string;
  link: string;
  number: number;
}

// بيانات الأجزاء كاملة
const JUZ_DATA = [
  { number: 1, name: 'الجزء الأول', startPage: 1, startSurah: 1 },
  { number: 2, name: 'الجزء الثاني', startPage: 22, startSurah: 2 },
  { number: 3, name: 'الجزء الثالث', startPage: 42, startSurah: 2 },
  { number: 4, name: 'الجزء الرابع', startPage: 62, startSurah: 3 },
  { number: 5, name: 'الجزء الخامس', startPage: 82, startSurah: 4 },
  { number: 6, name: 'الجزء السادس', startPage: 102, startSurah: 4 },
  { number: 7, name: 'الجزء السابع', startPage: 122, startSurah: 5 },
  { number: 8, name: 'الجزء الثامن', startPage: 142, startSurah: 6 },
  { number: 9, name: 'الجزء التاسع', startPage: 162, startSurah: 7 },
  { number: 10, name: 'الجزء العاشر', startPage: 182, startSurah: 8 },
  { number: 11, name: 'الجزء الحادي عشر', startPage: 202, startSurah: 9 },
  { number: 12, name: 'الجزء الثاني عشر', startPage: 222, startSurah: 10 },
  { number: 13, name: 'الجزء الثالث عشر', startPage: 242, startSurah: 11 },
  { number: 14, name: 'الجزء الرابع عشر', startPage: 262, startSurah: 12 },
  { number: 15, name: 'الجزء الخامس عشر', startPage: 282, startSurah: 13 },
  { number: 16, name: 'الجزء السادس عشر', startPage: 302, startSurah: 15 },
  { number: 17, name: 'الجزء السابع عشر', startPage: 322, startSurah: 17 },
  { number: 18, name: 'الجزء الثامن عشر', startPage: 342, startSurah: 18 },
  { number: 19, name: 'الجزء التاسع عشر', startPage: 362, startSurah: 19 },
  { number: 20, name: 'الجزء العشرون', startPage: 382, startSurah: 20 },
  { number: 21, name: 'الجزء الحادي والعشرون', startPage: 402, startSurah: 21 },
  { number: 22, name: 'الجزء الثاني والعشرون', startPage: 422, startSurah: 22 },
  { number: 23, name: 'الجزء الثالث والعشرون', startPage: 442, startSurah: 23 },
  { number: 24, name: 'الجزء الرابع والعشرون', startPage: 462, startSurah: 24 },
  { number: 25, name: 'الجزء الخامس والعشرون', startPage: 482, startSurah: 25 },
  { number: 26, name: 'الجزء السادس والعشرون', startPage: 502, startSurah: 26 },
  { number: 27, name: 'الجزء السابع والعشرون', startPage: 522, startSurah: 27 },
  { number: 28, name: 'الجزء الثامن والعشرون', startPage: 542, startSurah: 28 },
  { number: 29, name: 'الجزء التاسع والعشرون', startPage: 562, startSurah: 29 },
  { number: 30, name: 'الجزء الثلاثون (جزء عم)', startPage: 582, startSurah: 78 },
];

// اقتراحات سريعة
const QUICK_SUGGESTIONS = [
  { label: 'سورة الفاتحة', query: 'الفاتحة', type: 'surah' },
  { label: 'سورة البقرة', query: 'البقرة', type: 'surah' },
  { label: 'سورة يس', query: 'يس', type: 'surah' },
  { label: 'سورة الرحمن', query: 'الرحمن', type: 'surah' },
  { label: 'سورة الملك', query: 'الملك', type: 'surah' },
  { label: 'جزء 30', query: 'جزء 30', type: 'juz' },
  { label: 'جزء عم', query: 'جزء عم', type: 'juz' },
  { label: 'الجزء الأول', query: 'الجزء الأول', type: 'juz' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'surah' | 'juz'>('all');
  const { data: surahs, isLoading: surahsLoading } = useSurahs();

  // دالة البحث المحلية
  const searchLocal = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const newResults: SearchResult[] = [];
    const lowerQuery = searchQuery.trim().toLowerCase();

    // 1. البحث في السور
    if (filter === 'all' || filter === 'surah') {
      surahs?.forEach((surah) => {
        const surahName = surah.name.toLowerCase();
        const surahEng = surah.englishName.toLowerCase();
        // البحث بالاسم العربي أو الإنجليزي أو بالرقم
        if (
          surahName.includes(lowerQuery) || 
          surahEng.includes(lowerQuery) ||
          (surah.number === parseInt(lowerQuery))
        ) {
          const startPage = surah.number === 1 ? 1 : SURAH_START_PAGES[surah.number - 1];
          newResults.push({
            type: 'surah',
            title: surah.name,
            subtitle: `سورة ${surah.name} · ${toArabicNumeral(surah.numberOfAyahs)} آية · ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
            link: `/page/${startPage}`,
            number: surah.number
          });
        }
      });
    }

    // 2. البحث في الأجزاء
    if (filter === 'all' || filter === 'juz') {
      JUZ_DATA.forEach((juz) => {
        const juzName = juz.name.toLowerCase();
        const juzNumber = `جزء ${juz.number}`;
        // البحث بالاسم أو بالرقم
        if (
          juzName.includes(lowerQuery) || 
          juzNumber.includes(lowerQuery) ||
          (juz.number === parseInt(lowerQuery))
        ) {
          newResults.push({
            type: 'juz',
            title: juz.name,
            subtitle: `يبدأ من صفحة ${toArabicNumeral(juz.startPage)}`,
            link: `/page/${juz.startPage}`,
            number: juz.number
          });
        }
      });
    }

    // ترتيب النتائج حسب النوع والأولوية
    newResults.sort((a, b) => {
      if (a.type === 'surah' && b.type !== 'surah') return -1;
      if (a.type !== 'surah' && b.type === 'surah') return 1;
      return a.number - b.number;
    });

    setResults(newResults);
    setIsLoading(false);
  };

  // البحث عند تغيير النص أو الفلتر
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchLocal(query);
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filter, surahs]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'surah': return <BookOpen className="h-5 w-5 text-emerald-500" />;
      case 'juz': return <BookMarked className="h-5 w-5 text-amber-500" />;
      default: return <Search className="h-5 w-5 text-primary" />;
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case 'surah': return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">سورة</span>;
      case 'juz': return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">جزء</span>;
      default: return null;
    }
  };

  const handleSuggestion = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    searchLocal(suggestionQuery);
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن سورة أو جزء (مثال: البقرة، يس، جزء 30)..."
              className="pr-9 font-ui text-right"
              dir="rtl"
            />
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="sticky top-[61px] z-40 border-b border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl gap-1 px-4 py-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'surah', label: 'سور' },
            { id: 'juz', label: 'أجزاء' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 rounded-lg py-2 font-ui text-sm transition-colors ${
                filter === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Idle state */}
        {!query && !isLoading && (
          <div className="mt-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-ui text-muted-foreground">
              ابحث عن سورة أو جزء من القرآن الكريم
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.query}
                  onClick={() => handleSuggestion(suggestion.query)}
                  className="rounded-full border border-primary/20 px-3 py-1 text-sm hover:bg-primary/10 transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {(isLoading || surahsLoading) && (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && !surahsLoading && query && results.length === 0 && (
          <div className="mt-12 text-center">
            <X className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-ui text-muted-foreground">
              لا توجد نتائج لـ «{query}»
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-2">
              جرب اسم سورة آخر أو رقم جزء (مثال: البقرة، يس، جزء 30)
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !surahsLoading && results.length > 0 && (
          <>
            <p className="mb-3 font-ui text-sm text-muted-foreground">
              {toArabicNumeral(results.length)} نتيجة
            </p>
            <div className="space-y-2">
              {results.map((result, idx) => (
                <Link
                  key={`${result.type}-${result.number}-${idx}`}
                  to={result.link}
                  className="block rounded-xl border border-primary/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getResultBadge(result.type)}
                        <h3 className="font-ui text-base font-bold text-foreground">
                          {result.title}
                        </h3>
                      </div>
                      <p className="font-ui text-sm text-muted-foreground">
                        {result.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
   }
