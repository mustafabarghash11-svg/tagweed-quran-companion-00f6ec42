import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Moon, MapPin, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';

// قاعدة بيانات الأذكار الصباحية
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
  },
  {
    id: 7,
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
    count: 3,
    source: "سنن أبي داود",
    reward: "حق على الله أن يرضيه"
  }
];

// قاعدة بيانات الأذكار المسائية
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
  },
  {
    id: 7,
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
    count: 3,
    source: "سنن أبي داود",
    reward: "حق على الله أن يرضيه"
  }
];

// دالة لتحديد الوقت
function getTimeOfDay(): 'morning' | 'evening' | 'night' {
  const now = new Date();
  const hours = now.getHours();
  
  // صباح: 4 صباحاً حتى 11:59
  if (hours >= 4 && hours < 12) return 'morning';
  // مساء: 12 ظهراً حتى 7 مساءً
  if (hours >= 12 && hours < 19) return 'evening';
  // ليل: بعد 7 مساءً حتى 3 صباحاً
  return 'night';
}

export default function DhikrPage() {
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
    
    // تحديث الوقت
    const time = getTimeOfDay();
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

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            {icon}
            <h1 className="font-ui text-lg font-bold">{title}</h1>
          </div>
          <div className="flex-1" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* معلومات الوقت والموقع */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/10 bg-card p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-ui text-sm text-foreground">
              {timeOfDay === 'morning' ? 'وقت الصباح' : timeOfDay === 'evening' ? 'وقت المساء' : 'وقت الليل'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {city && (
              <>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-ui text-xs text-muted-foreground">{city}</span>
              </>
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

        {!isTimeForDhikr ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <Moon className="mx-auto h-12 w-12 text-primary mb-3" />
            <h2 className="font-ui text-xl font-bold text-foreground mb-2">وقت الليل</h2>
            <p className="font-ui text-muted-foreground">
              الأذكار الصباحية تُقرأ من الفجر حتى الظهر<br />
              الأذكار المسائية تُقرأ من العصر حتى المغرب
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>الصباح: 4ص - 12م</span>
              </div>
              <div className="flex items-center gap-1">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>المساء: 12م - 7م</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-4">
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
            <div className="space-y-3">
              {dhikrList.map((dhikr) => {
                const isCompleted = completed.includes(dhikr.id);
                const currentCount = counts[dhikr.id] || 0;
                const remaining = dhikr.count - currentCount;
                
                return (
                  <div
                    key={dhikr.id}
                    className={`rounded-xl p-4 transition-all ${
                      isCompleted
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-card border border-primary/10'
                    }`}
                  >
                    <p className="font-ui text-base leading-relaxed text-foreground mb-3">
                      {dhikr.text}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-ui text-[10px] text-primary">
                          {dhikr.source}
                        </span>
                        {dhikr.count > 1 && (
                          <span className="font-ui text-xs text-muted-foreground">
                            {toArabicNumeral(remaining)}/{toArabicNumeral(dhikr.count)} متبقي
                          </span>
                        )}
                      </div>
                      {!isCompleted ? (
                        <button
                          onClick={() => handleComplete(dhikr.id, dhikr.count)}
                          className="rounded-lg bg-primary px-4 py-2 font-ui text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95"
                        >
                          {dhikr.count > 1 ? `+1 (${toArabicNumeral(currentCount)}/${toArabicNumeral(dhikr.count)})` : 'تم'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 font-ui text-xs font-medium text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          مكتمل
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-6 rounded-xl bg-primary/5 p-4 text-center">
              <p className="font-ui text-xs text-muted-foreground">
                📖 قال رسول الله صلى الله عليه وسلم: "مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
