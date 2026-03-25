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

// تحويل البيانات من hadith.json
// هيكل الملف: { title, number, body, grade, narrator, book, chapter }
const ALL_HADITHS_RAW: Hadith[] = [];

if (rawHadiths && Array.isArray(rawHadiths)) {
  rawHadiths.forEach((item: any, index: number) => {
    // تحديد اسم الكتاب بناءً على العنوان
    let collection = '';
    if (item.title?.includes('البخاري')) collection = 'صحيح البخاري';
    else if (item.title?.includes('مسلم')) collection = 'صحيح مسلم';
    else if (item.title?.includes('ترمذي')) collection = 'جامع الترمذي';
    else if (item.title?.includes('أبي داود')) collection = 'سنن أبي داود';
    else if (item.title?.includes('نسائي')) collection = 'سنن النسائي';
    else if (item.title?.includes('ابن ماجه')) collection = 'سنن ابن ماجه';
    else collection = item.book || item.title || 'أحاديث متنوعة';

    ALL_HADITHS_RAW.push({
      id: index + 1,
      collection: collection,
      book: item.book || item.title || '',
      chapter: item.chapter || '',
      hadithNumber: item.number || item.hadithNumber || index + 1,
      narrator: item.narrator || '',
      text: item.body || item.text || '',
      grade: item.grade || 'صحيح'
    });
  });
}

// دوال جلب البيانات لكل كتاب
const getHadithsByCollection = (collectionName: string): Hadith[] => {
  return ALL_HADITHS_RAW.filter(h => h.collection === collectionName);
};

export const getBukhariHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('صحيح البخاري');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getBukhariCount = (): number => getHadithsByCollection('صحيح البخاري').length;

export const getMuslimHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('صحيح مسلم');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getMuslimCount = (): number => getHadithsByCollection('صحيح مسلم').length;

export const getTirmidhiHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('جامع الترمذي');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getTirmidhiCount = (): number => getHadithsByCollection('جامع الترمذي').length;

export const getAbuDawudHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('سنن أبي داود');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getAbuDawudCount = (): number => getHadithsByCollection('سنن أبي داود').length;

export const getNasaiHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('سنن النسائي');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getNasaiCount = (): number => getHadithsByCollection('سنن النسائي').length;

export const getIbnMajahHadiths = (page: number = 1, limit: number = 20): Hadith[] => {
  const all = getHadithsByCollection('سنن ابن ماجه');
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
};
export const getIbnMajahCount = (): number => getHadithsByCollection('سنن ابن ماجه').length;

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

// طباعة للتأكد في console
console.log('📚 تم تحميل الأحاديث:');
console.log(`   - صحيح البخاري: ${getBukhariCount()} حديث`);
console.log(`   - صحيح مسلم: ${getMuslimCount()} حديث`);
console.log(`   - جامع الترمذي: ${getTirmidhiCount()} حديث`);
console.log(`   - سنن أبي داود: ${getAbuDawudCount()} حديث`);
console.log(`   - سنن النسائي: ${getNasaiCount()} حديث`);
console.log(`   - سنن ابن ماجه: ${getIbnMajahCount()} حديث`);
console.log(`   📊 المجموع الكلي: ${ALL_HADITHS_RAW.length} حديث`);
