import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toArabicNumeral } from '@/lib/quran-api';
import type { Ayah } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookmarks } from '@/context/BookmarksContext';
import { useAudio } from '@/context/AudioContext';
import { useSettings } from '@/context/SettingsContext';
import { Bookmark, BookmarkCheck, Play, Pause, Languages, BookOpen, X, Loader2 } from 'lucide-react';

interface QuranPageViewProps {
  ayahs?: Ayah[];
  isLoading: boolean;
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

// ========================
// أحكام التجويد — تلوين
// ========================
const TAJWEED_COLORS: Array<{ pattern: RegExp; color: string; label: string }> = [
  { pattern: /([اوي]ٓ|آ)/g, color: '#2563eb', label: 'مد' },
  { pattern: /(نّ|مّ)/g, color: '#16a34a', label: 'غنة' },
  { pattern: /نْ(?=[تثجدذزسشصضطظفقك])/g, color: '#ea580c', label: 'إخفاء' },
  { pattern: /نْ(?=[يرملون])/g, color: '#7c3aed', label: 'إدغام' },
  { pattern: /نْ(?=ب)/g, color: '#dc2626', label: 'إقلاب' },
];

function applyTajweed(text: string): React.ReactNode {
  const segments: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = remaining.length;
    let earliestRule = null as (typeof TAJWEED_COLORS[0]) | null;

    for (const rule of TAJWEED_COLORS) {
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(remaining);
      if (match && match.index < earliest) {
        earliest = match.index;
        earliestRule = rule;
      }
    }

    if (!earliestRule) {
      segments.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliest > 0) {
      segments.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    }

    earliestRule.pattern.lastIndex = earliest;
    const match2 = earliestRule.pattern.exec(remaining);
    if (match2) {
      segments.push(
        <span key={key++} style={{ color: earliestRule.color, fontWeight: 'bold' }}>
          {match2[0]}
        </span>
      );
      remaining = remaining.slice(earliest + match2[0].length);
    } else {
      segments.push(<span key={key++}>{remaining}</span>);
      break;
    }
    for (const rule of TAJWEED_COLORS) rule.pattern.lastIndex = 0;
  }

  return <>{segments}</>;
}

// ========================
// Modal التفسير
// ========================
const TAFSIR_EDITIONS = [
  { id: 'ar.muyassar', label: 'تيسير' },
  { id: 'ar.jalalayn', label: 'جلالين' },
  { id: 'ar.kathir', label: 'ابن كثير' },
  { id: 'en.sahih', label: 'English' },
];

function AyahModal({ ayah, onClose }: { ayah: Ayah; onClose: () => void }) {
  const [edition, setEdition] = useState('ar.muyassar');
  const [tafsirText, setTafsirText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadTafsir = useCallback(async (ed: string) => {
    setEdition(ed);
    setLoading(true);
    setError(false);
    setTafsirText('');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/${ed}`);
      const json = await res.json();
      if (json.code === 200) setTafsirText(json.data.text);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [ayah.number]);

  useEffect(() => { loadTafsir('ar.muyassar'); }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 max-h-[78vh] rounded-t-2xl bg-card shadow-2xl flex flex-col" dir="rtl">
        <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
          <div>
            <h3 className="font-ui text-sm font-bold text-primary">{ayah.surah.name}</h3>
            <p className="font-ui text-xs text-muted-foreground">آية {toArabicNumeral(ayah.numberInSurah)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-primary/10 px-4 py-3 bg-primary/5">
          <p className="font-quran text-xl leading-loose text-right">{ayah.text}</p>
        </div>
        <div className="flex gap-1.5 px-4 py-2 border-b border-primary/10 overflow-x-auto">
          {TAFSIR_EDITIONS.map((ed) => (
            <button key={ed.id} onClick={() => loadTafsir(ed.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-ui text-xs transition-colors ${
                edition === ed.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>
              {ed.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
          {error && <p className="text-center font-ui text-sm text-muted-foreground py-8">تعذر تحميل المحتوى</p>}
          {!loading && !error && tafsirText && (
            <p className="font-ui text-sm leading-relaxed text-right text-foreground" dir={edition === 'en.sahih' ? 'ltr' : 'rtl'}>
              {tafsirText}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ========================
// ترجمة آية (lazy load)
// ========================
const translationCache: Record<number, string> = {};

function AyahTranslation({ ayahNumber }: { ayahNumber: number }) {
  const [text, setText] = useState<string | null>(translationCache[ayahNumber] ?? null);
  const [loading, setLoading] = useState(!translationCache[ayahNumber]);

  useEffect(() => {
    if (translationCache[ayahNumber]) { setText(translationCache[ayahNumber]); setLoading(false); return; }
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.muyassar`)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200) { translationCache[ayahNumber] = json.data.text; setText(json.data.text); }
      })
      .finally(() => setLoading(false));
  }, [ayahNumber]);

  if (loading) return <div className="h-3 bg-muted rounded my-1 animate-pulse" />;
  return text ? (
    <p className="font-ui text-xs text-muted-foreground leading-relaxed text-right mt-1 mb-4 pr-2 border-r-2 border-primary/20" dir="rtl">
      {text}
    </p>
  ) : null;
}

