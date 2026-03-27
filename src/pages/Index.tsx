import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Menu, ChevronLeft, FileText } from 'lucide-react';
import { useSurahs } from '@/hooks/use-quran';
import { toArabicNumeral, SURAH_START_PAGES } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext.tsx';
import { Sidebar } from '@/components/Sidebar';
import { DailyDhikr } from '@/components/DailyDhikr';

// آخر صفحة مقروءة
function getLastPage(): number | null {
  const p = localStorage.getItem('tagweed-last-page');
  return p ? parseInt(p) : null;
}

export default function Index() {
  const { data: surahs, isLoading } = useSurahs();
  const { theme, toggleTheme } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastPage = getLastPage();

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        {/* الأزرار اليمنى (بحث فقط) */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>
        </div>

        {/* الأزرار اليسرى (ثيم + قائمة) */}
        <div className="flex items-center gap-1.5">
          {/* زر الوضع الليلي/النهاري */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* زر القائمة (ثلاث خطوط) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero */}
      <header className="flex flex-col items-center gap-2 px-4 py-8">
        <div className="mb-1 flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
          <h1 className="font-quran text-5xl text-primary md:text-6xl" style={{ lineHeight: '1.2' }}>
            تجويد
          </h1>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
        </div>
        <p className="font-ui text-sm text-muted-foreground tracking-wide">القرآن الكريم</p>
      </header>

      {/* متابعة القراءة */}
      {lastPage && (
        <div className="mx-auto max-w-lg px-4 mb-5">
          <Link
            to={`/page/${lastPage}`}
            className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 hover:bg-primary/10 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-ui text-sm font-bold text-primary">متابعة القراءة</p>
                <p className="font-ui text-xs text-muted-foreground">صفحة {toArabicNumeral(lastPage)}</p>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-primary/60" />
          </Link>
        </div>
      )}

      {/* قسم الأذكار الصباحية والمسائية */}
      <DailyDhikr />

      {/* فهرس السور */}
      <section className="mx-auto max-w-2xl px-4">
        <h2 className="mb-3 font-ui text-base font-bold text-foreground flex items-center gap-2">
          <span className="h-1 w-4 rounded-full bg-primary inline-block" />
          فهرس السور
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {surahs?.map((surah) => (
              <Link
                key={surah.number}
                to={`/page/${SURAH_START_PAGES[surah.number - 1]}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-ui text-sm font-bold text-primary">
                  {toArabicNumeral(surah.number)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-base font-semibold leading-tight truncate">
                    {surah.name}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {surah.englishName} · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="font-ui text-xs text-muted-foreground">
                    {toArabicNumeral(surah.numberOfAyahs)} آية
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
      }
