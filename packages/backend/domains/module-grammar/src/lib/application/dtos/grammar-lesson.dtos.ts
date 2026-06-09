/**
 * DTOs cho module Grammar Lesson.
 * Sử dụng class-validator để validate dữ liệu đầu vào.
 */
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

/** Trạng thái bài học */
export enum LessonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/** Level CEFR */
export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

/** DTO cho việc tạo bài học mới */
export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  vietnameseTitle?: string;

  @IsEnum(CefrLevel)
  @IsOptional()
  level?: CefrLevel;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  outline?: any[];

  @IsArray()
  @IsOptional()
  blocks?: any[];
}

/** DTO cho việc cập nhật bài học */
export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  vietnameseTitle?: string;

  @IsEnum(CefrLevel)
  @IsOptional()
  level?: CefrLevel;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  outline?: any[];

  @IsArray()
  @IsOptional()
  blocks?: any[];
}

/** DTO cho việc cập nhật tiến độ học */
export class UpdateProgressDto {
  @IsEnum(['LOCKED', 'IN_PROGRESS', 'MASTERED'])
  @IsOptional()
  status?: 'LOCKED' | 'IN_PROGRESS' | 'MASTERED';

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  proficiency?: number;

  @IsString()
  @IsOptional()
  quickNotes?: string;
}

/** Lớp alias để tương thích với client (SaveGrammarLessonDto) */
export class SaveGrammarLessonDto extends CreateLessonDto {}

/** Kiểu phản hồi chi tiết bài học trả về cho client */
export interface LessonDetailResponseDto {
  id: string;
  title: string;
  vietnameseTitle?: string | null;
  status: string;
  level: string;
  tags: string[];
  outline: any;
  blocks: any;
  quickNotes?: string | null;
  nextLesson?: { id: string; title: string; level: string; icon?: string } | null;
  proficiency: number;
}

/** Kiểu phản hồi lộ trình học trả về cho client */
export interface RoadmapResponseDto {
  percentComplete: number;
  completedLessons: number;
  totalLessons: number;
  streakDays: number;
  currentXP: number;
  levels: Array<{ level: string; name: string; subName: string; lessons: any[] }>;
  skills: Array<{ name: string; value: number }>;
}

