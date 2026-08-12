// ─── Exam Builder — Type Definitions ────────────────────────────────────────────
// All types used by the exam builder hook, extracted for clarity and reuse.

/** Question data in the builder UI (mapped from API ExamQuestion) */
export interface BuilderQuestion {
  id: string;
  number: number;
  title: string;
  partTag: string;
  type: 'Single Choice' | 'Multiple Choice' | 'Fill in Blank' | 'Essay';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  imageUrl?: string | null;
  status?: 'Local' | 'Linked' | 'Saving' | 'Error';
}

/** Section data in the builder UI (mapped from API ExamSection) */
export interface BuilderSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  sectionType: string;
  questionCount: number;
  durationMinutes: number;
  isBreak: boolean;
  questions: BuilderQuestion[];
}

/** Exam settings form state */
export interface ExamSettingsForm {
  title: string;
  description: string;
  level: string;
  language: string;
  passingScore: number;
  maxScore: number;
  examType: string;
  certificationType: string;
  createdDate: string;
  lastUpdatedDate: string;
}

/** Shape of the localStorage draft for exam builder persistence */
export interface ExamBuilderDraft {
  sections: BuilderSection[];
  settings: ExamSettingsForm;
}

/** Blueprint summary returned by computeBlueprint() */
export interface ExamBlueprint {
  totalQuestions: number;
  totalTimeMinutes: number;
  durationText: string;
  totalPoints: number;
  listening: { questions: number; timeMinutes: number };
  reading: { questions: number; timeMinutes: number };
  writing: { questions: number; timeMinutes: number };
  speaking: { questions: number; timeMinutes: number };
  math: { questions: number; timeMinutes: number };
}

export interface UseExamSessionContainerLogicProps {
  sessionId: string;
  onSubmitted?: (resultId: string) => void;
}
