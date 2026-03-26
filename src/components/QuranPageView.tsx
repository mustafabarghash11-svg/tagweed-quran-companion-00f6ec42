// src/components/QuranPageView.tsx
import { useBookmarks } from '@/context/BookmarksContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Bookmark, Info, Volume2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { toast } from 'sonner';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
  };
}

interface QuranPageViewProps {
  ayahs?: Ayah[];
  isLoading: boolean;
}

export function QuranPageView({ ayahs, isLoading }: QuranPageViewProps) {
  const { fontSize, colorTheme } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { playAyah, isPlaying, nowPlaying, stop } = useAudio();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!ayahs) return null;

  const handleBookmark = (ayah: Ayah) => {
    const bookmarkId = `${ayah.surah.number}:${ayah.numberInSurah}`;
    
    if (isBookmarked(bookmarkId)) {
      removeBookmark(bookmarkId);
      toast.success('تم إزالة العلامة');
    } else {
      addBookmark({
        id: bookmarkId,
        surahName: ayah.surah.name,
        numberInSurah: ayah.numberInSurah,
        ayahNumber: ayah.number,
        pageNumber: Math.ceil(ayah.number / 15),
        text: ayah.text.substring(0, 100)
      });
      toast.success('تمت إضافة العلامة');
    }
  };

  const handlePlay = (ayah: Ayah) => {
    if (isPlaying && nowPlaying?.ayahNumber === ayah.number) {
      stop();
    } else {
      playAyah({
        ayahNumber: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surahName: ayah.surah.name,
      });
    }
  };

  const openTafsir = (ayah: Ayah) => {
    window.open(`https://quran.ksu.edu.sa/tafseer/${ayah.surah.number}/${ayah.numberInSurah}.html`, '_blank');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" dir="rtl">
      {ayahs.map((ayah, idx) => {
        const bookmarkId = `${ayah.surah.number}:${ayah.numberInSurah}`;
        const isAyahBookmarked = isBookmarked(bookmarkId);
        const isAyahPlaying = isPlaying && nowPlaying?.ayahNumber === ayah.number;

        return (
          <div
            key={ayah.number}
            className="group relative mb-8 rounded-xl transition-all hover:bg-primary/5"
          >
            {/* رقم الآية */}
            <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {ayah.numberInSurah}
            </div>

            {/* نص الآية */}
            <p
              className="pr-10 font-quran leading-loose text-foreground"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
              {ayah.text}
              <span className="mr-2 inline-block h-4 w-4 rounded-full bg-primary/30" />
            </p>

            {/* الأزرار (تظهر عند hover) */}
            <div className="absolute left-2 top-1/2 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {/* زر التفسير - كبير */}
              <button
                onClick={() => openTafsir(ayah)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 transition-all hover:bg-blue-500/20 hover:scale-110 dark:text-blue-400"
                title="تفسير الآية"
              >
                <Info className="h-5 w-5" />
              </button>

              {/* زر الإشارة المرجعية - كبير */}
              <button
                onClick={() => handleBookmark(ayah)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                  isAyahBookmarked
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-primary/10 text-primary'
                }`}
                title={isAyahBookmarked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Bookmark className={`h-5 w-5 ${isAyahBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
