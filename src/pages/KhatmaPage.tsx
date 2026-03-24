import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Calendar, BookOpen, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react';
import { toArabicNumeral } from '@/lib/quran-api';

const TOTAL_PAGES = 604;

interface KhatmaPlan {
  startDate: string;      // ISO date
  totalDays: number;
  pagesPerDay: number;
  readPages: number;
  lastReadDate: string;
}

function loadPlan(): KhatmaPlan | null {
  try {
    const s = localStorage.getItem('tagweed-khatma');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function savePlan(p: KhatmaPlan) {
  localStorage.setItem('tagweed-khatma', JSON.stringify(p));
}

function clearPlan() {
  localStorage.removeItem('tagweed-khatma');
}

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDays(days: number) {
  if (days < 30) return `${toArabicNumeral(days)} يوماً`;
  if (days < 365) {
    const m = Math.floor(days / 30), r = days % 30;
    return `${toArabicNumeral(m)} شهر${r > 0 ? ` و${toArabicNumeral(r)} يوم` : ''}`;
  }
  const y = Math.floor(days / 365), m = Math.floor((days % 365) / 30);
  return `${toArabicNumeral(y)} سنة${m > 0 ? ` و${toArabicNumeral(m)} شهر` : ''}`;
}

export default function KhatmaPage() {
  const [plan, setPlan] = useState<KhatmaPlan | null>(() => loadPlan());
  const [daysInput, setDaysInput] = useState('');
  const today = new Date().toISOString().split('T')[0];

  // حساب المعلومات
  const pagesPerDay = daysInput ? Math.ceil(TOTAL_PAGES / parseInt(daysInput)) : null;
  const endDate = daysInput ? addDays(today, parseInt(daysInput)) : null;

  const handleCreate = () => {
    const days = parseInt(daysInput);
    if (!days || days < 1) return;
    const newPlan: KhatmaPlan = {
      startDate: today,
      totalDays: days,
      pagesPerDay: Math.ceil(TOTAL_PAGES / days),
      readPages: 0,
      lastReadDate: '',
    };
    savePlan(newPlan);
    setPlan(newPlan);
    setDaysInput('');
  };

  const handleAddPage = () => {
    if (!plan) return;
    const updated = {
      ...plan,
      readPages: Math.min(TOTAL_PAGES, plan.readPages + 1),
      lastReadDate: today,
    };
    savePlan(updated);
    setPlan(updated);
  };

  const handleAddPagesDay = () => {
    if (!plan) return;
    const updated = {
      ...plan,
      readPages: Math.min(TOTAL_PAGES, plan.readPages + plan.pagesPerDay),
      lastReadDate: today,
    };
    savePlan(updated);
    setPlan(updated);
  };

  const handleReset = () => {
    clearPlan();
    setPlan(null);
  };

  // حسابات الخطة الحالية
  const daysElapsed = plan ? daysBetween(plan.startDate, today) : 0;
  const daysRemaining = plan ? Math.max(0, plan.totalDays - daysElapsed) : 0;
  const endDatePlan = plan ? addDays(plan.startDate, plan.totalDays) : '';
  const expectedPages = plan ? Math.min(TOTAL_PAGES, daysElapsed * plan.pagesPerDay) : 0;
  const progressPercent = plan ? Math.round((plan.readPages / TOTAL_PAGES) * 100) : 0;
  const isAhead = plan ? plan.readPages >= expectedPages : false;
  const diffPages = plan ? Math.abs(plan.readPages - expectedPages) : 0;
  const todayPagesRead = plan?.lastReadDate === today;
  const isComplete = plan ? plan.readPages >= TOTAL_PAGES : false;

  // ---- شاشة الإنشاء ----
  if (!plan) {
    return (
      <div className="min-h-screen pb-20" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link to="/" className="text-primary hover:scale-105 active:scale-95 transition-transform">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="font-ui text-lg font-bold">خطة الختمة</h1>
          </div>
        </header>

        <div className="mx-auto max-w-md px-4 py-8 space-y-6">
          {/* أيقونة */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-ui text-xl font-bold">ضع خطة لختم القرآن</h2>
              <p className="font-ui text-sm text-muted-foreground mt-1">
                حدد عدد الأيام وسنقسم الصفحات عليك
              </p>
            </div>
          </div>

          {/* إدخال الأيام */}
          <div className="space-y-3">
            <label className="font-ui text-sm font-bold">كم يوم تريد تختم فيها؟</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={3650}
                value={daysInput}
                onChange={(e) => setDaysInput(e.target.value)}
                placeholder="مثال: ٣٠"
                className="flex-1 rounded-xl border border-primary/30 bg-background px-4 py-3 text-center font-ui text-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                dir="rtl"
              />
              <span className="font-ui text-sm text-muted-foreground whitespace-nowrap">يوم</span>
            </div>
          </div>

          {/* معاينة حية */}
          {daysInput && parseInt(daysInput) > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-card p-3 text-center">
                  <p className="font-ui text-2xl font-bold text-primary">
                    {toArabicNumeral(pagesPerDay!)}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">صفحة / يوم</p>
                </div>
                <div className="rounded-xl bg-card p-3 text-center">
                  <p className="font-ui text-2xl font-bold text-primary">
                    {toArabicNumeral(parseInt(daysInput))}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">يوم</p>
                </div>
              </div>
              <div className="rounded-xl bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="font-ui text-sm font-bold">تنتهي في {formatDate(endDate!)}</p>
                </div>
                <p className="font-ui text-xs text-muted-foreground mt-0.5">
                  {formatDays(parseInt(daysInput))} من الآن
                </p>
              </div>
            </div>
          )}

          {/* أزرار سريعة */}
          <div className="space-y-2">
            <p className="font-ui text-xs text-muted-foreground">اختيارات سريعة:</p>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysInput(String(d))}
                  className={`rounded-xl border py-2 font-ui text-sm font-bold transition-colors ${
                    daysInput === String(d)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/20 hover:bg-primary/10 text-foreground'
                  }`}
                >
                  {toArabicNumeral(d)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!daysInput || parseInt(daysInput) < 1}
            className="w-full rounded-2xl bg-primary py-4 font-ui text-base font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 active:scale-95 transition-all"
          >
            ابدأ الخطة
          </button>
        </div>
      </div>
    );
  }

  // ---- شاشة المتابعة ----
  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary hover:scale-105 active:scale-95 transition-transform">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="font-ui text-lg font-bold">خطة الختمة</h1>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 font-ui text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-6 space-y-4">

        {/* الاكتمال */}
        {isComplete && (
          <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-5 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
            <p className="font-ui text-lg font-bold text-green-600 dark:text-green-400">
              🎉 أتممت ختمة القرآن الكريم!
            </p>
            <p className="font-ui text-sm text-muted-foreground">
              في {toArabicNumeral(daysElapsed)} يوم — بارك الله فيك
            </p>
          </div>
        )}

        {/* شريط التقدم */}
        <div className="rounded-2xl border border-primary/15 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-ui text-sm font-bold">التقدم الكلي</span>
            <span className="font-ui text-sm font-bold text-primary">{toArabicNumeral(progressPercent)}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between font-ui text-xs text-muted-foreground">
            <span>{toArabicNumeral(plan.readPages)} / {toArabicNumeral(TOTAL_PAGES)} صفحة</span>
            <span>متبقي {toArabicNumeral(TOTAL_PAGES - plan.readPages)} صفحة</span>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-primary/15 bg-card p-4 text-center space-y-1">
            <Calendar className="mx-auto h-5 w-5 text-primary" />
            <p className="font-ui text-xl font-bold">{toArabicNumeral(daysRemaining)}</p>
            <p className="font-ui text-xs text-muted-foreground">يوم متبقي</p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-card p-4 text-center space-y-1">
            <BookOpen className="mx-auto h-5 w-5 text-primary" />
            <p className="font-ui text-xl font-bold">{toArabicNumeral(plan.pagesPerDay)}</p>
            <p className="font-ui text-xs text-muted-foreground">صفحة / يوم</p>
          </div>
        </div>

        {/* الحالة */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          isAhead
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-amber-500/10 border border-amber-500/20'
        }`}>
          <TrendingUp className={`h-5 w-5 flex-shrink-0 ${isAhead ? 'text-green-500' : 'text-amber-500'}`} />
          <div>
            <p className={`font-ui text-sm font-bold ${isAhead ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isAhead
                ? `متقدم بـ ${toArabicNumeral(diffPages)} صفحة 🎯`
                : diffPages > 0
                  ? `متأخر بـ ${toArabicNumeral(diffPages)} صفحة`
                  : 'أنت في الموعد تماماً ✓'
              }
            </p>
            <p className="font-ui text-xs text-muted-foreground">
              تنتهي الخطة في {formatDate(endDatePlan)}
            </p>
          </div>
        </div>

        {/* أزرار التسجيل */}
        {!isComplete && (
          <div className="space-y-2">
            <button
              onClick={handleAddPagesDay}
              className="w-full rounded-2xl bg-primary py-4 font-ui text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
            >
              ✓ سجّل ورد اليوم ({toArabicNumeral(plan.pagesPerDay)} صفحة)
            </button>
            <button
              onClick={handleAddPage}
              className="w-full rounded-2xl border border-primary/20 py-3 font-ui text-sm text-primary hover:bg-primary/10 active:scale-95 transition-all"
            >
              + سجّل صفحة واحدة
            </button>
          </div>
        )}

        {/* تاريخ البدء والانتهاء */}
        <div className="rounded-2xl border border-primary/10 bg-muted/30 p-3">
          <div className="flex justify-between font-ui text-xs text-muted-foreground">
            <span>بدأت: {formatDate(plan.startDate)}</span>
            <span>تنتهي: {formatDate(endDatePlan)}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/40 transition-all"
              style={{ width: `${Math.min(100, Math.round((daysElapsed / plan.totalDays) * 100))}%` }}
            />
          </div>
          <p className="mt-1 font-ui text-xs text-muted-foreground text-center">
            اليوم {toArabicNumeral(daysElapsed + 1)} من {toArabicNumeral(plan.totalDays)}
          </p>
        </div>

      </div>
    </div>
  );
}
