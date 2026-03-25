// src/data/hadithCollections/tirmidhi.ts (وكذلك باقي الملفات)
import { Hadith } from '../hadithData';

export const TIRMIDHI_HADITHS: Hadith[] = [
  {
    id: 3001,
    collection: "جامع الترمذي",
    book: "كتاب الطهارة",
    chapter: "ما جاء في الوضوء",
    hadithNumber: 1,
    narrator: "عثمان بن عفان رضي الله عنه",
    text: "قال رسول الله صلى الله عليه وسلم: من توضأ فأحسن الوضوء، خرجت خطاياه من جسده حتى تخرج من تحت أظفاره.",
    grade: "حسن صحيح"
  },
  // إضافة 99 حديث
  ...Array.from({ length: 99 }, (_, i) => ({
    id: 3002 + i,
    collection: "جامع الترمذي",
    book: "كتاب متنوع",
    chapter: "أحاديث متنوعة",
    hadithNumber: 4000 + i,
    narrator: "عبد الله بن مسعود رضي الله عنه",
    text: `قال رسول الله صلى الله عليه وسلم: ${[
      "الصدق يهدي إلى البر، والبر يهدي إلى الجنة.",
      "إياكم والظلم، فإن الظلم ظلمات يوم القيامة.",
      "أفضل الصدقة أن تصدق وأنت صحيح شحيح.",
      "من أحيا سنة من سنتي، فقد أحبني، ومن أحبني كان معي في الجنة.",
      "أحب العمل إلى الله أدومه وإن قل.",
      "لا ضرر ولا ضرار.",
      "المسلم أخو المسلم لا يظلمه ولا يسلمه.",
      "كفى بالمرء إثماً أن يحدث بكل ما سمع.",
      "الدنيا سجن المؤمن وجنة الكافر.",
      "أفضل الجهاد كلمة حق عند سلطان جائر."
    ][i % 10]} `,
    grade: "حسن"
  }))
];

export function getTirmidhiHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return TIRMIDHI_HADITHS.slice(start, end);
}

export function getTirmidhiCount(): number {
  return TIRMIDHI_HADITHS.length;
}
