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
  // ... باقي 999 حديث
];

export function getTirmidhiHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return TIRMIDHI_HADITHS.slice(start, end);
}

export function getTirmidhiCount(): number {
  return TIRMIDHI_HADITHS.length;
}
