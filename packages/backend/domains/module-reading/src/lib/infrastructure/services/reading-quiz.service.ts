import { Injectable } from '@nestjs/common';
import { IReadingQuizService, QuizQuestion } from '../../domain/services/reading-quiz.service.interface';

@Injectable()
export class ReadingQuizService implements IReadingQuizService {
  // Pre-defined quiz questions for seeded articles
  private readonly staticQuizzes: Record<string, QuizQuestion[]> = {
    'Getting Started with English Learning': [
      {
        id: 'q1',
        question: 'According to the article, why is learning English open to many opportunities?',
        options: [
          'It is only used in international travel',
          'It is one of the most widely spoken languages in the world',
          'It is the easiest language to learn',
          'It is only required for academic studies'
        ],
        answer: 'It is one of the most widely spoken languages in the world',
        explanation: 'The article states: "English is one of the most widely spoken languages in the world. Learning English opens doors to countless opportunities..."'
      },
      {
        id: 'q2',
        question: 'Which of the following is NOT explicitly mentioned as an area of opportunity opened by learning English?',
        options: [
          'Education',
          'Career',
          'Travel',
          'Cooking'
        ],
        answer: 'Cooking',
        explanation: 'The article mentions opportunities in "education, career, and travel", but does not mention cooking.'
      },
      {
        id: 'q3',
        question: 'What is the main purpose of this article?',
        options: [
          'To teach advanced English grammar rules',
          'To guide beginners starting their English learning journey',
          'To review travel destinations',
          'To describe career salaries'
        ],
        answer: 'To guide beginners starting their English learning journey',
        explanation: 'The final sentence says: "This article will guide you through the basics of starting your English learning journey."'
      }
    ],
    'Advanced Vocabulary Building Techniques': [
      {
        id: 'q1',
        question: 'What is described as crucial for mastering the English language?',
        options: [
          'Expanding your vocabulary',
          'Learning to speak with an accent',
          'Studying history lessons',
          'Memorizing long poems'
        ],
        answer: 'Expanding your vocabulary',
        explanation: 'The article opens with: "Expanding your vocabulary is crucial for mastering English."'
      },
      {
        id: 'q2',
        question: 'Which techniques does the article explore to help you remember words effectively?',
        options: [
          'Grammar translations and dictation exercises',
          'Context-based learning, mnemonics, and spaced repetition',
          'Watching movies and singing English songs',
          'Reading dictionaries cover to cover'
        ],
        answer: 'Context-based learning, mnemonics, and spaced repetition',
        explanation: 'The text states: "This article explores advanced techniques like context-based learning, mnemonics, and spaced repetition to help you remember new words effectively."'
      },
      {
        id: 'q3',
        question: 'What is the primary benefit of mnemonics as implied in the article?',
        options: [
          'It increases typing speed',
          'It helps you remember new words effectively',
          'It teaches you legal terminology',
          'It translates words to Vietnamese'
        ],
        answer: 'It helps you remember new words effectively',
        explanation: 'Mnemonics are listed as one of the advanced techniques "to help you remember new words effectively".'
      }
    ],
    'Business English Essentials': [
      {
        id: 'q1',
        question: 'What is a key requirement for professional communication according to the article?',
        options: [
          'Knowing how to write code',
          'Specific vocabulary and expressions',
          'A degree in economics',
          'Fluent pronunciation of idioms'
        ],
        answer: 'Specific vocabulary and expressions',
        explanation: 'The article says: "Professional communication requires specific vocabulary and expressions."'
      },
      {
        id: 'q2',
        question: 'Which of the following topics is covered in the Business English guide?',
        options: [
          'Negotiating travel packages',
          'Essential business English phrases, email etiquette, and presentation skills',
          'Writing short literature fiction stories',
          'Preparing for university entrance exams'
        ],
        answer: 'Essential business English phrases, email etiquette, and presentation skills',
        explanation: 'The text states: "This guide covers essential business English phrases, email etiquette, and presentation skills..."'
      },
      {
        id: 'q3',
        question: 'What is the ultimate goal of learning these business English essentials?',
        options: [
          'To pass a grammar certification exam',
          'To succeed in international business',
          'To write academic papers',
          'To teach English in public schools'
        ],
        answer: 'To succeed in international business',
        explanation: 'The final phrase states these skills "...will help you succeed in international business."'
      }
    ]
  };

  /**
   * Returns quiz questions for a given article title.
   * If not static, generates template questions based on the article category and difficulty.
   */
  getQuizForArticle(title: string, category: string, difficulty: string): QuizQuestion[] {
    const staticQuiz = this.staticQuizzes[title];
    if (staticQuiz) {
      return staticQuiz;
    }

    // Dynamic fallback questions based on metadata
    return [
      {
        id: 'dq1',
        question: `Based on the article "${title}", what is the primary focus of this ${category} topic?`,
        options: [
          'To explain theoretical scientific terms',
          'To introduce core concepts and build practical skills',
          'To critique historical events',
          'To review contemporary pop culture'
        ],
        answer: 'To introduce core concepts and build practical skills',
        explanation: `As a ${difficulty} level article in the ${category} category, the content focuses on establishing fundamental ideas and practical vocabulary.`
      },
      {
        id: 'dq2',
        question: `Why is understanding the context of "${title}" important for language learners?`,
        options: [
          'It is needed for passing vocabulary exams only',
          'It helps grasp correct syntax and register in professional settings',
          'It is the only way to read news articles',
          'It does not affect learning outcomes'
        ],
        answer: 'It helps grasp correct syntax and register in professional settings',
        explanation: 'Context-based reading reinforces vocabulary acquisition by presenting word forms in natural sentences.'
      },
      {
        id: 'dq3',
        question: `Which difficulty target does this article mainly serve?`,
        options: [
          'Beginner level (A1-A2)',
          'Intermediate level (B1-B2)',
          'Advanced level (C1-C2)',
          `The target CEFR level of the article: ${difficulty}`
        ],
        answer: `The target CEFR level of the article: ${difficulty}`,
        explanation: `This article is structured and calibrated for the ${difficulty} target level to match readers' capabilities.`
      }
    ];
  }
}
