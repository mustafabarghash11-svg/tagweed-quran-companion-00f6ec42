import { toArabicNumeral } from '@/lib/quran-api';
import type { Ayah } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookmarks } from '@/context/BookmarksContext';
import { useAudio } from '@/context/AudioContext';
import { useSettings } from '@/context/SettingsContext';
import { Bookmark, BookmarkCheck, Play, Pause } from 'lucide-react';

interface QuranPageViewProps {
  ayahs?: Ayah[];
  isLoading: boolean;
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

export function QuranPageView({ ayahs, isLoading }: QuranPageViewProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { playAyah, togglePlay, nowPlaying, isPlaying } = useAudio();
  const { fontSize } = useSettings();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
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

  const handleBookmark = (ayah: Ayah, pageNumber: number) => {
    if (isBookmarked(ayah.number)) {
      removeBookmark(ayah.number);
    } else {
      addBookmark({
        ayahNumber: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surahName: ayah.surah.name,
        pageNumber,
        text: ayah.text.slice(0, 80),
        savedAt: Date.now(),
      });
    }
  };

  const handleAudio = (ayah: Ayah) => {
    if (nowPlaying?.ayahNumber === ayah.number) {
      togglePlay();
    } else {
      playAyah({ ayahNumber: ayah.number, numberInSurah: ayah.numberInSurah, surahName: ayah.surah.name });
    }
  };

  const pageNumber = ayahs[0]?.page;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div
        className="font-quran text-right leading-[3] transition-all"
        dir="rtl"
        style={{ fontSize: `${fontSize}px` }}
      >
        {ayahs.map((ayah) => {
          const isSurahStart = surahStarts.has(ayah.number);
          const showBismillah = isSurahStart && ayah.surah.number !== 1 && ayah.surah.number !== 9;
          let displayText = ayah.text;
          if (showBismillah && ayah.numberInSurah === 1) {
            displayText = displayText.replace(BISMILLAH, '').trim();
          }
          const bookmarked = isBookmarked(ayah.number);
          const isCurrentAyah = nowPlaying?.ayahNumber === ayah.number;
          const thisIsPlaying = isCurrentAyah && isPlaying;

          return (
            <span key={ayah.number}>
              {isSurahStart && (
                <div className="my-6 flex flex-col items-center gap-3">
                  <div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-center">
                    <h2 className="font-ui text-xl font-bold text-primary">{ayah.surah.name}</h2>
                  </div>
                  {showBismillah && (
                    <p className="font-quran text-xl text-primary/80">{BISMILLAH}</p>
                  )}
                </div>
              )}
              <span className={`transition-colors ${isCurrentAyah ? 'text-primary' : 'hover:text-primary/80'}`}>
                {displayText}
              </span>
              <span className="mx-1 inline-flex items-center gap-0.5 align-middle">
                <span className="font-ui text-base font-bold text-primary">
                  ﴿{toArabicNumeral(ayah.numberInSurah)}﴾
                </span>
                <button
                  onClick={() => handleAudio(ayah)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {thisIsPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => handleBookmark(ayah, pageNumber)}
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-primary/10 ${bookmarked ? 'text-primary' : 'text-primary/40 hover:text-primary'}`}
                >
                  {bookmarked ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                </button>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
