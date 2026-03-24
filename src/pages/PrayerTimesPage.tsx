import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Clock, Moon, Sun, Sunrise, Sunset, Star } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface TimingsData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: { ar: string };
      year: string;
    };
  };
}

const PRAYERS = [
  { key: 'Fajr',    label: 'الفجر',   icon: Star,    color: 'from-indigo-500/20 to-blue-500/10' },
  { key: 'Sunrise', label: 'الشروق',  icon: Sunrise,  color: 'from-orange-400/20 to-yellow-300/10' },
  { key: 'Dhuhr',   label: 'الظهر',   icon: Sun,      color: 'from-yellow-500/20 to-amber-400/10' },
  { key: 'Asr',     label: 'العصر',   icon: Sun,      color: 'from-amber-500/20 to-orange-400/10' },
  { key: 'Maghrib', label: 'المغرب',  icon: Sunset,   color: 'from-orange-600/20 to-red-400/10' },
  { key: 'Isha',    label: 'العشاء',  icon: Moon,     color: 'from-blue-700/20 to-indigo-500/10' },
] as const;

function toArabicTime(time: string): string {
  return time.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function getNextPrayer(timings: PrayerTimes): string | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const p of PRAYERS) {
    const t = timings[p.key as keyof PrayerTimes];
    if (!t) continue;
    const [h, m] = t.split(':').map(Number);
    if (h * 60 + m > nowMinutes) return p.key;
  }
  return PRAYERS[0].key; // after Isha → Fajr tomorrow
}

function getMinutesUntil(time: string): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = time.split(':').map(Number);
  let diff = h * 60 + m - nowMinutes;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}س ${m}د`;
  return `${m} دقيقة`;
}

export default function PrayerTimesPage() {
  const [data, setData] = useState<TimingsData | null>(null);
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  async function fetchByCoords(lat: number, lon: number) {
    setLoading(true);
    setError(null);
    try {
      // اسم المدينة
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
      );
      const geoData = await geoRes.json();
      const cityName =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.county ||
        'موقعك الحالي';
      setCity(cityName);

      // أوقات الصلاة
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=4`
      );
      const json = await res.json();
      if (json.code === 200) {
        setData(json.data);
      } else {
        setError('تعذّر جلب الأوقات');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        // fallback: مكة المكرمة
        fetchByCoords(21.3891, 39.8579);
        setCity('مكة المكرمة (افتراضي)');
      }
    );
  }

  useEffect(() => {
    locateMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextPrayerKey = data ? getNextPrayer(data.timings) : null;
  const nextPrayerInfo = PRAYERS.find(p => p.key === nextPrayerKey);
  const minutesUntilNext = data && nextPrayerKey
    ? getMinutesUntil(data.timings[nextPrayerKey as keyof PrayerTimes])
    : null;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="font-ui text-xl font-bold text-foreground">أوقات الصلاة</h1>
        <button
          onClick={locateMe}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* موقع */}
      {city && (
        <div className="flex items-center gap-1.5 px-4 mb-4">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-ui text-sm text-muted-foreground">{city}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="font-ui text-sm text-muted-foreground">جارٍ تحديد موقعك...</p>
        </div>
      )}

      {error && (
        <div className="mx-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="font-ui text-sm text-destructive">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="px-4 space-y-4">
          {/* التاريخ الهجري */}
          <div className="text-center py-2">
            <p className="font-ui text-sm text-muted-foreground">
              {data.date.hijri.date.replace(/-/g, ' ')} {data.date.hijri.month.ar} {data.date.hijri.year}هـ
            </p>
          </div>

          {/* الصلاة القادمة */}
          {nextPrayerInfo && minutesUntilNext !== null && (
            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4 text-center">
              <p className="font-ui text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
              <p className="font-ui text-2xl font-bold text-primary mb-1">{nextPrayerInfo.label}</p>
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="font-ui text-sm text-muted-foreground">
                  بعد {formatCountdown(minutesUntilNext)}
                </p>
              </div>
              <p className="font-ui text-lg font-bold text-foreground mt-1">
                {toArabicTime(data.timings[nextPrayerKey as keyof PrayerTimes])}
              </p>
            </div>
          )}

          {/* قائمة الصلوات */}
          <div className="space-y-2">
            {PRAYERS.map(prayer => {
              const time = data.timings[prayer.key as keyof PrayerTimes];
              const isNext = prayer.key === nextPrayerKey;
              const Icon = prayer.icon;

              // هل مرّت؟
              const [h, m] = time.split(':').map(Number);
              const pMinutes = h * 60 + m;
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              const isPast = pMinutes < nowMinutes && !isNext;

              return (
                <div
                  key={prayer.key}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all ${
                    isNext
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${prayer.color}`}>
                    <Icon className={`h-5 w-5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-ui text-base font-semibold ${isNext ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {prayer.label}
                    </p>
                    {isNext && (
                      <p className="font-ui text-xs text-primary/70">القادمة ✦</p>
                    )}
                  </div>
                  <p className={`font-ui text-lg font-bold tabular-nums ${
                    isNext ? 'text-primary' : isPast ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground'
                  }`}>
                    {toArabicTime(time)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ملاحظة */}
          <p className="font-ui text-xs text-muted-foreground text-center pb-2">
            الأوقات محسوبة بطريقة رابطة العالم الإسلامي
          </p>
        </div>
      )}
    </div>
  );
}
