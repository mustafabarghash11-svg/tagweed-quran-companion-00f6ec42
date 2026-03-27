import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toArabicNumeral } from '@/lib/quran-api';

// أسماء الله الحسنى
const ALLAH_NAMES = [
  { number: 1, name: "الرحمن", meaning: "ذو الرحمة الواسعة", evidence: "الرحمن علم القرآن" },
  { number: 2, name: "الرحيم", meaning: "الذي يرحم عباده", evidence: "إن الله بالناس لرؤوف رحيم" },
  { number: 3, name: "الملك", meaning: "المالك لجميع الأشياء", evidence: "الملك القدوس السلام" },
  { number: 4, name: "القدوس", meaning: "المنزه عن كل عيب", evidence: "الملك القدوس السلام" },
  { number: 5, name: "السلام", meaning: "الذي سلم من كل نقص", evidence: "الملك القدوس السلام" },
  { number: 6, name: "المؤمن", meaning: "المصدق لرسله", evidence: "المؤمن المهيمن العزيز" },
  { number: 7, name: "المهيمن", meaning: "الرقيب على خلقه", evidence: "المؤمن المهيمن العزيز" },
  { number: 8, name: "العزيز", meaning: "الذي لا يغلب", evidence: "العزيز الجبار المتكبر" },
  { number: 9, name: "الجبار", meaning: "الذي يجبر الكسر", evidence: "العزيز الجبار المتكبر" },
  { number: 10, name: "المتكبر", meaning: "المتعالي عن صفات الخلق", evidence: "العزيز الجبار المتكبر" },
  { number: 11, name: "الخالق", meaning: "المقدر للأشياء", evidence: "الخالق البارئ المصور" },
  { number: 12, name: "البارئ", meaning: "المنشئ للأشياء", evidence: "الخالق البارئ المصور" },
  { number: 13, name: "المصور", meaning: "المصور للأشياء", evidence: "الخالق البارئ المصور" },
  { number: 14, name: "الغفار", meaning: "الغافر للذنوب", evidence: "غافر الذنب وقابل التوب" },
  { number: 15, name: "القهار", meaning: "القاهر لخلقه", evidence: "القهار" },
  { number: 16, name: "الوهاب", meaning: "الواسع العطاء", evidence: "ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة" },
  { number: 17, name: "الرزاق", meaning: "الذي يرزق عباده", evidence: "إن الله هو الرزاق ذو القوة المتين" },
  { number: 18, name: "الفتاح", meaning: "الذي يفتح الأبواب", evidence: "ربنا افتح بيننا وبين قومنا بالحق وأنت خير الفاتحين" },
  { number: 19, name: "العليم", meaning: "الذي يعلم كل شيء", evidence: "إن الله بكل شيء عليم" },
  { number: 20, name: "القابض", meaning: "الذي يقبض الأرزاق", evidence: "والله يقبض ويبسط" },
  { number: 21, name: "الباسط", meaning: "الذي يبسط الأرزاق", evidence: "والله يقبض ويبسط" },
  { number: 22, name: "الخافض", meaning: "الذي يخفض من يشاء", evidence: "رافع الدرجات خافضها" },
  { number: 23, name: "الرافع", meaning: "الذي يرفع من يشاء", evidence: "رافع الدرجات خافضها" },
  { number: 24, name: "المعز", meaning: "المعز لمن يشاء", evidence: "قل اللهم مالك الملك تؤتي الملك من تشاء وتعز من تشاء" },
  { number: 25, name: "المذل", meaning: "المذل لمن يشاء", evidence: "وتذل من تشاء بيدك الخير" },
  { number: 26, name: "السميع", meaning: "الذي يسمع كل شيء", evidence: "إن الله سميع بصير" },
  { number: 27, name: "البصير", meaning: "الذي يبصر كل شيء", evidence: "إن الله سميع بصير" },
  { number: 28, name: "الحكم", meaning: "الحاكم بين عباده", evidence: "والله خير الحاكمين" },
  { number: 29, name: "العدل", meaning: "الذي لا يظلم", evidence: "إن الله يأمر بالعدل والإحسان" },
  { number: 30, name: "اللطيف", meaning: "الذي يلطف بعباده", evidence: "لا تدركه الأبصار وهو يدرك الأبصار وهو اللطيف الخبير" },
  { number: 31, name: "الخبير", meaning: "الذي يعلم خفايا الأمور", evidence: "وهو اللطيف الخبير" },
  { number: 32, name: "الحليم", meaning: "الذي لا يعجل بالعقوبة", evidence: "إن الله لغفور حليم" },
  { number: 33, name: "العظيم", meaning: "الذي لا يوصف", evidence: "فسبح باسم ربك العظيم" },
  { number: 34, name: "الغفور", meaning: "الغافر للذنوب", evidence: "إن الله غفور رحيم" },
  { number: 35, name: "الشكور", meaning: "الذي يشكر القليل", evidence: "إن الله لذو فضل على الناس ولكن أكثرهم لا يشكرون" },
  { number: 36, name: "العلي", meaning: "الرفيع الدرجات", evidence: "وهو العلي العظيم" },
  { number: 37, name: "الكبير", meaning: "الكبير في ذاته", evidence: "إن الله هو العلي الكبير" },
  { number: 38, name: "الحفيظ", meaning: "الحافظ لخلقه", evidence: "فحسبنا الله ونعم الوكيل" },
  { number: 39, name: "المقيت", meaning: "المقتدر على كل شيء", evidence: "وكان الله على كل شيء مقيتا" },
  { number: 40, name: "الحسيب", meaning: "المحاسب لعباده", evidence: "وكفى بالله حسيبا" },
  { number: 41, name: "الجليل", meaning: "عظيم الشأن", evidence: "ويبقى وجه ربك ذو الجلال والإكرام" },
  { number: 42, name: "الكريم", meaning: "الجواد المعطي", evidence: "اقرأ وربك الأكرم" },
  { number: 43, name: "الرقيب", meaning: "المراقب لأعمال العباد", evidence: "إن الله كان عليكم رقيبا" },
  { number: 44, name: "المجيب", meaning: "المستجيب للدعاء", evidence: "إن ربي قريب مجيب" },
  { number: 45, name: "الواسع", meaning: "الذي وسع كل شيء", evidence: "إن الله واسع عليم" },
  { number: 46, name: "الحكيم", meaning: "المحكم للأمور", evidence: "وكان الله عليما حكيما" },
  { number: 47, name: "الودود", meaning: "المحب لعباده", evidence: "إن ربي رحيم ودود" },
  { number: 48, name: "المجيد", meaning: "كثير الكرم", evidence: "إنه حميد مجيد" },
  { number: 49, name: "الباعث", meaning: "الباعث للخلق بعد الموت", evidence: "إن الله باعث من في القبور" },
  { number: 50, name: "الشهيد", meaning: "الحاضر لكل شيء", evidence: "وكان الله على كل شيء شهيدا" },
  { number: 51, name: "الحق", meaning: "الثابت وجوده", evidence: "وأن الله هو الحق المبين" },
  { number: 52, name: "الوكيل", meaning: "الكفيل بأمور عباده", evidence: "وكان الله على كل شيء وكيلا" },
  { number: 53, name: "القوي", meaning: "ذو القوة والقدرة", evidence: "إن الله هو القوي العزيز" },
  { number: 54, name: "المتين", meaning: "الشديد القوة", evidence: "إن الله هو الرزاق ذو القوة المتين" },
  { number: 55, name: "الولي", meaning: "المتولي لأمور عباده", evidence: "وكان الله وليا للمؤمنين" },
  { number: 56, name: "الحميد", meaning: "المحمود في كل حال", evidence: "إن الله لغني حميد" },
  { number: 57, name: "المحصي", meaning: "الذي أحصى كل شيء", evidence: "وأحصى كل شيء عددا" },
  { number: 58, name: "المبدئ", meaning: "الذي بدأ الخلق", evidence: "إنه يبدأ ويعيد" },
  { number: 59, name: "المعيد", meaning: "الذي يعيد الخلق", evidence: "إنه يبدأ ويعيد" },
  { number: 60, name: "المحيي", meaning: "الذي يحيي الموتى", evidence: "يحيي ويميت" },
  { number: 61, name: "المميت", meaning: "الذي يميت الأحياء", evidence: "يحيي ويميت" },
  { number: 62, name: "الحي", meaning: "الباقي أبداً", evidence: "وتوكل على الحي الذي لا يموت" },
  { number: 63, name: "القيوم", meaning: "القائم بذاته", evidence: "الله لا إله إلا هو الحي القيوم" },
  { number: 64, name: "الواجد", meaning: "الذي لا يعجزه شيء", evidence: "ووجد الله عنده فوفاه حسابه" },
  { number: 65, name: "الماجد", meaning: "الكريم الواسع", evidence: "تبارك اسم ربك ذي الجلال والإكرام" },
  { number: 66, name: "الواحد", meaning: "المنفرد بذاته", evidence: "وإلهكم إله واحد" },
  { number: 67, name: "الأحد", meaning: "الذي لا شريك له", evidence: "قل هو الله أحد" },
  { number: 68, name: "الصمد", meaning: "الذي يصمد إليه في الحوائج", evidence: "الله الصمد" },
  { number: 69, name: "القادر", meaning: "القادر على كل شيء", evidence: "إن الله على كل شيء قدير" },
  { number: 70, name: "المقتدر", meaning: "القادر القوي", evidence: "إن الله على كل شيء قدير" },
  { number: 71, name: "المقدم", meaning: "الذي يقدم ما يشاء", evidence: "وما قدموا لأنفسكم من خير تجدوه عند الله" },
  { number: 72, name: "المؤخر", meaning: "الذي يؤخر ما يشاء", evidence: "ربنا إنك تجمع الناس ليوم لا ريب فيه" },
  { number: 73, name: "الأول", meaning: "الذي ليس قبله شيء", evidence: "هو الأول والآخر" },
  { number: 74, name: "الآخر", meaning: "الذي ليس بعده شيء", evidence: "هو الأول والآخر" },
  { number: 75, name: "الظاهر", meaning: "الذي ظهر فوق كل شيء", evidence: "وهو الظاهر والباطن" },
  { number: 76, name: "الباطن", meaning: "الذي بطن عن إدراك الخلق", evidence: "وهو الظاهر والباطن" },
  { number: 77, name: "الوالي", meaning: "المتولي لأمور عباده", evidence: "إن وليي الله الذي نزل الكتاب" },
  { number: 78, name: "المتعالي", meaning: "المتعالي عن صفات الخلق", evidence: "عالم الغيب والشهادة الكبير المتعال" },
  { number: 79, name: "البر", meaning: "العطوف على عباده", evidence: "إنه كان برا رحيما" },
  { number: 80, name: "التواب", meaning: "الذي يقبل التوبة", evidence: "إن الله كان توابا رحيما" },
  { number: 81, name: "المنتقم", meaning: "الذي ينتقم من الكافرين", evidence: "إنا من المجرمين منتقمون" },
  { number: 82, name: "العفو", meaning: "الذي يمحو الذنوب", evidence: "إن الله كان عفوا غفورا" },
  { number: 83, name: "الرؤوف", meaning: "الشديد الرحمة", evidence: "إن الله بالناس لرؤوف رحيم" },
  { number: 84, name: "مالك الملك", meaning: "المالك للملك", evidence: "قل اللهم مالك الملك" },
  { number: 85, name: "ذو الجلال والإكرام", meaning: "صاحب العظمة والكرم", evidence: "ويبقى وجه ربك ذو الجلال والإكرام" },
  { number: 86, name: "المقسط", meaning: "العادل", evidence: "إن الله يحب المقسطين" },
  { number: 87, name: "الجامع", meaning: "الجامع للناس", evidence: "إن الله جامع المنافقين والكافرين" },
  { number: 88, name: "الغني", meaning: "الغني عن خلقه", evidence: "إن الله لغني عن العالمين" },
  { number: 89, name: "المغني", meaning: "المغني لمن يشاء", evidence: "وأنه هو أغن وأقنى" },
  { number: 90, name: "المانع", meaning: "الذي يمنع ما يشاء", evidence: "قل من يمنعكم من الله" },
  { number: 91, name: "الضار", meaning: "الذي يضر من يشاء", evidence: "قل لا أملك لنفسي نفعا ولا ضرا" },
  { number: 92, name: "النافع", meaning: "الذي ينفع من يشاء", evidence: "قل لا أملك لنفسي نفعا ولا ضرا" },
  { number: 93, name: "النور", meaning: "الهادي لخلقه", evidence: "الله نور السموات والأرض" },
  { number: 94, name: "الهادي", meaning: "المرشد لعباده", evidence: "والله يهدي من يشاء" },
  { number: 95, name: "البديع", meaning: "الذي خلق الخلق", evidence: "بديع السموات والأرض" },
  { number: 96, name: "الباقي", meaning: "الباقي بعد فناء خلقه", evidence: "ويبقى وجه ربك" },
  { number: 97, name: "الوارث", meaning: "الذي يرث الأرض", evidence: "إنا نحن نرث الأرض" },
  { number: 98, name: "الرشيد", meaning: "المرشد إلى الصواب", evidence: "إن ربي لطيف لما يشاء" },
  { number: 99, name: "الصبور", meaning: "الذي لا يعجل بالعقوبة", evidence: "إن الله مع الصابرين" }
];

