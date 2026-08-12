import type { CollectionDetailsForm } from '../types/collection-editor.types';

export const EMPTY_DETAILS: CollectionDetailsForm = {
  title: '',
  subtitle: '',
  description: '',
  level: 'Beginner',
  tags: [],
  visibility: 'Public',
  allowDownloads: true,
  coverImage: '',
  createdDate: '',
  lastUpdatedDate: '',
};
