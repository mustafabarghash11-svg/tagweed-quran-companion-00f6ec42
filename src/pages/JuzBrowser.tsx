import { Link } from 'react-router-dom';
import { toArabicNumeral, JUZ_START_PAGES } from '@/lib/quran-api';
import { ArrowRight } from 'lucide-react';

const JUZ_NAMES: string[] = [
  'آلم', 'سيقول', 'تلك الرسل', 'لن تنالوا', 'والمحصنات',
  'لا يحب الله', 'وإذا سمعوا', 'ولو أننا', 'قال الملأ', 'واعلموا',
  'يعتذرون', 'وما من دابة', 'وما أبرئ', 'ربما', 'سبحان الذي',
  'قال ألم', 'اقترب للناس', 'قد أفلح', 'وقال الذين', 'أمن خلق',
  'اتل ما أوحي', 'ومن يقنت', 'وما لي', 'فمن أظلم', 'إليه يرد',
  'حم', 'قال فما خطبكم', 'قد سمع الله', 'تبارك الذي', 'عم',
];

export default function JuzBrowser() {
  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">الأجزاء</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {JUZ_NAMES.map((name, i) => (
            <Link
              key={i}
              to={`/page/${JUZ_START_PAGES[i]}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-primary/10 bg-card p-5 shadow-sm transition-shadow hover:shadow-md active:scale-[0.97]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-ui text-lg font-bold text-primary">
                {toArabicNumeral(i + 1)}
              </span>
              <span className="font-ui text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="font-ui text-xs text-muted-foreground">
                صفحة {toArabicNumeral(JUZ_START_PAGES[i])}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
