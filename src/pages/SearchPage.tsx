import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2, BookOpen, BookMarked, FileText, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toArabicNumeral } from '@/lib/quran-api';
import { useSurahs } from '@/hooks/use-quran';

// ─── أنواع النتائج ───────────────────────────────────────
interface SurahResult  { type: 'surah'; title: string; subtitle: string; link: string; number: number; }
interface JuzResult    { type: 'juz';   title: string; subtitle: string; link: string; number: number; }
interface AyahResult   { type: 'ayah';  text: string;  surahName: string; numberInSurah: number; page: number; ayahNumber: number; }
type SearchResult = SurahResult | JuzResult | AyahResult;

// ─── بيانات ثابتة ──────────────────────────────────────
const JUZ_DATA = [
  { number: 1,  name: 'الجزء الأول',                    startPage: 1   },
  { number: 2,  name: 'الجزء الثاني',                   startPage: 22  },
  { number: 3,  name: 'الجزء الثالث',                   startPage: 42  },
  { number: 4,  name: 'الجزء الرابع',                   startPage: 62  },
  { number: 5,  name: 'الجزء الخامس',                   startPage: 82  },
  { number: 6,  name: 'الجزء السادس',                   startPage: 102 },
  { number: 7,  name: 'الجزء السابع',                   startPage: 122 },
  { number: 8,  name: 'الجزء الثامن',                   startPage: 142 },
  { number: 9,  name: 'الجزء التاسع',                   startPage: 162 },
  { number: 10, name: 'الجزء العاشر',                   startPage: 182 },
  { number: 11, name: 'الجزء الحادي عشر',               startPage: 202 },
  { number: 12, name: 'الجزء الثاني عشر',               startPage: 222 },
  { number: 13, name: 'الجزء الثالث عشر',               startPage: 242 },
  { number: 14, name: 'الجزء الرابع عشر',               startPage: 262 },
  { number: 15, name: 'الجزء الخامس عشر',               startPage: 282 },
  { number: 16, name: 'الجزء السادس عشر',               startPage: 302 },
  { number: 17, name: 'الجزء السابع عشر',               startPage: 322 },
  { number: 18, name: 'الجزء الثامن عشر',               startPage: 342 },
  { number: 19, name: 'الجزء التاسع عشر',               startPage: 362 },
  { number: 20, name: 'الجزء العشرون',                  startPage: 382 },
  { number: 21, name: 'الجزء الحادي والعشرون',          startPage: 402 },
  { number: 22, name: 'الجزء الثاني والعشرون',          startPage: 422 },
  { number: 23, name: 'الجزء الثالث والعشرون',          startPage: 442 },
  { number: 24, name: 'الجزء الرابع والعشرون',          startPage: 462 },
  { number: 25, name: 'الجزء الخامس والعشرون',          startPage: 482 },
  { number: 26, name: 'الجزء السادس والعشرون',          startPage: 502 },
  { number: 27, name: 'الجزء السابع والعشرون',          startPage: 522 },
  { number: 28, name: 'الجزء الثامن والعشرون',          startPage: 542 },
  { number: 29, name: 'الجزء التاسع والعشرون',          startPage: 562 },
  { number: 30, name: 'الجزء الثلاثون (جزء عم)',        startPage: 582 },
];

const SURAH_START_PAGES: Record<number, number> = {
  1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,
  11:221,12:235,13:249,14:255,15:262,16:267,17:282,18:293,19:305,
  20:312,21:322,22:332,23:342,24:350,25:359,26:367,27:377,28:385,
  29:396,30:404,31:411,32:415,33:418,34:428,35:434,36:440,37:446,
  38:453,39:458,40:467,41:477,42:483,43:489,44:496,45:499,46:502,
  47:507,48:511,49:514,50:518,51:520,52:523,53:526,54:528,55:531,
  56:534,57:537,58:542,59:545,60:549,61:551,62:553,63:554,64:556,
  65:558,66:560,67:562,68:564,69:566,70:568,71:570,72:572,73:574,
  74:575,75:577,76:578,77:580,78:582,79:583,80:585,81:586,82:587,
  83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,91:595,
  92:595,93:596,94:596,95:597,96:597,97:598,98:598,99:599,100:599,
  101:600,102:600,103:601,104:601,105:601,106:602,107:602,108:602,
  109:603,110:603,111:603,112:604,113:604,114:604,
};

const QUICK_SUGGESTIONS = [
  { label: 'الفاتحة', query: 'الفاتحة' },
  { label: 'البقرة', query: 'البقرة' },
  { label: 'يس', query: 'يس' },
  { label: 'الرحمن', query: 'الرحمن' },
  { label: 'الملك', query: 'الملك' },
  { label: 'جزء 30', query: 'جزء 30' },
  { label: 'جزء عم', query: 'جزء عم' },
];

