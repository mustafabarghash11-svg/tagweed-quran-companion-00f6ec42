// src/data/hadithData.ts
import { BUKHARI_HADITHS, getBukhariHadiths, getBukhariCount } from './hadithCollections/bukhari';
import { MUSLIM_HADITHS, getMuslimHadiths, getMuslimCount } from './hadithCollections/muslim';
import { TIRMIDHI_HADITHS, getTirmidhiHadiths, getTirmidhiCount } from './hadithCollections/tirmidhi';
import { ABUDAWUD_HADITHS, getAbuDawudHadiths, getAbuDawudCount } from './hadithCollections/abudawud';
import { NASAI_HADITHS, getNasaiHadiths, getNasaiCount } from './hadithCollections/nasai';
import { IBNMAJAH_HADITHS, getIbnMajahHadiths, getIbnMajahCount } from './hadithCollections/ibnmajah';

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

// تجميع كل الأحاديث
export const ALL_HADITHS: Hadith[] = [
  ...BUKHARI_HADITHS,
  ...MUSLIM_HADITHS,
  ...TIRMIDHI_HADITHS,
  ...ABUDAWUD_HADITHS,
  ...NASAI_HADITHS,
  ...IBNMAJAH_HADITHS,
];

// إحصائيات الكتب
export const COLLECTIONS = [
  { id: 'bukhari', name: 'صحيح البخاري', count: getBukhariCount(), getHadiths: getBukhariHadiths },
  { id: 'muslim', name: 'صحيح مسلم', count: getMuslimCount(), getHadiths: getMuslimHadiths },
  { id: 'tirmidhi', name: 'جامع الترمذي', count: getTirmidhiCount(), getHadiths: getTirmidhiHadiths },
  { id: 'abudawud', name: 'سنن أبي داود', count: getAbuDawudCount(), getHadiths: getAbuDawudHadiths },
  { id: 'nasai', name: 'سنن النسائي', count: getNasaiCount(), getHadiths: getNasaiHadiths },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', count: getIbnMajahCount(), getHadiths: getIbnMajahHadiths },
];

export function searchHadiths(query: string): Hadith[] {
  const lowerQuery = query.toLowerCase();
  return ALL_HADITHS.filter(h => 
    h.text.toLowerCase().includes(lowerQuery) ||
    h.narrator.includes(query) ||
    h.book.includes(query)
  ).slice(0, 50);
}

export function getHadithById(id: number): Hadith | undefined {
  return ALL_HADITHS.find(h => h.id === id);
}

console.log('📚 تم تحميل الأحاديث:');
console.log(`   - صحيح البخاري: ${getBukhariCount()} حديث`);
console.log(`   - صحيح مسلم: ${getMuslimCount()} حديث`);
console.log(`   - جامع الترمذي: ${getTirmidhiCount()} حديث`);
console.log(`   - سنن أبي داود: ${getAbuDawudCount()} حديث`);
console.log(`   - سنن النسائي: ${getNasaiCount()} حديث`);
console.log(`   - سنن ابن ماجه: ${getIbnMajahCount()} حديث`);
console.log(`   📊 المجموع الكلي: ${ALL_HADITHS.length} حديث`);
