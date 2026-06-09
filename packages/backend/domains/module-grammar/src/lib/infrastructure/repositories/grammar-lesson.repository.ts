import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { GrammarLessonEntity } from '../../domain/entities/grammar-lesson.entity';
import { IGrammarLessonRepository } from '../../domain/repositories/grammar-lesson.repository.interface';
import { CefrLevelVO, CefrLevelType } from '../../domain/value-objects/cefr-level.vo';
import { LessonStatusVO, LessonStatusType } from '../../domain/value-objects/lesson-status.vo';

@Injectable()
export class GrammarLessonRepository implements IGrammarLessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<GrammarLessonEntity | null> {
    const record = await this.prisma.grammarLesson.findFirst({
      where: { id, deleted: false },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(options?: { deleted?: boolean }): Promise<GrammarLessonEntity[]> {
    const records = await this.prisma.grammarLesson.findMany({
      where: {
        deleted: options?.deleted !== undefined ? options.deleted : false,
      },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(lesson: GrammarLessonEntity): Promise<GrammarLessonEntity> {
    const record = await this.prisma.grammarLesson.create({
      data: {
        id: lesson.id,
        title: lesson.title,
        vietnameseTitle: lesson.vietnameseTitle,
        level: lesson.level.value,
        status: lesson.status.value,
        tags: lesson.tags,
        outline: lesson.outline,
        blocks: lesson.blocks,
        icon: lesson.icon,
        deleted: lesson.deleted,
      },
    });
    return this.toDomain(record);
  }

  async update(id: string, lesson: Partial<GrammarLessonEntity> | any): Promise<GrammarLessonEntity> {
    const updateData: any = {};
    if (lesson.title !== undefined) updateData.title = lesson.title;
    if (lesson.description !== undefined) updateData.vietnameseTitle = lesson.description;
    if (lesson.vietnameseTitle !== undefined) updateData.vietnameseTitle = lesson.vietnameseTitle;
    if (lesson.level !== undefined) updateData.level = lesson.level instanceof CefrLevelVO ? lesson.level.value : lesson.level;
    if (lesson.status !== undefined) updateData.status = lesson.status instanceof LessonStatusVO ? lesson.status.value : lesson.status;
    if (lesson.tags !== undefined) updateData.tags = lesson.tags;
    if (lesson.outline !== undefined) updateData.outline = lesson.outline;
    if (lesson.blocks !== undefined) updateData.blocks = lesson.blocks;
    if (lesson.icon !== undefined) updateData.icon = lesson.icon;
    if (lesson.deleted !== undefined) updateData.deleted = lesson.deleted;

    const record = await this.prisma.grammarLesson.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(record);
  }

  async count(options?: { deleted?: boolean; status?: string }): Promise<number> {
    const where: any = {};
    if (options?.deleted !== undefined) where.deleted = options.deleted;
    if (options?.status !== undefined) where.status = options.status;

    return this.prisma.grammarLesson.count({
      where,
    });
  }

  private toDomain(record: any): GrammarLessonEntity {
    return new GrammarLessonEntity({
      id: record.id,
      title: record.title,
      vietnameseTitle: record.vietnameseTitle,
      level: new CefrLevelVO(record.level as CefrLevelType),
      status: new LessonStatusVO(record.status as LessonStatusType),
      tags: record.tags,
      outline: record.outline as any[],
      blocks: record.blocks as any[],
      icon: record.icon,
      deleted: record.deleted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