// ========================
// المكوّن الرئيسي
// ========================
export function QuranPageView({ ayahs, isLoading }: QuranPageViewProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { playAyah, togglePlay, nowPlaying, isPlaying } = useAudio();
  const { fontSize } = useSettings();

  const [searchParams] = useSearchParams();
  const highlightAyah = searchParams.get('ayah') ? parseInt(searchParams.get('ayah')!) : null;
  const highlightRef = useRef<HTMLDivElement>(null);

  // scroll للآية المميزة عند التحميل
  useEffect(() => {
    if (!highlightAyah || !highlightRef.current) return;
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    return () => clearTimeout(timer);
  }, [highlightAyah, ayahs]);

  const [showTranslation, setShowTranslation] = useState(false);
  const [showTajweed, setShowTajweed] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = (ayah: Ayah) => {
    pressTimer.current = setTimeout(() => setSelectedAyah(ayah), 500);
  };
  const handlePressEnd = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
      </div>
    );
  }
  if (!ayahs || ayahs.length === 0) return null;

  const surahStarts = new Set<number>();
  let prevSurah = -1;
  for (const ayah of ayahs) {
    if (ayah.surah.number !== prevSurah) {
      if (ayah.numberInSurah === 1) surahStarts.add(ayah.number);
      prevSurah = ayah.surah.number;
    }
  }

  const handleBookmark = (ayah: Ayah) => {
    if (isBookmarked(ayah.number)) removeBookmark(ayah.number);
    else addBookmark({ ayahNumber: ayah.number, numberInSurah: ayah.numberInSurah, surahName: ayah.surah.name, pageNumber: ayah.page, text: ayah.text.slice(0, 80), savedAt: Date.now() });
  };

  const handleAudio = (ayah: Ayah) => {
    if (nowPlaying?.ayahNumber === ayah.number) togglePlay();
    else playAyah({ ayahNumber: ayah.number, numberInSurah: ayah.numberInSurah, surahName: ayah.surah.name });
  };

  return (
    <>
      {/* شريط أدوات العرض */}
      <div className="mx-auto max-w-3xl px-4 pt-3 pb-1 flex items-center justify-end gap-2">
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ui text-xs transition-colors ${
            showTranslation ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Languages className="h-3.5 w-3.5" />
          تيسير
        </button>
        <button
          onClick={() => setShowTajweed((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ui text-xs transition-colors ${
            showTajweed ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          تجويد
        </button>
      </div>

      {/* وسيلة إيضاح التجويد */}
      {showTajweed && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="flex flex-wrap gap-3 rounded-xl bg-muted/50 px-3 py-2">
            {TAJWEED_COLORS.map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1 font-ui text-[10px]">
                <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* نص القرآن */}
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div dir="rtl">
          {ayahs.map((ayah) => {
            const isSurahStart = surahStarts.has(ayah.number);
            const showBismillah = isSurahStart && ayah.surah.number !== 1 && ayah.surah.number !== 9;
            let displayText = ayah.text;
            if (showBismillah && ayah.numberInSurah === 1) displayText = displayText.replace(BISMILLAH, '').trim();

            const bookmarked = isBookmarked(ayah.number);
            const isCurrentAyah = nowPlaying?.ayahNumber === ayah.number;
            const thisIsPlaying = isCurrentAyah && isPlaying;

            return (
              <div
                key={ayah.number}
                ref={highlightAyah === ayah.number ? highlightRef : undefined}
              >
                {isSurahStart && (
                  <div className="my-6 flex flex-col items-center gap-3">
                    <div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-center">
                      <h2 className="font-ui text-xl font-bold text-primary">{ayah.surah.name}</h2>
                    </div>
                    {showBismillah && <p className="font-quran text-xl text-primary/80">{BISMILLAH}</p>}
                  </div>
                )}

                {/* الآية — مزامنة التلاوة */}
                <span
                  className={`inline transition-all duration-300 rounded px-0.5 ${
                    isCurrentAyah
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : highlightAyah === ayah.number
                      ? 'bg-amber-400/20 ring-2 ring-amber-400/50 ring-offset-1'
                      : ''
                  }`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '3' }}
                >
                  <span className="font-quran">
                    {showTajweed ? applyTajweed(displayText) : displayText}
                  </span>
                  <span className="mx-1 inline-flex items-center gap-0.5 align-middle">
                    <span className="font-ui text-base font-bold text-primary">
                      ﴿{toArabicNumeral(ayah.numberInSurah)}﴾
                    </span>
                    <button
                      onClick={() => handleAudio(ayah)}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                        thisIsPlaying ? 'text-primary bg-primary/15' : 'text-primary/60 hover:text-primary hover:bg-primary/10'
                      }`}
                    >
                      {thisIsPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => handleBookmark(ayah)}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-primary/10 ${
                        bookmarked ? 'text-primary' : 'text-primary/40 hover:text-primary'
                      }`}
                    >
                      {bookmarked ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => setSelectedAyah(ayah)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors text-primary/40 hover:text-primary hover:bg-primary/10"
                      title="تفسير الآية"
                    >
                      <BookOpen className="h-3 w-3" />
                    </button>
                  </span>
                </span>

                {/* التفسير الميسّر أسفل الآية */}
                {showTranslation && <AyahTranslation ayahNumber={ayah.number} />}
              </div>
            );
          })}
        </div>
      </div>


      {/* Modal التفسير */}
      {selectedAyah && <AyahModal ayah={selectedAyah} onClose={() => setSelectedAyah(null)} />}
    </>
  );
}
