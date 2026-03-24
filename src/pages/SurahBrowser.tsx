import { Link } from 'react-router-dom';
import { useSurahs } from '@/hooks/use-quran';
import { toArabicNumeral, SURAH_START_PAGES } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

export default function SurahBrowser() {
  const { data: surahs, isLoading } = useSurahs();

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">السور</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {surahs?.map((surah) => (
              <Link
                key={surah.number}
                to={`/page/${SURAH_START_PAGES[surah.number - 1]}`}
                className="group flex flex-col items-center gap-1 rounded-xl border border-primary/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.97]"
              >
                <span className="font-ui text-xs font-bold text-primary">
                  {toArabicNumeral(surah.number)}
                </span>
                <span className="font-ui text-base font-bold">{surah.name}</span>
                <span className="font-ui text-xs text-muted-foreground">
                  {surah.englishName}
                </span>
                <span className="font-ui text-xs text-muted-foreground">
                  {toArabicNumeral(surah.numberOfAyahs)} آية · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
