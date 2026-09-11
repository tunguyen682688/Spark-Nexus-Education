import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { Prisma } from '@prisma/client';
import { MediaFileEntity } from '../../domain/media-file.entity';
import type { IMediaFileRepository, CreateMediaFileData } from '../../domain/media-file.repository.interface';

@Injectable()
export class MediaFileRepository implements IMediaFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaFileData): Promise<MediaFileEntity> {
    const record = await this.prisma.mediaFile.create({
      data: {
        storageKey: data.storageKey,
        bucket: data.bucket,
        provider: data.provider,
        mimeType: data.mimeType,
        size: data.size,
        originalName: data.originalName,
        width: data.width ?? null,
        height: data.height ?? null,
        visibility: data.visibility,
        status: data.status,
        checksum: data.checksum,
        ownerId: data.ownerId ?? null,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    return this.toEntity(record);
  }

  async findById(id: string): Promise<MediaFileEntity | null> {
    const record = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByStorageKey(storageKey: string): Promise<MediaFileEntity | null> {
    const record = await this.prisma.mediaFile.findUnique({ where: { storageKey } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByChecksum(checksum: string): Promise<MediaFileEntity | null> {
    const record = await this.prisma.mediaFile.findFirst({ where: { checksum, status: 'active' } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async updateStatus(id: string, status: 'active' | 'deleted' | 'processing'): Promise<void> {
    await this.prisma.mediaFile.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.mediaFile.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }

  async findExpiredSoftDeletes(olderThanDays: number): Promise<MediaFileEntity[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const records = await this.prisma.mediaFile.findMany({
      where: { status: 'deleted', deletedAt: { lt: cutoff } },
    });

    return records.map(r => this.toEntity(r));
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.mediaFile.delete({ where: { id } });
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return this.prisma.mediaFile.count({ where: { ownerId, status: 'active' } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(record: any): MediaFileEntity {
    return MediaFileEntity.fromPersistence({
      id: record.id,
      storageKey: record.storageKey,
      bucket: record.bucket,
      provider: record.provider,
      mimeType: record.mimeType,
      size: record.size,
      originalName: record.originalName,
      width: record.width,
      height: record.height,
      visibility: record.visibility,
      status: record.status,
      checksum: record.checksum,
      ownerId: record.ownerId,
      metadata: record.metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version ?? 1,
    });
  }
}
