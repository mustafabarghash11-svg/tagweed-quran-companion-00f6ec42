import { Hadith } from '../hadithData';

export const ABUDAWUD_HADITHS: Hadith[] = [
  {
    id: 4001,
    collection: "سنن أبي داود",
    book: "كتاب الطهارة",
    chapter: "فضل الوضوء",
    hadithNumber: 1,
    narrator: "أبو هريرة رضي الله عنه",
    text: "قال رسول الله صلى الله عليه وسلم: إذا توضأ العبد المسلم أو المؤمن فغسل وجهه، خرج من وجهه كل خطيئة نظر إليها بعينيه مع الماء أو مع آخر قطر الماء...",
    grade: "صحيح"
  },
  // ... باقي 999 حديث
];

export function getAbuDawudHadiths(page: number = 1, limit: number = 20): Hadith[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return ABUDAWUD_HADITHS.slice(start, end);
}

export function getAbuDawudCount(): number {
  return ABUDAWUD_HADITHS.length;
}
