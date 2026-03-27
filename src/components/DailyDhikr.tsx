import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, MapPin, ChevronLeft } from 'lucide-react';
import { toArabicNumeral } from '@/lib/quran-api';

// قاعدة بيانات الأذكار الصباحية (مختصرة للعرض في الصفحة الرئيسية)
const MORNING_DHIKR_PREVIEW = [
  {
    id: 1,
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ...",
    count: 1,
    source: "صحيح مسلم"
  },
  {
    id: 2,
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
    count: 1,
    source: "سنن الترمذي"
  },
  {
    id: 3,
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    count: 100,
    source: "صحيح مسلم"
  }
];

const EVENING_DHIKR_PREVIEW = [
  {
    id: 1,
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ...",
    count: 1,
    source: "صحيح مسلم"
  },
  {
    id: 2,
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
    count: 1,
    source: "سنن الترمذي"
  },
  {
    id: 3,
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    count: 100,
    source: "صحيح مسلم"
  }
];

// دالة لتحديد الوقت (صباح/مساء) بدقة
function getTimeOfDay(): 'morning' | 'evening' {
  const now = new Date();
  const hours = now.getHours();
  
  // صباح: من 4 صباحاً حتى 12 ظهراً
  if (hours >= 4 && hours < 12) {
    return 'morning';
  }
  // مساء: من 12 ظهراً حتى 8 مساءً
  if (hours >= 12 && hours < 20) {
    return 'evening';
  }
  // بعد 8 مساءً حتى 4 صباحاً: عرض أذكار المساء (لأنها تُقرأ حتى المغرب)
  return 'evening';
}

export function DailyDhikr() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>(getTimeOfDay());
  const [city, setCity] = useState<string>('');
  const [completedCount, setCompletedCount] = useState(0);
  const totalCount = 8; // إجمالي الأذكار

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = getTimeOfDay();
      if (newTime !== timeOfDay) {
        setTimeOfDay(newTime);
      }
    }, 60000); // كل 60 ثانية
    
    return () => clearInterval(interval);
  }, [timeOfDay]);

  // تحميل المدينة والأذكار المكتملة
  useEffect(() => {
    const savedCity = localStorage.getItem('prayer-city');
    if (savedCity) {
      try {
        const cityData = JSON.parse(savedCity);
        setCity(cityData.name);
      } catch { }
    }
    
    const savedCompleted = localStorage.getItem('dhikr-completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    }
  }, []);

  // تحديث عند تغيير الوقت
  useEffect(() => {
    // إعادة تحميل عدد الأذكار المكتملة عند تغيير الوقت
    const savedCompleted = localStorage.getItem('dhikr-completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    } else {
      setCompletedCount(0);
    }
  }, [timeOfDay]);

  const title = timeOfDay === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  const icon = timeOfDay === 'morning' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />;
  const dhikrList = timeOfDay === 'morning' ? MORNING_DHIKR_PREVIEW : EVENING_DHIKR_PREVIEW;

  return (
    <Link to="/dhikr" className="block mx-auto max-w-lg px-4 mb-5">
      <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer active:scale-[0.98]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/10">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-ui text-base font-bold text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="font-ui text-[10px] text-muted-foreground">{city}</span>
              </div>
            )}
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between font-ui text-xs text-muted-foreground mb-1">
            <span>تقدم الأذكار</span>
            <span>{toArabicNumeral(completedCount)} / {toArabicNumeral(totalCount)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Dhikr Preview */}
        <div className="space-y-2">
          {dhikrList.map((dhikr) => (
            <div
              key={dhikr.id}
              className="rounded-lg bg-muted/30 p-2"
            >
              <p className="font-ui text-sm leading-relaxed text-foreground line-clamp-2">
                {dhikr.text}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-ui text-[10px] text-primary">
                  {dhikr.source}
                </span>
                {dhikr.count > 1 && (
                  <span className="font-ui text-[10px] text-muted-foreground">
                    {toArabicNumeral(dhikr.count)} مرة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-primary/10 text-center">
          <p className="font-ui text-[10px] text-primary">
            اضغط لعرض جميع الأذكار ←
          </p>
        </div>
      </div>
    </Link>
  );
    }
