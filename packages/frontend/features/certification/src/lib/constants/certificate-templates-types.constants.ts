export interface CertificateSectionTemplate {
  title: string;
  sectionType: string;
  instruction: string;
  durationMinutes: number;
  questionCount: number;
  partNumber?: number;
  questionType?: string;
}

export interface CertificateTypeTemplate {
  id: string;
  label: string;
  labelVi: string;
  description: string;
  defaultDuration: number;
  defaultTotalQuestions: number;
  defaultMaxScore: number;
  defaultPassScore: number;
  passScoreLabel: string;
  sections: CertificateSectionTemplate[];
}
