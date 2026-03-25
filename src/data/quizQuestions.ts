export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// القرآن الكريم - سهل (500 سؤال)
const quranEasy: QuizQuestion[] = [
  {
    id: 'quran-easy-001',
    question: 'ما هي أول سورة نزلت في القرآن الكريم؟',
    options: ['الفاتحة', 'العلق', 'المدثر', 'الضحى'],
    correct_index: 1,
    explanation: 'سورة العلق هي أول سورة نزلت على النبي صلى الله عليه وسلم في غار حراء.',
    category: 'quran',
    difficulty: 'easy',
  },
  {
    id: 'quran-easy-002',
    question: 'كم عدد سور القرآن الكريم؟',
    options: ['110', '113', '114', '120'],
    correct_index: 2,
    explanation: 'القرآن الكريم يحتوي على 114 سورة.',
    category: 'quran',
    difficulty: 'easy',
  },
  {
    id: 'quran-easy-003',
    question: 'ما هي أطول سورة في القرآن؟',
    options: ['آل عمران', 'البقرة', 'النساء', 'المائدة'],
    correct_index: 1,
    explanation: 'سورة البقرة هي أطول سورة في القرآن الكريم.',
    category: 'quran',
    difficulty: 'easy',
  },
  // ... باقي 497 سؤال (يمكنني إكمالها تدريجياً)
];

// القرآن الكريم - متوسط (500 سؤال)
const quranMedium: QuizQuestion[] = [
  {
    id: 'quran-medium-001',
    question: 'في أي سورة وردت آية الكرسي؟',
    options: ['آل عمران', 'البقرة', 'النساء', 'المائدة'],
    correct_index: 1,
    explanation: 'آية الكرسي في سورة البقرة الآية 255.',
    category: 'quran',
    difficulty: 'medium',
  },
  // ... باقي الأسئلة
];

// القرآن الكريم - صعب (500 سؤال)
const quranHard: QuizQuestion[] = [
  {
    id: 'quran-hard-001',
    question: 'ما هي السورة التي تسمى "قلب القرآن"؟',
    options: ['الفاتحة', 'الإخلاص', 'يس', 'الرحمن'],
    correct_index: 2,
    explanation: 'سورة يس تسمى قلب القرآن لاشتمالها على مقاصد الإيمان والتوحيد.',
    category: 'quran',
    difficulty: 'hard',
  },
  // ... باقي الأسئلة
];

// الحديث النبوي - سهل
const hadithEasy: QuizQuestion[] = [
  {
    id: 'hadith-easy-001',
    question: 'من هو أول من جمع الحديث النبوي؟',
    options: ['الإمام مالك', 'الإمام البخاري', 'الإمام أحمد', 'الإمام مسلم'],
    correct_index: 0,
    explanation: 'الإمام مالك بن أنس هو أول من جمع الحديث في كتاب "الموطأ".',
    category: 'hadith',
    difficulty: 'easy',
  },
  // ... باقي الأسئلة
];

// الفقه الإسلامي - سهل
const fiqhEasy: QuizQuestion[] = [
  {
    id: 'fiqh-easy-001',
    question: 'ما هي أركان الإسلام الخمسة؟',
    options: [
      'الشهادة، الصلاة، الزكاة، الصوم، الحج',
      'الشهادة، الصلاة، الصوم، الحج، الجهاد',
      'الشهادة، الصلاة، الزكاة، الصوم، البر',
      'الشهادة، الصلاة، الزكاة، الحج، العمرة'
    ],
    correct_index: 0,
    explanation: 'أركان الإسلام خمسة: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وصوم رمضان، وحج البيت لمن استطاع إليه سبيلاً.',
    category: 'fiqh',
    difficulty: 'easy',
  },
  // ... باقي الأسئلة
];

// السيرة النبوية - سهل
const seerahEasy: QuizQuestion[] = [
  {
    id: 'seerah-easy-001',
    question: 'في أي عام ولد النبي صلى الله عليه وسلم؟',
    options: ['عام الفيل', 'عام الحزن', 'عام الهجرة', 'عام الخندق'],
    correct_index: 0,
    explanation: 'ولد النبي صلى الله عليه وسلم في عام الفيل الموافق 570 ميلادي.',
    category: 'seerah',
    difficulty: 'easy',
  },
  // ... باقي الأسئلة
];

// العقيدة والتوحيد - سهل
const aqeedahEasy: QuizQuestion[] = [
  {
    id: 'aqeedah-easy-001',
    question: 'ما معنى "لا إله إلا الله"؟',
    options: [
      'لا معبود بحق إلا الله',
      'لا خالق إلا الله',
      'لا رازق إلا الله',
      'لا مالك إلا الله'
    ],
    correct_index: 0,
    explanation: 'معنى لا إله إلا الله: لا معبود بحق إلا الله، أي نفي الإلهية عن كل ما سوى الله وإثباتها لله وحده.',
    category: 'aqeedah',
    difficulty: 'easy',
  },
  // ... باقي الأسئلة
];

// ثقافة إسلامية - سهل
const generalEasy: QuizQuestion[] = [
  {
    id: 'general-easy-001',
    question: 'ما هو أول مسجد بني في الإسلام؟',
    options: ['المسجد الحرام', 'المسجد النبوي', 'مسجد قباء', 'المسجد الأقصى'],
    correct_index: 2,
    explanation: 'مسجد قباء في المدينة المنورة هو أول مسجد بني في الإسلام.',
    category: 'general',
    difficulty: 'easy',
  },
  // ... باقي الأسئلة
];

// تجميع كل الأسئلة
export const ALL_QUESTIONS: QuizQuestion[] = [
  ...quranEasy, ...quranMedium, ...quranHard,
  ...hadithEasy, // ...hadithMedium, ...hadithHard,
  ...fiqhEasy, // ...fiqhMedium, ...fiqhHard,
  ...seerahEasy, // ...seerahMedium, ...seerahHard,
  ...aqeedahEasy, // ...aqeedahMedium, ...aqeedahHard,
  ...generalEasy, // ...generalMedium, ...generalHard,
];

// دالة لجلب أسئلة عشوائية حسب الفئة والصعوبة
export function getRandomQuestions(
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 1,
  excludeIds: string[] = []
): QuizQuestion[] {
  const filtered = ALL_QUESTIONS.filter(
    q => q.category === category && q.difficulty === difficulty && !excludeIds.includes(q.id)
  );
  
  // خلط واختيار عشوائي
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
    }
