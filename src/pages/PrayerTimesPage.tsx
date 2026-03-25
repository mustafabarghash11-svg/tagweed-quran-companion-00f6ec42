import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, Clock, Moon, Sun, Sunrise, Sunset, Star, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  meta: {
    latitude: number;
    longitude: number;
    method: { name: string };
  };
}

const PRAYERS = [
  { key: 'Fajr', label: 'الفجر', icon: Star, timeDesc: 'قبل الفجر' },
  { key: 'Sunrise', label: 'الشروق', icon: Sunrise, timeDesc: 'طلوع الشمس' },
  { key: 'Dhuhr', label: 'الظهر', icon: Sun, timeDesc: 'بعد الزوال' },
  { key: 'Asr', label: 'العصر', icon: Sun, timeDesc: 'بعد العصر' },
  { key: 'Maghrib', label: 'المغرب', icon: Sunset, timeDesc: 'غروب الشمس' },
  { key: 'Isha', label: 'العشاء', icon: Moon, timeDesc: 'بعد المغرب' },
];

const CITIES = [
  { name: 'مكة المكرمة', lat: 21.3891, lon: 39.8579 },
  { name: 'المدينة المنورة', lat: 24.5247, lon: 39.5692 },
  { name: 'الرياض', lat: 24.7136, lon: 46.6753 },
  { name: 'جدة', lat: 21.4858, lon: 39.1925 },
  { name: 'القاهرة', lat: 30.0444, lon: 31.2357 },
  { name: 'دبي', lat: 25.2048, lon: 55.2708 },
  { name: 'عمان', lat: 31.9474, lon: 35.9272 },
  { name: 'الدوحة', lat: 25.2854, lon: 51.531 },
  { name: 'الكويت', lat: 29.3759, lon: 47.9774 },
];

function toArabicTime(time: string): string {
  return time.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function getNextPrayer(timings: PrayerTimes): { key: string; label: string; time: string } | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const prayer of PRAYERS) {
    const timeStr = timings[prayer.key as keyof PrayerTimes];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > nowMinutes) {
      return { key: prayer.key, label: prayer.label, time: timeStr };
    }
  }
  // بعد العشاء → الفجر غداً
  return { key: 'Fajr', label: 'الفجر', time: timings.Fajr };
}

