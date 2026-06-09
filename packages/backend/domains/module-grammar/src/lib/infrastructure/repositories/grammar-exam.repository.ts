import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarExamRepository } from '../../domain/repositories/grammar-exam.repository.interface';
import { GrammarExamSetEntity } from '../../domain/entities/grammar-exam-set.entity';
import { UserExamSetProgressEntity } from '../../domain/entities/user-exam-set-progress.entity';
import { CommunityGrammarCertificateEntity } from '../../domain/entities/community-grammar-certificate.entity';

@Injectable()
export class GrammarExamRepository implements IGrammarExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findExamSets(filters: { level?: string; examType?: string; search?: string; status?: string }): Promise<GrammarExamSetEntity[]> {
    const where: any = { deleted: false };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.level && filters.level.toUpperCase() !== 'ALL') {
      where.level = filters.level;
    }
    if (filters.examType && filters.examType.toUpperCase() !== 'ALL') {
      where.examType = filters.examType;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.grammarExamSet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toExamSetDomain(r));
  }

  async findExamSetById(id: string): Promise<GrammarExamSetEntity | null> {
    const record = await this.prisma.grammarExamSet.findFirst({
      where: { id, deleted: false },
    });
    return record ? this.toExamSetDomain(record) : null;
  }

  async createExamSet(
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
  ): Promise<GrammarExamSetEntity> {
    const r = await this.prisma.grammarExamSet.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        examType: data.examType,
        examMetadata: data.examMetadata || {},
        timeLimit: data.timeLimit || 600,
        creatorId: userId,
        creatorName: creatorName || 'Cộng tác viên',
        questions: data.questions,
        status: data.status || 'APPROVED',
      },
    });
    return this.toExamSetDomain(r);
  }

  async upvoteExamSet(id: string): Promise<GrammarExamSetEntity> {
    const r = await this.prisma.grammarExamSet.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
    return this.toExamSetDomain(r);
  }

  async findUserExamProgress(userId: string, examSetIds: string[]): Promise<UserExamSetProgressEntity[]> {
    if (examSetIds.length === 0) return [];
    const records = await this.prisma.userExamSetProgress.findMany({
      where: {
        userId,
        examSetId: { in: examSetIds },
      },
    });
    return records.map((r) => this.toProgressDomain(r));
  }

  async findUserExamProgressSingle(userId: string, examSetId: string): Promise<UserExamSetProgressEntity | null> {
    const record = await this.prisma.userExamSetProgress.findUnique({
      where: {
        idx_user_exam_set: {
          userId,
          examSetId,
        },
      },
    });
    return record ? this.toProgressDomain(record) : null;
  }

  async upsertUserExamProgress(
    userId: string,
    examSetId: string,
    data: { bestScore: number; isPassed: boolean }
  ): Promise<UserExamSetProgressEntity> {
    const record = await this.prisma.userExamSetProgress.upsert({
      where: {
        idx_user_exam_set: {
          userId,
          examSetId,
        },
      },
      update: {
        bestScore: data.bestScore,
        isPassed: data.isPassed,
      },
      create: {
        userId,
        examSetId,
        bestScore: data.bestScore,
        isPassed: data.isPassed,
      },
    });
    return this.toProgressDomain(record);
  }

  async findCertificates(userId: string): Promise<CommunityGrammarCertificateEntity[]> {
    const records = await this.prisma.communityGrammarCertificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });
    return records.map((r) => this.toCertificateDomain(r));
  }

  async findCertificateByLevelAndType(userId: string, level: string, examType: string): Promise<CommunityGrammarCertificateEntity | null> {
    const record = await this.prisma.communityGrammarCertificate.findFirst({
      where: {
        userId,
        level,
        examType,
      },
    });
    return record ? this.toCertificateDomain(record) : null;
  }

  async createCertificate(
    userId: string,
    level: string,
    examType: string,
    serialNumber: string,
    metadata: any
  ): Promise<CommunityGrammarCertificateEntity> {
    const record = await this.prisma.communityGrammarCertificate.create({
      data: {
        userId,
        level,
        examType,
        serialNumber,
        metadata: metadata || {},
      },
    });
    return this.toCertificateDomain(record);
  }

  private toExamSetDomain(r: any): GrammarExamSetEntity {
    return new GrammarExamSetEntity({
      id: r.id,
      title: r.title,
      description: r.description,
      level: r.level,
      examType: r.examType,
      examMetadata: r.examMetadata,
      creatorId: r.creatorId,
      creatorName: r.creatorName,
      questions: r.questions,
      timeLimit: r.timeLimit,
      upvotes: r.upvotes,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deleted: r.deleted,
    });
  }

  private toProgressDomain(r: any): UserExamSetProgressEntity {
    return new UserExamSetProgressEntity({
      id: r.id,
      userId: r.userId,
      examSetId: r.examSetId,
      bestScore: r.bestScore,
      isPassed: r.isPassed,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  private toCertificateDomain(r: any): CommunityGrammarCertificateEntity {
    return new CommunityGrammarCertificateEntity({
      id: r.id,
      userId: r.userId,
      level: r.level,
      examType: r.examType,
      serialNumber: r.serialNumber,
      issuedAt: r.issuedAt,
      metadata: r.metadata,
    });
  }
}
