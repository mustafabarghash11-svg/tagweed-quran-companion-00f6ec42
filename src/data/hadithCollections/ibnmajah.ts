import { Hadith } from '../hadithData';

export const IBNMAJAH_HADITHS: Hadith[] = [
  {
    id: 6001,
    collection: "سنن ابن ماجه",
    book: "المقدمة",
    chapter: "فضل أصحاب رسول الله",
    hadithNumber: 1,
    narrator: "عبد الله بن مسعود رضي الله عنه",
    text: "قال رسول الله صلى الله عليه وسلم: خير الناس قرني، ثم الذين يلونهم، ثم الذين يلونهم.",
    grade: "صحيح"
  },
  // ... باقي 999 حديث
];

export function getIbnMajahHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return IBNMAJAH_HADITHS.slice(start, end);
}

export function getIbnMajahCount(): number {
  return IBNMAJAH_HADITHS.length;
}
