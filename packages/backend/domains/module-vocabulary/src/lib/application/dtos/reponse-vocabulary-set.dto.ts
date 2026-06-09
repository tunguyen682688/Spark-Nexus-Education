import { DifficultyLevel } from '../../domain/value-objects/difficulty.vo';
import { Language } from '../../domain/value-objects/language.vo';
import { SetType } from '../../domain/value-objects/set-type.vo';
import {
  ImportStatus,
  ImportProgress,
} from '../../domain/entities/vocabulary-set.entity';

/**
 * Response DTO for VocabularySet
 * Represents the data structure returned to clients after creating/fetching a vocabulary set
 */
export class VocabularySetResponseDto {
  id!: string;
  title!: string;
  description!: string | null;
  language!: Language;
  type!: SetType;
  difficulty!: DifficultyLevel | null;
  isPublic!: boolean;
  isActive!: boolean;
  tags!: string[];
  coverImage!: string | null;
  userId!: string;
  entryCount!: number;
  favoriteCount!: number;
  studyCount!: number;
  importStatus!: ImportStatus;
  importProgress!: ImportProgress | null;
  createdAt!: Date;
  updatedAt!: Date;
  // Creator profile info (optional). Prefer backend to populate with real profile when available.
  creator?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
}

/**
 * Legacy interface - deprecated, use VocabularySetResponseDto class instead
 * @deprecated
 */
export interface ResponseVocabularySetDto {
  id: string;
  title: string;
  description?: string;
  language: Language;
  type: SetType;
  difficulty?: DifficultyLevel;
  tags: string[];
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