// ─── تطبيع النص للمقارنة (حذف التشكيل والهمزات) ──────────
function normalize(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '')       // تشكيل
    .replace(/[إأآٱ]/g, 'ا')           // همزات
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ─── تظليل الكلمة المطابقة في النص ───────────────────────
function highlightMatch(text: string, query: string): React.ReactNode {
  const normText = normalize(text);
  const normQuery = normalize(query);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return <span className="font-quran text-sm leading-loose">{text}</span>;
  return (
    <span className="font-quran text-sm leading-loose">
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-primary rounded px-0.5 not-italic">{text.slice(idx, idx + normQuery.length)}</mark>
      {text.slice(idx + normQuery.length)}
    </span>
  );
}

// ─── Cache الآيات ─────────────────────────────────────────
let quranCache: AyahResult[] | null = null;
let quranLoading = false;
const quranListeners: Array<() => void> = [];

async function loadQuranData(): Promise<AyahResult[]> {
  if (quranCache) return quranCache;
  if (quranLoading) {
    return new Promise((resolve) => {
      quranListeners.push(() => resolve(quranCache!));
    });
  }
  quranLoading = true;
  const res = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
  const json = await res.json();
  const ayahs: AyahResult[] = [];
  for (const surah of json.data.surahs) {
    for (const ayah of surah.ayahs) {
      ayahs.push({
        type: 'ayah',
        text: ayah.text,
        surahName: surah.name,
        numberInSurah: ayah.numberInSurah,
        page: ayah.page,
        ayahNumber: ayah.number,
      });
    }
  }
  quranCache = ayahs;
  quranLoading = false;
  quranListeners.forEach((fn) => fn());
  quranListeners.length = 0;
  return ayahs;
}

function searchAyahs(data: AyahResult[], q: string): AyahResult[] {
  const normQ = normalize(q);
  if (normQ.length < 3) return [];
  return data.filter((a) => normalize(a.text).includes(normQ)).slice(0, 30);
}

