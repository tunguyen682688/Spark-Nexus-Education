// ─── Question Type Configuration per Certification ────────────────────────────────
// Maps certification types to their specific question formats and UI requirements

import type { QuestionTypeCategory, QuestionTypeConfig, CertificationQuestionConfig } from '../types/question-type-config.types';
import { TOEIC_QUESTION_TYPES, IELTS_QUESTION_TYPES, CAMBRIDGE_QUESTION_TYPES, VSTEP_QUESTION_TYPES, TOEFL_QUESTION_TYPES, SAT_QUESTION_TYPES } from './question-type-config-data.constants';

export type { QuestionTypeCategory, QuestionTypeConfig, CertificationQuestionConfig } from '../types/question-type-config.types';
export { CATEGORY_LABELS } from './question-type-config-data.constants';

export const CERTIFICATION_QUESTION_CONFIGS: Record<string, CertificationQuestionConfig> = {
  TOEIC: {
    certificationType: 'TOEIC',
    questionTypes: TOEIC_QUESTION_TYPES,
    defaultQuestionType: 'single_choice',
  },
  IELTS: {
    certificationType: 'IELTS',
    questionTypes: IELTS_QUESTION_TYPES,
    defaultQuestionType: 'multiple_choice_ielts',
  },
  CAMBRIDGE: {
    certificationType: 'CAMBRIDGE',
    questionTypes: CAMBRIDGE_QUESTION_TYPES,
    defaultQuestionType: 'multiple_choice_cloze',
  },
  VSTEP: {
    certificationType: 'VSTEP',
    questionTypes: VSTEP_QUESTION_TYPES,
    defaultQuestionType: 'short_conv_mc',
  },
  TOEFL: {
    certificationType: 'TOEFL',
    questionTypes: TOEFL_QUESTION_TYPES,
    defaultQuestionType: 'reading_mc',
  },
  SAT: {
    certificationType: 'SAT',
    questionTypes: SAT_QUESTION_TYPES,
    defaultQuestionType: 'sat_reading_mc',
  },
};

// Helper functions
export function getQuestionTypesForCertification(certType: string): QuestionTypeConfig[] {
  return CERTIFICATION_QUESTION_CONFIGS[certType]?.questionTypes || [];
}

export function getDefaultQuestionTypeForCertification(certType: string): string {
  return CERTIFICATION_QUESTION_CONFIGS[certType]?.defaultQuestionType || 'single_choice';
}

export function getQuestionTypeConfig(certType: string, questionTypeId: string): QuestionTypeConfig | undefined {
  return CERTIFICATION_QUESTION_CONFIGS[certType]?.questionTypes.find(q => q.id === questionTypeId);
}

export function getAllQuestionTypeIds(certType: string): string[] {
  return CERTIFICATION_QUESTION_CONFIGS[certType]?.questionTypes.map(q => q.id) || [];
}

// Group question types by category for UI organization
export function getQuestionTypesByCategory(certType: string): Record<QuestionTypeCategory, QuestionTypeConfig[]> {
  const types = getQuestionTypesForCertification(certType);
  const grouped: Record<QuestionTypeCategory, QuestionTypeConfig[]> = {
    choice: [],
    input: [],
    'gap-fill': [],
    matching: [],
    writing: [],
    speaking: [],
    media: [],
  };
  types.forEach(t => {
    if (grouped[t.category]) {
      grouped[t.category].push(t);
    }
  });
  return grouped;
}
