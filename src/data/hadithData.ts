// src/data/hadithData.ts
export interface Hadith {
  id: number;
  collection: string;
  book: string;
  chapter: string;
  hadithNumber: number;
  narrator: string;
  text: string;
  grade: string;
}

// قاعدة بيانات مؤقتة (500 حديث نموذجية)
export const ALL_HADITHS: Hadith[] = [];

// إحصائيات الكتب
export const COLLECTIONS = [
  { id: 'bukhari', name: 'صحيح البخاري', count: 0, getHadiths: () => [] },
  { id: 'muslim', name: 'صحيح مسلم', count: 0, getHadiths: () => [] },
  { id: 'tirmidhi', name: 'جامع الترمذي', count: 0, getHadiths: () => [] },
  { id: 'abudawud', name: 'سنن أبي داود', count: 0, getHadiths: () => [] },
  { id: 'nasai', name: 'سنن النسائي', count: 0, getHadiths: () => [] },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', count: 0, getHadiths: () => [] },
];

export function searchHadiths(query: string): Hadith[] {
  return [];
}

export function getHadithById(id: number): Hadith | undefined {
  return undefined;
}
