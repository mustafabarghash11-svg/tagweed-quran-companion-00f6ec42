import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, Clock, Moon, Sun, Sunrise, Sunset, Star, ChevronRight, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';

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
  { key: 'Fajr', label: 'الفجر', icon: Star },
  { key: 'Sunrise', label: 'الشروق', icon: Sunrise },
  { key: 'Dhuhr', label: 'الظهر', icon: Sun },
  { key: 'Asr', label: 'العصر', icon: Sun },
  { key: 'Maghrib', label: 'المغرب', icon: Sunset },
  { key: 'Isha', label: 'العشاء', icon: Moon },
];

// المدن الشائعة في الأردن
const CITIES = [
  { name: 'عمان', lat: 31.9454, lon: 35.9284 },
  { name: 'الزرقاء', lat: 32.0608, lon: 36.0942 },
  { name: 'إربد', lat: 32.5433, lon: 35.8484 },
  { name: 'الرصيفة', lat: 32.0167, lon: 36.0833 },
  { name: 'السلط', lat: 32.0392, lon: 35.7272 },
  { name: 'مادبا', lat: 31.7167, lon: 35.8 },
  { name: 'الكرك', lat: 31.1833, lon: 35.7 },
  { name: 'العقبة', lat: 29.5319, lon: 35.0056 },
  { name: 'معان', lat: 30.1925, lon: 35.7344 },
  { name: 'الطفيلة', lat: 30.8375, lon: 35.6056 },
  { name: 'جرش', lat: 32.2747, lon: 35.8914 },
  { name: 'عجلون', lat: 32.3333, lon: 35.75 },
  { name: 'مكة المكرمة', lat: 21.3891, lon: 39.8579 },
  { name: 'المدينة المنورة', lat: 24.5247, lon: 39.5692 },
  { name: 'الرياض', lat: 24.7136, lon: 46.6753 },
  { name: 'جدة', lat: 21.4858, lon: 39.1925 },
  { name: 'القاهرة', lat: 30.0444, lon: 31.2357 },
  { name: 'دبي', lat: 25.2048, lon: 55.2708 },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

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
        fetchTimesByCoords(cityData.lat, cityData.lon, cityData.name);
      } catch {
        detectLocation();
      }
    } else {
      detectLocation();
    }
  }, []);

  // دالة جلب أوقات الصلاة
  async function fetchTimesByCoords(lat: number, lon: number, cityName?: string) {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=4`
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

  // دالة تحديد الموقع التلقائي
  function detectLocation() {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع');
      toast.error('المتصفح لا يدعم تحديد الموقع');
      // استخدام عمان كافتراضي
      const defaultCity = CITIES.find(c => c.name === 'عمان') || CITIES[0];
      localStorage.setItem('prayer-city', JSON.stringify(defaultCity));
      fetchTimesByCoords(defaultCity.lat, defaultCity.lon, defaultCity.name);
      return;
    }
    
    setDetectingLocation(true);
    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // جلب اسم المدينة من الإحداثيات
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`
          );
          const geoData = await geoRes.json();
          const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'موقعي الحالي';
          
          const cityData = { name: cityName, lat: latitude, lon: longitude };
          localStorage.setItem('prayer-city', JSON.stringify(cityData));
          setCity(cityName);
          await fetchTimesByCoords(latitude, longitude, cityName);
          toast.success(`تم تحديد موقعك: ${cityName}`);
        } catch {
          const cityData = { name: 'موقعي الحالي', lat: latitude, lon: longitude };
          localStorage.setItem('prayer-city', JSON.stringify(cityData));
          await fetchTimesByCoords(latitude, longitude);
          toast.success('تم تحديد موقعك');
        }
        setDetectingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectingLocation(false);
        
        // فشل تحديد الموقع → استخدام عمان كافتراضي
        toast.error('لم نتمكن من تحديد موقعك، تم استخدام عمان');
        const defaultCity = CITIES.find(c => c.name === 'عمان') || CITIES[0];
        localStorage.setItem('prayer-city', JSON.stringify(defaultCity));
        fetchTimesByCoords(defaultCity.lat, defaultCity.lon, defaultCity.name);
      }
    );
  }

  // دالة اختيار مدينة يدوياً
  function selectCity(cityData: typeof CITIES[0]) {
    localStorage.setItem('prayer-city', JSON.stringify(cityData));
    setCity(cityData.name);
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
            onClick={detectLocation}
            disabled={detectingLocation || loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="تحديد الموقع الحالي"
          >
            {detectingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
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
              {city || (detectingLocation ? 'جاري تحديد الموقع...' : 'اختر المدينة')}
            </span>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showCitySelector ? 'rotate-90' : ''}`} />
        </button>

        {showCitySelector && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-primary/20 bg-card p-3 max-h-64 overflow-y-auto">
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
