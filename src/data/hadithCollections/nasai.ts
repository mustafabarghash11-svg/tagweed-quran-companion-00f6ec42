import { Hadith } from '../hadithData';

export const NASAI_HADITHS: Hadith[] = [
  {
    id: 5001,
    collection: "سنن النسائي",
    book: "كتاب الطهارة",
    chapter: "فضل الوضوء",
    hadithNumber: 1,
    narrator: "علي بن أبي طالب رضي الله عنه",
    text: "قال رسول الله صلى الله عليه وسلم: مفتاح الصلاة الطهور، وتحريمها التكبير، وتحليلها التسليم.",
    grade: "صحيح"
  },
  // ... باقي 999 حديث
];

export function getNasaiHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return NASAI_HADITHS.slice(start, end);
}

export function getNasaiCount(): number {
  return NASAI_HADITHS.length;
}
