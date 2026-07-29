import { Query } from '@nestjs/cqrs';

export interface UserDownloadDto {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string | null;
  createdAt: Date;
}

export class GetDownloadsQuery extends Query<UserDownloadDto[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
