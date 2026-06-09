import { GrammarExamSetEntity } from '../entities/grammar-exam-set.entity';
import { UserExamSetProgressEntity } from '../entities/user-exam-set-progress.entity';
import { CommunityGrammarCertificateEntity } from '../entities/community-grammar-certificate.entity';

export interface IGrammarExamRepository {
  findExamSets(filters: { level?: string; examType?: string; search?: string; status?: string }): Promise<GrammarExamSetEntity[]>;
  findExamSetById(id: string): Promise<GrammarExamSetEntity | null>;
  createExamSet(
    userId: string,
    creatorName: string,
    data: {
      title: string;
      description: string;
      level: string;
      examType: string;
      examMetadata?: any;
      timeLimit: number;
      questions: any;
      status?: string;
    }
  ): Promise<GrammarExamSetEntity>;
  upvoteExamSet(id: string): Promise<GrammarExamSetEntity>;
  findUserExamProgress(userId: string, examSetIds: string[]): Promise<UserExamSetProgressEntity[]>;
  findUserExamProgressSingle(userId: string, examSetId: string): Promise<UserExamSetProgressEntity | null>;
  upsertUserExamProgress(
    userId: string,
    examSetId: string,
    data: { bestScore: number; isPassed: boolean }
  ): Promise<UserExamSetProgressEntity>;
  findCertificates(userId: string): Promise<CommunityGrammarCertificateEntity[]>;
  findCertificateByLevelAndType(userId: string, level: string, examType: string): Promise<CommunityGrammarCertificateEntity | null>;
  createCertificate(
    userId: string,
    level: string,
    examType: string,
    serialNumber: string,
    metadata: any
  ): Promise<CommunityGrammarCertificateEntity>;
}

export const GRAMMAR_EXAM_REPOSITORY = 'IGrammarExamRepository';
