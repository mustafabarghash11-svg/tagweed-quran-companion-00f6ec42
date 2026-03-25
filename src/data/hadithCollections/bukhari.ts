import { Hadith } from '../hadithData';

export const BUKHARI_HADITHS: Hadith[] = [
  // كتاب بدء الوحي
  {
    id: 1001,
    collection: "صحيح البخاري",
    book: "كتاب بدء الوحي",
    chapter: "كيف كان بدء الوحي",
    hadithNumber: 1,
    narrator: "عمر بن الخطاب رضي الله عنه",
    text: "سمعت رسول الله صلى الله عليه وسلم يقول: إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه.",
    grade: "صحيح"
  },
  {
    id: 1002,
    collection: "صحيح البخاري",
    book: "كتاب بدء الوحي",
    chapter: "كيف كان بدء الوحي",
    hadithNumber: 2,
    narrator: "عائشة أم المؤمنين رضي الله عنها",
    text: "أول ما بدئ به رسول الله صلى الله عليه وسلم من الوحي الرؤيا الصالحة في النوم، فكان لا يرى رؤيا إلا جاءت مثل فلق الصبح...",
    grade: "صحيح"
  },
  {
    id: 1003,
    collection: "صحيح البخاري",
    book: "كتاب بدء الوحي",
    chapter: "كيف كان بدء الوحي",
    hadithNumber: 3,
    narrator: "عائشة أم المؤمنين رضي الله عنها",
    text: "جاء جبريل عليه السلام إلى النبي صلى الله عليه وسلم وهو في غار حراء، فقال: اقرأ، قال: ما أنا بقارئ...",
    grade: "صحيح"
  },
  // ... باقي 997 حديث
];

// دالة لجلب أحاديث البخاري مع تجزئة
export function getBukhariHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return BUKHARI_HADITHS.slice(start, end);
}

export function getBukhariCount(): number {
  return BUKHARI_HADITHS.length;
}
