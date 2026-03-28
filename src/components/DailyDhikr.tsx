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
  }
];

// دالة لتحديد الوقت (صباح/مساء)
// الصباح: من الفجر حتى المغرب (4 ص - 6 م)
// المساء: من المغرب حتى الفجر (6 م - 4 ص)
function getTimeOfDay(): 'morning' | 'evening' {
  const now = new Date();
  const hours = now.getHours();
  
  // صباح: من 4 صباحاً حتى 6 مساءً
  if (hours >= 4 && hours < 18) {
    return 'morning';
  }
  // مساء: من 6 مساءً حتى 4 صباحاً
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
    }, 60000);
    
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
    const savedCompleted = localStorage.getItem('dhikr-completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    } else {
      setCompletedCount(0);
    }
  }, [timeOfDay]);

  const title = timeOfDay === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  const timeRange = timeOfDay === 'morning' ? 'من الفجر حتى المغرب' : 'من المغرب حتى الفجر';
  const icon = timeOfDay === 'morning' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />;
  const dhikrList = timeOfDay === 'morning' ? MORNING_DHIKR_PREVIEW : EVENING_DHIKR_PREVIEW;

  return (
    <Link to="/dhikr" className="block mx-auto max-w-lg px-4 mb-4">
      <div className="rounded-xl border border-primary/20 bg-card p-3 shadow-sm hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer active:scale-[0.98]">
        {/* Header - مصغر */}
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-primary/10">
          <div className="flex items-center gap-1.5">
            {icon}
            <h3 className="font-ui text-sm font-bold text-foreground">{title}</h3>
            <span className="font-ui text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {timeRange}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {city && (
              <div className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="font-ui text-[9px] text-muted-foreground">{city}</span>
              </div>
            )}
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Progress - مصغر */}
        <div className="mb-2">
          <div className="flex justify-between font-ui text-[10px] text-muted-foreground mb-0.5">
            <span>تقدم الأذكار</span>
            <span>{toArabicNumeral(completedCount)} / {toArabicNumeral(totalCount)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Dhikr Preview - مصغر */}
        <div className="space-y-1.5">
          {dhikrList.map((dhikr) => (
            <div
              key={dhikr.id}
              className="rounded-lg bg-muted/30 p-1.5"
            >
              <p className="font-ui text-xs leading-relaxed text-foreground line-clamp-1">
                {dhikr.text}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-ui text-[9px] text-primary">
                  {dhikr.source}
                </span>
                {dhikr.count > 1 && (
                  <span className="font-ui text-[9px] text-muted-foreground">
                    {toArabicNumeral(dhikr.count)} مرة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer - مصغر */}
        <div className="mt-2 pt-1 border-t border-primary/10 text-center">
          <p className="font-ui text-[9px] text-primary">
            اضغط لعرض جميع الأذكار ←
          </p>
        </div>
      </div>
    </Link>
  );
                }
