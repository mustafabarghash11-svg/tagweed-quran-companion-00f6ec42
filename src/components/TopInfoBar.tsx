import { toArabicNumeral } from '@/lib/quran-api';
import type { Ayah } from '@/lib/quran-api';

interface TopInfoBarProps {
  pageNumber: number;
  ayahs?: Ayah[];
}

export function TopInfoBar({ pageNumber, ayahs }: TopInfoBarProps) {
  if (!ayahs || ayahs.length === 0) return null;

  const surahNames = [...new Set(ayahs.map((a) => a.surah.name))];
  const juz = ayahs[0]?.juz;
  const firstAyah = ayahs[0]?.numberInSurah;
  const lastAyah = ayahs[ayahs.length - 1]?.numberInSurah;

  return (
    <div className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5 font-ui text-sm">
        <span className="font-bold text-primary">
          جزء {toArabicNumeral(juz)}
        </span>
        <span className="text-center font-semibold text-foreground">
          {surahNames.join(' - ')}
        </span>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            آية {toArabicNumeral(firstAyah)} - {toArabicNumeral(lastAyah)}
          </span>
          <span className="font-bold text-primary">
            {toArabicNumeral(pageNumber)}
          </span>
        </div>
      </div>
    </div>
  );
}