export default function NamesOfAllah() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<typeof ALLAH_NAMES[0] | null>(null);

  const filteredNames = ALLAH_NAMES.filter(name =>
    name.name.includes(searchQuery) ||
    name.meaning.includes(searchQuery)
  );

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h1 className="font-ui text-lg font-bold">أسماء الله الحسنى</h1>
          </div>
          <div className="flex-1" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم من أسماء الله..."
              className="pr-9 font-ui text-right"
              dir="rtl"
            />
          </div>
        </div>

        {/* Hero */}
        <div className="mb-6 text-center">
          <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
            <p className="font-ui text-sm text-muted-foreground">
              قال رسول الله صلى الله عليه وسلم:
            </p>
            <p className="font-ui text-base font-bold text-primary mt-1">
              "إن لله تسعةً وتسعين اسمًا، مائة إلا واحدًا، من أحصاها دخل الجنة"
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-2">
              [رواه البخاري ومسلم]
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-card p-3 border border-primary/10">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-ui text-sm text-foreground">عدد الأسماء</span>
          </div>
          <span className="font-ui text-xl font-bold text-primary">{toArabicNumeral(99)}</span>
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredNames.map((name) => (
            <button
              key={name.number}
              onClick={() => setSelectedName(name)}
              className="group rounded-xl border border-primary/10 bg-card p-3 text-center transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-ui text-[10px] text-muted-foreground">
                  {toArabicNumeral(name.number)}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-ui text-lg font-bold text-primary">{name.name}</p>
              <p className="font-ui text-xs text-muted-foreground line-clamp-1">{name.meaning}</p>
            </button>
          ))}
        </div>

        {filteredNames.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-ui text-muted-foreground">لا توجد نتائج لـ "{searchQuery}"</p>
          </div>
        )}

        {/* Modal for selected name */}
        {selectedName && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedName(null)} />
            <div className="fixed bottom-0 inset-x-0 z-50 max-h-[70vh] rounded-t-2xl bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-primary/20 p-4">
                <div>
                  <p className="font-ui text-xs text-muted-foreground">الاسم رقم {toArabicNumeral(selectedName.number)}</p>
                  <h2 className="font-ui text-2xl font-bold text-primary">{selectedName.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedName(null)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
                <div>
                  <p className="font-ui text-sm font-bold text-primary mb-1">المعنى:</p>
                  <p className="font-ui text-base text-foreground">{selectedName.meaning}</p>
                </div>
                <div>
                  <p className="font-ui text-sm font-bold text-primary mb-1">الدليل من القرآن:</p>
                  <p className="font-quran text-base text-right text-foreground">"{selectedName.evidence}"</p>
                </div>
                <div className="pt-3 border-t border-primary/10">
                  <p className="font-ui text-xs text-muted-foreground">
                    قال رسول الله صلى الله عليه وسلم: "من أحصاها دخل الجنة"
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
   }
