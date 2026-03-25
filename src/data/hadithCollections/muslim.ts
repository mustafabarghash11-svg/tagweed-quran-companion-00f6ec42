import { Hadith } from '../hadithData';

export const MUSLIM_HADITHS: Hadith[] = [
  {
    id: 2001,
    collection: "صحيح مسلم",
    book: "كتاب الإيمان",
    chapter: "بيان الإيمان والإسلام والإحسان",
    hadithNumber: 8,
    narrator: "عمر بن الخطاب رضي الله عنه",
    text: "بينما نحن جلوس عند رسول الله صلى الله عليه وسلم ذات يوم، إذ طلع علينا رجل شديد بياض الثياب شديد سواد الشعر...",
    grade: "صحيح"
  },
  {
    id: 2002,
    collection: "صحيح مسلم",
    book: "كتاب الإيمان",
    chapter: "الدليل على أن من مات على التوحيد دخل الجنة",
    hadithNumber: 22,
    narrator: "أبو هريرة رضي الله عنه",
    text: "قال رسول الله صلى الله عليه وسلم: من قال لا إله إلا الله دخل الجنة.",
    grade: "صحيح"
  },
  // ... باقي 998 حديث
];

export function getMuslimHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return MUSLIM_HADITHS.slice(start, end);
}

export function getMuslimCount(): number {
  return MUSLIM_HADITHS.length;
}
