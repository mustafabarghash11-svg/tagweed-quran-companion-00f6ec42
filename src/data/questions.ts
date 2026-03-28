export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number; // index of correct answer (0-3)
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// هنا راح نضيف الأسئلة اللي راح ترسلها لي
export const QUESTIONS: Question[] = [
  // مثال:
  // {
  //   id: 1,
  //   question: "ما هي أول سورة نزلت في القرآن الكريم؟",
  //   options: ["الفاتحة", "العلق", "المدثر", "الضحى"],
  //   correct: 1,
  //   explanation: "سورة العلق هي أول ما نزل من القرآن في غار حراء.",
  //   category: "القرآن الكريم",
  //   difficulty: "easy"
  // },
];

// دوال للبحث
export const getQuestionsByCategory = (category: string) => {
  return QUESTIONS.filter(q => q.category === category);
};

export const getQuestionsByDifficulty = (difficulty: string) => {
  return QUESTIONS.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestions = (count: number = 10) => {
  const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
