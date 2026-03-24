import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { reciters } from '@/data/reciters';
import { useSettings } from '@/context/SettingsContext';
import { toArabicNumeral } from '@/lib/quran-api';

export default function Settings() {
  const { reciter, setReciter, theme, setTheme } = useSettings();
  const [pages, setPages] = useState(1);
  const days = Math.ceil(604 / pages);

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">الإعدادات</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="rounded-xl border border-primary/10 bg-card p-4 space-y-3">
          <h2 className="font-ui text-sm font-bold">القارئ</h2>
          <select
            value={reciter.id}
            onChange={e => {
              const found = reciters.find(r => r.id === e.target.value);
              if (found) setReciter(found);
            }}
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 font-ui text-sm"
          >
            {reciters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="rounded-xl border border-primary/10 bg-card p-4 space-y-3">
          <h2 className="font-ui text-sm font-bold">المظهر</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 rounded-lg px-3 py-2 font-ui text-sm transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              فاتح
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 rounded-lg px-3 py-2 font-ui text-sm transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              داكن
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-card p-4 space-y-3">
          <h2 className="font-ui text-sm font-bold">حاسبة الختمة</h2>
          <div className="space-y-1">
            <label className="font-ui text-xs text-muted-foreground">عدد الصفحات يومياً</label>
            <input
              type="number"
              min={1}
              max={604}
              value={pages}
              onChange={e => setPages(Math.max(1, Math.min(604, Number(e.target.value))))}
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 font-ui text-sm"
            />
          </div>
          <p className="font-ui text-sm text-primary font-semibold">
            ستختم القرآن خلال: {toArabicNumeral(days)} يوم
          </p>
        </div>
      </div>
    </div>
  );
}
