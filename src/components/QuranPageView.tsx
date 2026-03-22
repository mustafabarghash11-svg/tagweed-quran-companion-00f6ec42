import { toArabicNumeral } from '@/lib/quran-api';
import type { Ayah } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';

interface QuranPageViewProps {
  ayahs?: Ayah[];
  isLoading: boolean;
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

export function QuranPageView({ ayahs, isLoading }: QuranPageViewProps) {
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

  // Group ayahs by surah to detect surah starts
  const surahStarts = new Set<number>();
  let prevSurah = -1;
  for (const ayah of ayahs) {
    if (ayah.surah.number !== prevSurah) {
      if (ayah.numberInSurah === 1) {
        surahStarts.add(ayah.number);
      }
      prevSurah = ayah.surah.number;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="font-quran text-right leading-[2.8] text-2xl md:text-3xl" dir="rtl">
        {ayahs.map((ayah) => {
          const isSurahStart = surahStarts.has(ayah.number);
          const showBismillah = isSurahStart && ayah.surah.number !== 1 && ayah.surah.number !== 9;

          // Remove bismillah from the ayah text if it's the first ayah
          let displayText = ayah.text;
          if (showBismillah && ayah.numberInSurah === 1) {
            displayText = displayText.replace(BISMILLAH, '').trim();
          }

          return (
            <span key={ayah.number}>
              {isSurahStart && (
                <div className="my-6 flex flex-col items-center gap-3">
                  <div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-center">
                    <h2 className="font-ui text-xl font-bold text-primary">
                      {ayah.surah.name}
                    </h2>
                  </div>
                  {showBismillah && (
                    <p className="font-quran text-xl text-primary/80">
                      {BISMILLAH}
                    </p>
                  )}
                </div>
              )}
              <span className="transition-colors hover:text-primary/80">
                {displayText}
              </span>
              <span className="mx-1 inline-block font-ui text-base font-bold text-primary">
                ﴿{toArabicNumeral(ayah.numberInSurah)}﴾
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