function getMinutesUntil(timeStr: string): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = timeStr.split(':').map(Number);
  let diff = h * 60 + m - nowMinutes;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h} ساعة ${m > 0 ? `و ${m} دقيقة` : ''}`;
  }
  return `${m} دقيقة`;
}

export default function PrayerTimesPage() {
  const [data, setData] = useState<TimingsData | null>(null);
  const [city, setCity] = useState<string>('');
  const [cityLatLon, setCityLatLon] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [showCitySelector, setShowCitySelector] = useState(false);

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // تحميل المدينة المحفوظة عند بدء التشغيل
  useEffect(() => {
    const savedCity = localStorage.getItem('prayer-city');
    if (savedCity) {
      try {
        const cityData = JSON.parse(savedCity);
        setCity(cityData.name);
        setCityLatLon({ lat: cityData.lat, lon: cityData.lon });
        fetchTimesByCoords(cityData.lat, cityData.lon, cityData.name);
      } catch {
        locateMe();
      }
    } else {
      locateMe();
    }
  }, []);

  async function fetchTimesByCoords(lat: number, lon: number, cityName?: string) {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=4&tune=0,0,0,0,0,0,0,0,0`
      );
      const json = await res.json();
      
      if (json.code === 200) {
        setData({
          ...json.data,
          meta: { ...json.data.meta, latitude: lat, longitude: lon }
        });
        
        if (cityName) {
          setCity(cityName);
        } else {
          // جلب اسم المدينة من الإحداثيات
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
          );
          const geoData = await geoRes.json();
          const foundCity = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'موقعك الحالي';
          setCity(foundCity);
        }
      } else {
        throw new Error('تعذر جلب الأوقات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال، تأكد من اتصالك بالإنترنت');
      toast.error('فشل في تحميل أوقات الصلاة');
    } finally {
      setLoading(false);
    }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع');
      toast.error('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // حفظ المدينة
        localStorage.setItem('prayer-city', JSON.stringify({
          name: 'موقعي الحالي',
          lat: latitude,
          lon: longitude
        }));
        await fetchTimesByCoords(latitude, longitude);
      },
      () => {
        // فشل تحديد الموقع → استخدام مكة كافتراضي
        toast.error('لم نتمكن من تحديد موقعك، تم استخدام مكة المكرمة');
        const defaultCity = CITIES[0];
        localStorage.setItem('prayer-city', JSON.stringify(defaultCity));
        fetchTimesByCoords(defaultCity.lat, defaultCity.lon, defaultCity.name);
      }
    );
  }

  function selectCity(cityData: typeof CITIES[0]) {
    localStorage.setItem('prayer-city', JSON.stringify(cityData));
    setCity(cityData.name);
    setCityLatLon({ lat: cityData.lat, lon: cityData.lon });
    fetchTimesByCoords(cityData.lat, cityData.lon, cityData.name);
    setShowCitySelector(false);
    toast.success(`تم اختيار ${cityData.name}`);
  }

  const nextPrayer = data ? getNextPrayer(data.timings) : null;
  const minutesUntilNext = nextPrayer ? getMinutesUntil(nextPrayer.time) : null;

  return (
    <div className="min-h-screen pb-24 bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">أوقات الصلاة</h1>
          <button
            onClick={locateMe}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* City Selector */}
      <div className="mx-auto max-w-2xl px-4 pt-4 pb-2">
        <button
          onClick={() => setShowCitySelector(!showCitySelector)}
          className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-card px-4 py-3 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-ui text-sm text-foreground">
              {city || 'اختر المدينة'}
            </span>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showCitySelector ? 'rotate-90' : ''}`} />
        </button>

        {showCitySelector && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-primary/20 bg-card p-3">
            {CITIES.map((c) => (
              <button
                key={c.name}
                onClick={() => selectCity(c)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-right font-ui text-sm hover:bg-primary/10 transition-colors"
              >
                <span>{c.name}</span>
                {city === c.name && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="font-ui text-sm text-muted-foreground">جارٍ تحميل أوقات الصلاة...</p>
        </div>
      )}

      {error && (
        <div className="mx-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
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
            <p className="font-ui text-xs text-muted-foreground mt-0.5">
              {data.date.readable}
            </p>
          </div>

          {/* الصلاة القادمة */}
          {nextPrayer && minutesUntilNext !== null && (
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 px-5 py-5 text-center">
              <p className="font-ui text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
              <p className="font-ui text-3xl font-bold text-primary mb-2">{nextPrayer.label}</p>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-ui text-base text-muted-foreground">
                  بعد {formatCountdown(minutesUntilNext)}
                </p>
              </div>
              <p className="font-ui text-2xl font-bold text-foreground mt-1">
                {toArabicTime(nextPrayer.time)}
              </p>
            </div>
          )}

          {/* قائمة الصلوات */}
          <div className="space-y-2">
            {PRAYERS.map(prayer => {
              const time = data.timings[prayer.key as keyof PrayerTimes];
              const isNext = nextPrayer?.key === prayer.key;
              const Icon = prayer.icon;

              // هل مرّت الصلاة؟
              const [h, m] = time.split(':').map(Number);
              const prayerMinutes = h * 60 + m;
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              const isPast = prayerMinutes < nowMinutes && !isNext;

              return (
                <div
                  key={prayer.key}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all ${
                    isNext
                      ? 'border-primary/40 bg-primary/10 shadow-sm'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isNext ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`h-5 w-5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-ui text-base font-semibold ${isNext ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {prayer.label}
                    </p>
                    {isNext && (
                      <p className="font-ui text-xs text-primary/70 mt-0.5">✦ الصلاة القادمة</p>
                    )}
                    {isPast && !isNext && (
                      <p className="font-ui text-xs text-muted-foreground/50 mt-0.5">مضت</p>
                    )}
                  </div>
                  <p className={`font-ui text-xl font-bold tabular-nums ${
                    isNext ? 'text-primary' : isPast ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground'
                  }`}>
                    {toArabicTime(time)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* طريقة الحساب */}
          <div className="rounded-xl bg-muted/30 px-4 py-3 text-center">
            <p className="font-ui text-[11px] text-muted-foreground">
              حسب توقيت {data.meta.method.name} • تحديث تلقائي كل ساعة
            </p>
          </div>
        </div>
      )}
    </div>
  );
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
