import { CollectionEntity } from '../../domain/entities/collection.entity';

export interface PaginatedCollectionsResult {
  items: CollectionEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
