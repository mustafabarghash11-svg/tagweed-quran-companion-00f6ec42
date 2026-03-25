// src/data/hadithData.ts
import rawHadiths from './hadiths.json';

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

// تحويل البيانات من JSON
const ALL_HADITHS_RAW: Hadith[] = [
  ...rawHadiths.bukhari,
  ...rawHadiths.muslim,
  ...rawHadiths.tirmidhi,
  ...rawHadiths.abudawud,
  ...rawHadiths.nasai,
  ...rawHadiths.ibnmajah,
];

// دوال جلب البيانات لكل كتاب
const getHadithsByCollection = (collectionId: string): Hadith[] => {
  return ALL_HADITHS_RAW.filter(h => {
    if (collectionId === 'bukhari') return h.collection === 'صحيح البخاري';
    if (collectionId === 'muslim') return h.collection === 'صحيح مسلم';
    if (collectionId === 'tirmidhi') return h.collection === 'جامع الترمذي';
    if (collectionId === 'abudawud') return h.collection === 'سنن أبي داود';
    if (collectionId === 'nasai') return h.collection === 'سنن النسائي';
    if (collectionId === 'ibnmajah') return h.collection === 'سنن ابن ماجه';
    return false;
  });
};

// تصدير الدوال
export const getBukhariHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('bukhari');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getBukhariCount = (): number => getHadithsByCollection('bukhari').length;

export const getMuslimHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('muslim');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getMuslimCount = (): number => getHadithsByCollection('muslim').length;

export const getTirmidhiHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('tirmidhi');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getTirmidhiCount = (): number => getHadithsByCollection('tirmidhi').length;

export const getAbuDawudHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('abudawud');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getAbuDawudCount = (): number => getHadithsByCollection('abudawud').length;

export const getNasaiHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('nasai');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getNasaiCount = (): number => getHadithsByCollection('nasai').length;

export const getIbnMajahHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('ibnmajah');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getIbnMajahCount = (): number => getHadithsByCollection('ibnmajah').length;

// إحصائيات الكتب
export const COLLECTIONS = [
  { id: 'bukhari', name: 'صحيح البخاري', count: getBukhariCount(), getHadiths: getBukhariHadiths },
  { id: 'muslim', name: 'صحيح مسلم', count: getMuslimCount(), getHadiths: getMuslimHadiths },
  { id: 'tirmidhi', name: 'جامع الترمذي', count: getTirmidhiCount(), getHadiths: getTirmidhiHadiths },
  { id: 'abudawud', name: 'سنن أبي داود', count: getAbuDawudCount(), getHadiths: getAbuDawudHadiths },
  { id: 'nasai', name: 'سنن النسائي', count: getNasaiCount(), getHadiths: getNasaiHadiths },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', count: getIbnMajahCount(), getHadiths: getIbnMajahHadiths },
];

// دالة بحث عامة
export function searchHadiths(query: string): Hadith[] {
  const lowerQuery = query.toLowerCase();
  return ALL_HADITHS_RAW.filter(h => 
    h.text.toLowerCase().includes(lowerQuery) ||
    h.narrator.includes(query) ||
    h.book.includes(query)
  ).slice(0, 50);
}

// دالة لجلب حديث بواسطة ID
export function getHadithById(id: number): Hadith | undefined {
  return ALL_HADITHS_RAW.find(h => h.id === id);
}

// طباعة للتأكد
console.log('📚 تم تحميل الأحاديث:');
console.log(`   - صحيح البخاري: ${getBukhariCount()} حديث`);
console.log(`   - صحيح مسلم: ${getMuslimCount()} حديث`);
console.log(`   - جامع الترمذي: ${getTirmidhiCount()} حديث`);
console.log(`   - سنن أبي داود: ${getAbuDawudCount()} حديث`);
console.log(`   - سنن النسائي: ${getNasaiCount()} حديث`);
console.log(`   - سنن ابن ماجه: ${getIbnMajahCount()} حديث`);
console.log(`   📊 المجموع الكلي: ${ALL_HADITHS_RAW.length} حديث`);
