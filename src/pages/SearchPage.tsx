import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2, BookOpen, BookMarked, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toArabicNumeral } from '@/lib/quran-api';
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
  { number: 1, name: 'الجزء الأول', startPage: 1 },
  { number: 2, name: 'الجزء الثاني', startPage: 22 },
  { number: 3, name: 'الجزء الثالث', startPage: 42 },
  { number: 4, name: 'الجزء الرابع', startPage: 62 },
  { number: 5, name: 'الجزء الخامس', startPage: 82 },
  { number: 6, name: 'الجزء السادس', startPage: 102 },
  { number: 7, name: 'الجزء السابع', startPage: 122 },
  { number: 8, name: 'الجزء الثامن', startPage: 142 },
  { number: 9, name: 'الجزء التاسع', startPage: 162 },
  { number: 10, name: 'الجزء العاشر', startPage: 182 },
  { number: 11, name: 'الجزء الحادي عشر', startPage: 202 },
  { number: 12, name: 'الجزء الثاني عشر', startPage: 222 },
  { number: 13, name: 'الجزء الثالث عشر', startPage: 242 },
  { number: 14, name: 'الجزء الرابع عشر', startPage: 262 },
  { number: 15, name: 'الجزء الخامس عشر', startPage: 282 },
  { number: 16, name: 'الجزء السادس عشر', startPage: 302 },
  { number: 17, name: 'الجزء السابع عشر', startPage: 322 },
  { number: 18, name: 'الجزء الثامن عشر', startPage: 342 },
  { number: 19, name: 'الجزء التاسع عشر', startPage: 362 },
  { number: 20, name: 'الجزء العشرون', startPage: 382 },
  { number: 21, name: 'الجزء الحادي والعشرون', startPage: 402 },
  { number: 22, name: 'الجزء الثاني والعشرون', startPage: 422 },
  { number: 23, name: 'الجزء الثالث والعشرون', startPage: 442 },
  { number: 24, name: 'الجزء الرابع والعشرون', startPage: 462 },
  { number: 25, name: 'الجزء الخامس والعشرون', startPage: 482 },
  { number: 26, name: 'الجزء السادس والعشرون', startPage: 502 },
  { number: 27, name: 'الجزء السابع والعشرون', startPage: 522 },
  { number: 28, name: 'الجزء الثامن والعشرون', startPage: 542 },
  { number: 29, name: 'الجزء التاسع والعشرون', startPage: 562 },
  { number: 30, name: 'الجزء الثلاثون (جزء عم)', startPage: 582 },
];

// بيانات أول صفحة لكل سورة (بدون API)
const SURAH_START_PAGES_LOCAL: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305,
  20: 312, 21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385,
  29: 396, 30: 404, 31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446,
  38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502,
  47: 507, 48: 511, 49: 514, 50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531,
  56: 534, 57: 537, 58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556,
  65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572, 73: 574,
  74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586, 82: 587,
  83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594, 91: 595,
  92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602,
  109: 603, 110: 603, 111: 603, 112: 604, 113: 604, 114: 604
};

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
  const searchLocal = () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const newResults: SearchResult[] = [];
    const lowerQuery = query.trim().toLowerCase();

    // 1. البحث في السور
    if (filter === 'all' || filter === 'surah') {
      surahs?.forEach((surah) => {
        const surahName = surah.name.toLowerCase();
        const surahEng = surah.englishName.toLowerCase();
        const surahNumber = surah.number.toString();
        
        if (
          surahName.includes(lowerQuery) || 
          surahEng.includes(lowerQuery) ||
          surahNumber === lowerQuery
        ) {
          const startPage = SURAH_START_PAGES_LOCAL[surah.number] || 1;
          newResults.push({
            type: 'surah',
            title: surah.name,
            subtitle: `${surah.englishName} · ${toArabicNumeral(surah.numberOfAyahs)} آية · ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
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
        const juzNumberOnly = juz.number.toString();
        
        if (
          juzName.includes(lowerQuery) || 
          juzNumber.includes(lowerQuery) ||
          juzNumberOnly === lowerQuery
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

    // ترتيب النتائج
    newResults.sort((a, b) => a.number - b.number);
    setResults(newResults);
    setIsLoading(false);
  };

  // البحث عند تغيير النص أو الفلتر
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocal();
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
