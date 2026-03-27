import { useState, useEffect } from 'react';
import { Sun, Moon, Clock, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';

// قاعدة بيانات الأذكار
const MORNING_DHIKR = [
  {
    id: 1,
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    count: 1,
    source: "صحيح مسلم",
    reward: "حصن المسلم"
  },
  {
    id: 2,
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
    count: 1,
    source: "سنن الترمذي",
    reward: "حصن المسلم"
  },
  {
    id: 3,
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    count: 1,
    source: "صحيح البخاري",
    reward: "سيد الاستغفار"
  },
  {
    id: 4,
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    count: 100,
    source: "صحيح مسلم",
    reward: "حطت خطاياه"
  },
  {
    id: 5,
    text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
    count: 100,
    source: "صحيح البخاري",
    reward: "يغفر له"
  },
  {
    id: 6,
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    count: 10,
    source: "صحيح البخاري",
    reward: "عتق رقبة"
  }
];

const EVENING_DHIKR = [
  {
    id: 1,
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    count: 1,
    source: "صحيح مسلم",
    reward: "حصن المسلم"
  },
  {
    id: 2,
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
    count: 1,
    source: "سنن الترمذي",
    reward: "حصن المسلم"
  },
  {
    id: 3,
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    count: 1,
    source: "صحيح البخاري",
    reward: "سيد الاستغفار"
  },
  {
    id: 4,
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    count: 100,
    source: "صحيح مسلم",
    reward: "حطت خطاياه"
  },
  {
    id: 5,
    text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
    count: 100,
    source: "صحيح البخاري",
    reward: "يغفر له"
  },
  {
    id: 6,
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    count: 10,
    source: "صحيح البخاري",
    reward: "عتق رقبة"
  }
];

// دالة لتحديد الوقت (صباح/مساء) بناءً على الموقع
function getTimeOfDay(latitude: number, longitude: number): 'morning' | 'evening' | 'night' {
  const now = new Date();
  const hours = now.getHours();
  
  // صباح: 4 صباحاً حتى 11:59
  if (hours >= 4 && hours < 12) return 'morning';
  // مساء: 12 ظهراً حتى 7 مساءً
  if (hours >= 12 && hours < 19) return 'evening';
  // ليل: بعد 7 مساءً حتى 3 صباحاً
  return 'night';
}

export function DailyDhikr() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'night'>('morning');
  const [dhikrList, setDhikrList] = useState(MORNING_DHIKR);
  const [completed, setCompleted] = useState<number[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [city, setCity] = useState<string>('');

  // تحميل الإعدادات المحفوظة
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
      setCompleted(JSON.parse(savedCompleted));
    }
    
    const savedCounts = localStorage.getItem('dhikr-counts');
    if (savedCounts) {
      setCounts(JSON.parse(savedCounts));
    }
  }, []);

  // تحديد الوقت وتحديث الأذكار
  useEffect(() => {
    // استخدام مكة كإفتراضي إذا لم يوجد موقع
    const lat = 21.3891;
    const lon = 39.8579;
    const time = getTimeOfDay(lat, lon);
    setTimeOfDay(time);
    
    if (time === 'morning') {
      setDhikrList(MORNING_DHIKR);
    } else if (time === 'evening') {
      setDhikrList(EVENING_DHIKR);
    }
  }, []);

  const handleComplete = (id: number, totalCount: number) => {
    const currentCount = counts[id] || 0;
    const newCount = currentCount + 1;
    
    if (newCount >= totalCount) {
      // تم إكمال الذكر
      if (!completed.includes(id)) {
        const newCompleted = [...completed, id];
        setCompleted(newCompleted);
        localStorage.setItem('dhikr-completed', JSON.stringify(newCompleted));
        toast.success(`تم إكمال الذكر ✓`);
      }
    }
    
    const newCounts = { ...counts, [id]: newCount };
    setCounts(newCounts);
    localStorage.setItem('dhikr-counts', JSON.stringify(newCounts));
  };

  const resetDay = () => {
    setCompleted([]);
    setCounts({});
    localStorage.removeItem('dhikr-completed');
    localStorage.removeItem('dhikr-counts');
    toast.success('تم إعادة تعيين الأذكار');
  };

  const isTimeForDhikr = timeOfDay !== 'night';
  const title = timeOfDay === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  const icon = timeOfDay === 'morning' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />;

  if (!isTimeForDhikr) {
    return (
      <div className="mx-auto max-w-lg px-4 mb-5">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="font-ui text-base font-bold text-foreground">وقت الليل</h3>
          </div>
          <p className="font-ui text-sm text-muted-foreground">
            الأذكار الصباحية والمسائية تُقرأ في الصباح والمساء
          </p>
          <p className="font-ui text-xs text-muted-foreground mt-2">
            ⏰ الأذكار الصباحية: من الفجر حتى الظهر<br />
            ⏰ الأذكار المسائية: من العصر حتى المغرب
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 mb-5">
      <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm">
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
            <button
              onClick={resetDay}
              className="rounded-lg p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              title="إعادة تعيين"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between font-ui text-xs text-muted-foreground mb-1">
            <span>تقدم الأذكار</span>
            <span>{toArabicNumeral(completed.length)} / {toArabicNumeral(dhikrList.length)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completed.length / dhikrList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Dhikr List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {dhikrList.map((dhikr) => {
            const isCompleted = completed.includes(dhikr.id);
            const currentCount = counts[dhikr.id] || 0;
            const remaining = dhikr.count - currentCount;
            
            return (
              <div
                key={dhikr.id}
                className={`rounded-xl p-3 transition-all ${
                  isCompleted
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-muted/30 border border-primary/10'
                }`}
              >
                <p className="font-ui text-sm leading-relaxed text-foreground mb-2">
                  {dhikr.text}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-ui text-[10px] text-primary">
                      {dhikr.source}
                    </span>
                    {dhikr.count > 1 && (
                      <span className="font-ui text-[10px] text-muted-foreground">
                        {toArabicNumeral(remaining)}/{toArabicNumeral(dhikr.count)} متبقي
                      </span>
                    )}
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => handleComplete(dhikr.id, dhikr.count)}
                      className="rounded-lg bg-primary px-3 py-1.5 font-ui text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95"
                    >
                      {dhikr.count > 1 ? `+1 (${toArabicNumeral(currentCount)}/${toArabicNumeral(dhikr.count)})` : 'تم'}
                    </button>
                  )}
                  {isCompleted && (
                    <span className="rounded-lg bg-green-500/20 px-3 py-1.5 font-ui text-xs font-medium text-green-600 dark:text-green-400">
                      ✓ مكتمل
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2 border-t border-primary/10">
          <p className="font-ui text-[10px] text-muted-foreground text-center">
            📖 قال رسول الله صلى الله عليه وسلم: "مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت"
          </p>
        </div>
      </div>
    </div>
  );
}
