import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Music2, Type, Palette, BookOpen, Brain, Volume2, Monitor, ChevronRight } from 'lucide-react';
import { reciters } from '@/data/reciters';
import { useSettings, COLOR_THEMES } from '@/context/SettingsContext';
import { useAudio } from '@/context/AudioContext';
import { toArabicNumeral } from '@/lib/quran-api';
import { toast } from 'sonner';

export default function Settings() {
  const { reciter, setReciter, theme, setTheme, fontSize, setFontSize, colorTheme, setColorTheme } = useSettings();
  const { setCurrentReciterApiId } = useAudio();
  const [pages, setPages] = useState(() => {
    return parseInt(localStorage.getItem('tagweed-khatma-pages') || '1');
  });
  const days = Math.ceil(604 / Math.max(1, pages));

  useEffect(() => {
    localStorage.setItem('tagweed-khatma-pages', String(pages));
  }, [pages]);

  const handleReciterChange = (r: typeof reciters[0]) => {
    setReciter(r);
    setCurrentReciterApiId(r.apiId);
    toast.success(`تم اختيار ${r.name}`);
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">الإعدادات</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">

        {/* القارئ */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4 text-primary" />
            <h2 className="font-ui text-sm font-bold">القارئ</h2>
          </div>
          <div className="space-y-2">
            {reciters.map(r => (
              <button
                key={r.id}
                onClick={() => handleReciterChange(r)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 font-ui text-sm transition-colors ${
                  reciter.id === r.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <span>{r.name}</span>
                {reciter.id === r.id && (
                  <span className="text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* المظهر */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            <h2 className="font-ui text-sm font-bold">المظهر</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-ui text-sm transition-colors ${
                  theme === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                {t === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {t === 'light' ? 'فاتح' : 'داكن'}
              </button>
            ))}
          </div>
        </div>

        {/* لون الثيم */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-ui text-sm font-bold">لون التطبيق</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEMES.map(ct => (
              <button
                key={ct.id}
                onClick={() => { setColorTheme(ct); toast.success(`تم تغيير اللون إلى ${ct.name}`); }}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 py-3 transition-all ${
                  colorTheme.id === ct.id ? 'border-foreground scale-105' : 'border-transparent bg-muted/40 hover:bg-muted'
                }`}
              >
                <div className="h-7 w-7 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${ct.primary})` }} />
                <span className="font-ui text-[11px]">{ct.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* حجم الخط */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <h2 className="font-ui text-sm font-bold">حجم خط القرآن</h2>
            </div>
            <span className="font-ui text-sm font-bold text-primary">{toArabicNumeral(fontSize)}</span>
          </div>
          <input
            type="range" min={18} max={40} step={2} value={fontSize}
            onChange={e => setFontSize(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between font-ui text-xs text-muted-foreground">
            <span>١٨</span>
            <p className="font-quran text-center" style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}>بِسْمِ ٱللَّهِ</p>
            <span>٤٠</span>
          </div>
        </div>

        {/* حاسبة الختمة */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-ui text-sm font-bold">حاسبة الختمة</h2>
          </div>
          <div className="space-y-2">
            <label className="font-ui text-xs text-muted-foreground">عدد الصفحات يومياً</label>
            <input
              type="number" min={1} max={604} value={pages}
              onChange={e => setPages(Math.max(1, Math.min(604, Number(e.target.value))))}
              className="w-full rounded-xl border border-primary/20 bg-background px-4 py-2.5 font-ui text-sm text-center"
            />
          </div>
          <div className="rounded-xl bg-primary/10 px-4 py-3 text-center">
            <p className="font-ui text-xs text-muted-foreground mb-1">ستختم القرآن خلال</p>
            <p className="font-ui text-xl font-bold text-primary">{toArabicNumeral(days)} يوم</p>
          </div>
          <Link
            to="/memorize"
            className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-ui text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            <Brain className="h-4 w-4" />
            انتقل إلى صفحة الحفظ
          </Link>
        </div>

        {/* معلومات التطبيق */}
        <div className="rounded-2xl border border-primary/10 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            <h2 className="font-ui text-sm font-bold">عن التطبيق</h2>
          </div>
          <div className="space-y-2 text-right">
            <p className="font-ui text-sm text-foreground">
              <span className="font-bold">تجويد</span> – تطبيق شامل للقرآن الكريم والعلوم الإسلامية
            </p>
            <p className="font-ui text-xs text-muted-foreground">
              الإصدار 1.0.0
            </p>
            <div className="pt-2 border-t border-primary/10 mt-2">
              <p className="font-ui text-xs text-muted-foreground">
                يحتوي التطبيق على:<br />
                • القرآن الكريم كاملاً مع أحكام التجويد<br />
                • تفسير الآيات<br />
                • مواقيت الصلاة حسب الموقع<br />
                • اختبارات دينية متنوعة<br />
                • نظام حفظ القرآن مع تتبع الأخطاء<br />
                • مساعد ذكي بالذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
    }