// ─── المكوّن الرئيسي ──────────────────────────────────────
export default function SearchPage() {
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState<'all' | 'surah' | 'juz' | 'ayah'>('all');
  const [surahResults, setSurahResults] = useState<SurahResult[]>([]);
  const [juzResults, setJuzResults]     = useState<JuzResult[]>([]);
  const [ayahResults, setAyahResults]   = useState<AyahResult[]>([]);
  const [ayahLoading, setAyahLoading]   = useState(false);
  const [ayahReady, setAyahReady]       = useState(!!quranCache);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: surahs, isLoading: surahsLoading } = useSurahs();

  // تحميل بيانات الآيات في الخلفية عند فتح الصفحة
  useEffect(() => {
    if (!quranCache) {
      loadQuranData().then(() => setAyahReady(true));
    }
  }, []);

  // البحث الفوري في السور والأجزاء (محلي، سريع)
  function searchSurahsAndJuz(q: string) {
    const lq = q.trim().toLowerCase();
    if (!lq || lq.length < 2) { setSurahResults([]); setJuzResults([]); return; }

    const sr: SurahResult[] = [];
    surahs?.forEach((s) => {
      if (
        normalize(s.name).includes(normalize(lq)) ||
        s.englishName.toLowerCase().includes(lq) ||
        s.number.toString() === lq
      ) {
        sr.push({
          type: 'surah',
          title: s.name,
          subtitle: `${s.englishName} · ${toArabicNumeral(s.numberOfAyahs)} آية · ${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
          link: `/page/${SURAH_START_PAGES[s.number] ?? 1}`,
          number: s.number,
        });
      }
    });

    const jr: JuzResult[] = [];
    JUZ_DATA.forEach((j) => {
      if (
        normalize(j.name).includes(normalize(lq)) ||
        `جزء ${j.number}`.includes(lq) ||
        j.number.toString() === lq
      ) {
        jr.push({
          type: 'juz',
          title: j.name,
          subtitle: `يبدأ من صفحة ${toArabicNumeral(j.startPage)}`,
          link: `/page/${j.startPage}`,
          number: j.number,
        });
      }
    });

    setSurahResults(sr);
    setJuzResults(jr);
  }

  // البحث في الآيات (مع debounce أطول لأنه ثقيل)
  async function searchAyahsAsync(q: string) {
    if (q.trim().length < 3 || (filter !== 'all' && filter !== 'ayah')) {
      setAyahResults([]);
      return;
    }
    setAyahLoading(true);
    try {
      const data = await loadQuranData();
      setAyahReady(true);
      setAyahResults(searchAyahs(data, q));
    } catch {
      setAyahResults([]);
    } finally {
      setAyahLoading(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSurahsAndJuz(query);
      searchAyahsAsync(query);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter, surahs]);

  // ─── حساب النتائج المعروضة حسب الفلتر ──────────────────
  const showSurahs = filter === 'all' || filter === 'surah';
  const showJuz    = filter === 'all' || filter === 'juz';
  const showAyahs  = filter === 'all' || filter === 'ayah';

  const visibleSurahs = showSurahs ? surahResults : [];
  const visibleJuz    = showJuz    ? juzResults    : [];
  const visibleAyahs  = showAyahs  ? ayahResults   : [];
  const totalCount    = visibleSurahs.length + visibleJuz.length + visibleAyahs.length;
  const isSearching   = ayahLoading || surahsLoading;
  const hasQuery      = query.trim().length >= 2;

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
              placeholder="ابحث عن سورة، جزء، أو نص آية..."
              className="pr-9 font-ui text-right"
              dir="rtl"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
        </div>
      </header>

      {/* Filter tabs */}
      <div className="sticky top-[61px] z-40 border-b border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl gap-1 px-4 py-2">
          {([
            { id: 'all',   label: 'الكل' },
            { id: 'surah', label: 'سور' },
            { id: 'juz',   label: 'أجزاء' },
            { id: 'ayah',  label: 'آيات' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
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

      <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">

        {/* Idle */}
        {!hasQuery && (
          <div className="mt-10 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-ui text-sm text-muted-foreground">ابحث في سور القرآن، الأجزاء، أو نص الآيات</p>
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.query}
                  onClick={() => setQuery(s.query)}
                  className="rounded-full border border-primary/20 px-3 py-1 font-ui text-sm hover:bg-primary/10 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* مؤشر تحميل الآيات في الخلفية */}
            {!ayahReady && (
              <p className="mt-4 font-ui text-xs text-muted-foreground/50 flex items-center justify-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                جاري تحميل قاعدة الآيات...
              </p>
            )}
          </div>
        )}

        {/* No results */}
        {hasQuery && !isSearching && totalCount === 0 && (
          <div className="mt-10 text-center">
            <X className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-ui text-muted-foreground">لا توجد نتائج لـ «{query}»</p>
            <p className="font-ui text-xs text-muted-foreground/60 mt-1">جرب كلمة أخرى أو جزءاً من آية</p>
          </div>
        )}

        {/* عدد النتائج */}
        {hasQuery && totalCount > 0 && (
          <p className="font-ui text-sm text-muted-foreground">
            {toArabicNumeral(totalCount)} نتيجة
          </p>
        )}

        {/* ─── نتائج السور ─── */}
        {visibleSurahs.length > 0 && (
          <section>
            <h2 className="font-ui text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> سور
            </h2>
            <div className="space-y-1.5">
              {visibleSurahs.map((r) => (
                <Link key={r.number} to={r.link}
                  className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-ui text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {toArabicNumeral(r.number)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui font-bold text-foreground">{r.title}</p>
                    <p className="font-ui text-xs text-muted-foreground truncate">{r.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── نتائج الأجزاء ─── */}
        {visibleJuz.length > 0 && (
          <section>
            <h2 className="font-ui text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
              <BookMarked className="h-3.5 w-3.5 text-amber-500" /> أجزاء
            </h2>
            <div className="space-y-1.5">
              {visibleJuz.map((r) => (
                <Link key={r.number} to={r.link}
                  className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 font-ui text-sm font-bold text-amber-600 dark:text-amber-400">
                    {toArabicNumeral(r.number)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui font-bold text-foreground">{r.title}</p>
                    <p className="font-ui text-xs text-muted-foreground">{r.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── نتائج الآيات ─── */}
        {showAyahs && (
          <section>
            {/* تحميل */}
            {ayahLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            )}

            {/* لو الآيات لم تتحمل بعد */}
            {!ayahReady && !ayahLoading && hasQuery && filter === 'ayah' && (
              <div className="text-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="font-ui text-sm text-muted-foreground">جاري تحميل قاعدة الآيات...</p>
              </div>
            )}

            {visibleAyahs.length > 0 && !ayahLoading && (
              <>
                <h2 className="font-ui text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-500" /> آيات ({toArabicNumeral(visibleAyahs.length)}{visibleAyahs.length === 30 ? '+' : ''})
                </h2>
                <div className="space-y-1.5">
                  {visibleAyahs.map((r) => (
                    <Link key={r.ayahNumber} to={`/page/${r.page}`}
                      className="block rounded-xl border border-primary/10 bg-card px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-ui text-xs font-bold text-blue-600 dark:text-blue-400">{r.surahName}</span>
                        <span className="font-ui text-xs text-muted-foreground">
                          آية {toArabicNumeral(r.numberInSurah)} · صفحة {toArabicNumeral(r.page)}
                        </span>
                      </div>
                      <p className="text-right leading-loose" dir="rtl">
                        {highlightMatch(r.text, query)}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
