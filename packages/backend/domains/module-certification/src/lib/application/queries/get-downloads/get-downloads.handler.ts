import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetDownloadsQuery, UserDownloadDto } from './get-downloads.query';

@QueryHandler(GetDownloadsQuery)
export class GetDownloadsQueryHandler implements IQueryHandler<GetDownloadsQuery, UserDownloadDto[]> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetDownloadsQuery): Promise<UserDownloadDto[]> {
    const downloads = await this.repository.findDownloadsByUserId(query.userId);
    return downloads.map((d) => ({
      id: d.id,
      userId: d.userId,
      itemType: d.itemType,
      itemId: d.itemId,
      fileName: d.fileName,
      fileSize: d.fileSize,
      downloadUrl: d.downloadUrl,
      createdAt: d.createdAt,
    }));
  }
}
