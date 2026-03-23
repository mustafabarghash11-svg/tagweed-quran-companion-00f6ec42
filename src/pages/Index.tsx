import { Link } from 'react-router-dom';
import { BookOpen, Layers, FileText, Sparkles } from 'lucide-react';
import { useSurahs } from '@/hooks/use-quran';
import { toArabicNumeral, SURAH_START_PAGES } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { to: '/page/1', icon: FileText, label: 'تصفح بالصفحة', desc: '٦٠٤ صفحة' },
  { to: '/surah', icon: BookOpen, label: 'تصفح بالسورة', desc: '١١٤ سورة' },
  { to: '/juz', icon: Layers, label: 'تصفح بالجزء', desc: '٣٠ جزء' },
  { to: '/ai', icon: Sparkles, label: 'تجويد AI', desc: 'اسأل سؤالك الديني' },
];

export default function Index() {
  const { data: surahs, isLoading } = useSurahs();

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <header className="flex flex-col items-center gap-2 px-4 pb-8 pt-16">
        <div className="mb-2 h-px w-24 bg-primary/40" />
        <h1 className="font-quran text-5xl text-primary md:text-6xl" style={{ lineHeight: '1.1' }}>
          تجويد
        </h1>
        <p className="font-ui text-lg text-muted-foreground">القرآن الكريم</p>
        <div className="mt-1 h-px w-24 bg-primary/40" />
      </header>

      {/* Quick Nav */}
      <nav className="mx-auto grid max-w-lg grid-cols-3 gap-3 px-4 pb-10">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex flex-col items-center gap-2 rounded-xl border border-primary/15 bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.97]"
          >
            <item.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-105" />
            <span className="font-ui text-sm font-semibold">{item.label}</span>
            <span className="font-ui text-xs text-muted-foreground">{item.desc}</span>
          </Link>
        ))}
      </nav>

      {/* Surah List */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <h2 className="mb-4 font-ui text-xl font-bold text-foreground">الفهرس</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {surahs?.map((surah) => (
              <Link
                key={surah.number}
                to={`/page/${SURAH_START_PAGES[surah.number - 1]}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 font-ui text-sm font-bold text-primary">
                  {toArabicNumeral(surah.number)}
                </span>
                <div className="flex-1">
                  <p className="font-ui text-base font-semibold leading-tight">
                    {surah.name}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {surah.englishName} · {surah.englishNameTranslation}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-ui text-xs text-muted-foreground">
                    {toArabicNumeral(surah.numberOfAyahs)} آية
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
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
