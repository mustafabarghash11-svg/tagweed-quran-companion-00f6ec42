import { useState } from 'react';
import { X, Sun, Moon, Target, Check, BookOpen, Flame, Music2, Palette } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { reciters } from '@/data/reciters';
import { useAudio } from '@/context/AudioContext.tsx';
import { toArabicNumeral } from '@/lib/quran-api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---- الورد اليومي ----
function DailyWirdSection() {
  const today = new Date().toDateString();

  const [goal, setGoal] = useState<number>(() =>
    parseInt(localStorage.getItem('tagweed-wird-goal') || '0')
  );
  const [inputVal, setInputVal] = useState(goal > 0 ? String(goal) : '');
  const [confirmed, setConfirmed] = useState(goal > 0);
  const [pagesRead, setPagesRead] = useState<number>(() => {
    const saved = localStorage.getItem('tagweed-wird-progress');
    if (!saved) return 0;
    const { date, pages } = JSON.parse(saved);
    return date === today ? pages : 0;
  });

  function calcDays(n: number) { return Math.ceil(604 / n); }
  function formatDays(days: number) {
    if (days < 30) return `${toArabicNumeral(days)} يوماً`;
    if (days < 365) {
      const m = Math.floor(days / 30), r = days % 30;
      return `${toArabicNumeral(m)} شهر${r > 0 ? ` و ${toArabicNumeral(r)} يوم` : ''}`;
    }
    const y = Math.floor(days / 365), m = Math.floor((days % 365) / 30);
    return `${toArabicNumeral(y)} سنة${m > 0 ? ` و ${toArabicNumeral(m)} شهر` : ''}`;
  }

  const handleConfirm = () => {
    const val = parseInt(inputVal);
    if (!val || val < 1 || val > 604) return;
    setGoal(val);
    localStorage.setItem('tagweed-wird-goal', String(val));
    setConfirmed(true);
    setPagesRead(0);
    localStorage.setItem('tagweed-wird-progress', JSON.stringify({ date: today, pages: 0 }));
  };

  const addPage = () => {
    const n = pagesRead + 1;
    setPagesRead(n);
    localStorage.setItem('tagweed-wird-progress', JSON.stringify({ date: today, pages: n }));
  };

  const percent = goal > 0 ? Math.min(100, Math.round((pagesRead / goal) * 100)) : 0;
  const done = goal > 0 && pagesRead >= goal;

  if (!confirmed) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center space-y-1">
        <BookOpen className="mx-auto h-7 w-7 text-primary opacity-60" />
        <p className="font-ui text-sm text-muted-foreground">كم صفحة تريد تقرأ يومياً؟</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" min={1} max={604} value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="مثال: ٥"
          className="flex-1 rounded-lg border border-primary/30 bg-background px-3 py-2 text-center font-ui text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          dir="rtl" />
        <span className="font-ui text-sm text-muted-foreground whitespace-nowrap">صفحة / يوم</span>
      </div>
      {inputVal && parseInt(inputVal) > 0 && parseInt(inputVal) <= 604 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-ui text-sm font-bold text-primary">ستختم القرآن في</span>
          </div>
          <p className="font-ui text-2xl font-bold">{formatDays(calcDays(parseInt(inputVal)))}</p>
          <p className="font-ui text-xs text-muted-foreground">بمعدل {toArabicNumeral(parseInt(inputVal))} صفحة يومياً</p>
        </div>
      )}
      <button onClick={handleConfirm}
        disabled={!inputVal || parseInt(inputVal) < 1 || parseInt(inputVal) > 604}
        className="w-full rounded-lg bg-primary py-2.5 font-ui text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 active:scale-95 transition-colors">
        تأكيد وابدأ
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center space-y-0.5">
        <p className="font-ui text-xs text-muted-foreground">ستختم في {formatDays(calcDays(goal))}</p>
        <p className="font-ui text-xs text-muted-foreground">{toArabicNumeral(goal)} صفحة / يوم</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between font-ui text-xs text-muted-foreground">
          <span>تقدم اليوم</span>
          <span>{toArabicNumeral(pagesRead)} / {toArabicNumeral(goal)} · {toArabicNumeral(percent)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${percent}%` }} />
        </div>
      </div>
      {!done ? (
        <button onClick={addPage}
          className="w-full rounded-lg bg-primary/10 py-2.5 font-ui text-sm font-semibold text-primary hover:bg-primary/20 active:scale-95 transition-colors">
          + سجّل صفحة مقروءة
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 py-2.5">
          <Check className="h-4 w-4 text-green-500" />
          <span className="font-ui text-sm font-bold text-green-500">أتممت وردك اليوم! 🎉</span>
        </div>
      )}
      <button onClick={() => { setConfirmed(false); setInputVal(''); setGoal(0); localStorage.removeItem('tagweed-wird-goal'); }}
        className="w-full rounded-lg border border-primary/15 py-2 font-ui text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        تغيير الهدف
      </button>
    </div>
  );
}

// ---- الإعدادات ----
function SettingsSection() {
  const { theme, toggleTheme, fontSize, setFontSize, colorTheme, setColorTheme, reciter, setReciter } = useSettings();
  const { setCurrentReciterApiId, nowPlaying, isPlaying } = useAudio();

  const handleReciterChange = (r: typeof RECITERS[0]) => {
    setReciter(r);
    setCurrentReciterApiId(r.apiId);
  };

  return (
    <div className="space-y-5">

      {/* القارئ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4 text-primary" />
          <span className="font-ui text-sm font-bold">القارئ</span>
        </div>
        <div className="space-y-1.5">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => handleReciterChange(r)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 font-ui text-sm transition-colors ${
                reciter.id === r.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-foreground hover:bg-muted'
              }`}
            >
              <span>{r.name}</span>
              {reciter.id === r.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
        {isPlaying && nowPlaying && (
          <p className="font-ui text-xs text-muted-foreground text-center">
            * سيُطبَّق على الآية التالية
          </p>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* الثيمات */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-ui text-sm font-bold">الثيم</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_THEMES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setColorTheme(ct)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all ${
                colorTheme.id === ct.id
                  ? 'border-foreground scale-105'
                  : 'border-transparent bg-muted/40 hover:bg-muted'
              }`}
            >
              <div
                className="h-7 w-7 rounded-full shadow-sm"
                style={{ backgroundColor: `hsl(${ct.primary})` }}
              />
              <span className="font-ui text-[11px]">{ct.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* الوضع الليلي */}
      <div className="flex items-center justify-between">
        <span className="font-ui text-sm">الوضع الليلي</span>
        <button onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-1.5 font-ui text-xs hover:bg-primary/10 transition-colors">
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {theme === 'dark' ? 'فاتح' : 'داكن'}
        </button>
      </div>

      {/* حجم الخط */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="font-ui text-sm">حجم الخط</span>
          <span className="font-ui text-xs text-muted-foreground">{toArabicNumeral(fontSize)}</span>
        </div>
        <input type="range" min={18} max={40} step={2} value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full accent-primary" />
        <div className="flex justify-between font-ui text-xs text-muted-foreground">
          <span>١٨</span><span>٤٠</span>
        </div>
      </div>
    </div>
  );
}

type Tab = 'wird' | 'settings';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('wird');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-card shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3 flex-shrink-0">
          <h2 className="font-ui text-base font-bold">القائمة</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-primary/10 flex-shrink-0">
          {([
            { id: 'wird', label: 'الورد', icon: Target },
            { id: 'settings', label: 'الإعدادات', icon: Palette },
          ] as { id: Tab; label: string; icon: any }[]).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1 py-2.5 font-ui text-xs transition-colors ${
                activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'wird' && <DailyWirdSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </div>
      </div>
    </>
  );
}
