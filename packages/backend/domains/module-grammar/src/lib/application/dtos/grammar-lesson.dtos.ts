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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'The primary title of the grammar lesson in English',
    example: 'Present Perfect Tense',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'The translated Vietnamese title of the lesson',
    example: 'Thì hiện tại hoàn thành',
  })
  @IsString()
  @IsOptional()
  vietnameseTitle?: string;

  @ApiPropertyOptional({
    description: 'Target CEFR language level',
    enum: CefrLevel,
    example: CefrLevel.B1,
  })
  @IsEnum(CefrLevel)
  @IsOptional()
  level?: CefrLevel;

  @ApiPropertyOptional({
    description: 'Status of the lesson (draft, published, etc.)',
    enum: LessonStatus,
    example: LessonStatus.PUBLISHED,
  })
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @ApiPropertyOptional({
    description: 'Metadata tags for categorizing the grammar concept',
    type: [String],
    example: ['tenses', 'perfect-aspect', 'b1-grammar'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Detailed curriculum outline sections',
    type: [Object],
    example: [
      { section: '1. Usage', items: ['Unspecified time', 'Life experience'] },
      { section: '2. Structure', items: ['Have/Has + V3'] },
    ],
  })
  @IsArray()
  @IsOptional()
  outline?: any[];

  @ApiPropertyOptional({
    description: 'Interactive educational content blocks (theory, tables, etc.)',
    type: [Object],
    example: [
      { type: 'text', content: 'Use present perfect to relate the past to the present.' },
      { type: 'example', content: 'I have traveled to Tokyo.' },
    ],
  })
  @IsArray()
  @IsOptional()
  blocks?: any[];
}

/** DTO cho việc cập nhật bài học */
export class UpdateLessonDto {
  @ApiPropertyOptional({
    description: 'The primary title of the grammar lesson in English',
    example: 'Present Perfect Tense (Revised)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'The translated Vietnamese title of the lesson',
    example: 'Thì hiện tại hoàn thành (Đã cập nhật)',
  })
  @IsString()
  @IsOptional()
  vietnameseTitle?: string;

  @ApiPropertyOptional({
    description: 'Target CEFR language level',
    enum: CefrLevel,
    example: CefrLevel.B1,
  })
  @IsEnum(CefrLevel)
  @IsOptional()
  level?: CefrLevel;

  @ApiPropertyOptional({
    description: 'Status of the lesson (draft, published, etc.)',
    enum: LessonStatus,
    example: LessonStatus.PUBLISHED,
  })
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @ApiPropertyOptional({
    description: 'Metadata tags for categorizing the grammar concept',
    type: [String],
    example: ['tenses', 'perfect-aspect'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Detailed curriculum outline sections',
    type: [Object],
  })
  @IsArray()
  @IsOptional()
  outline?: any[];

  @ApiPropertyOptional({
    description: 'Interactive educational content blocks (theory, tables, etc.)',
    type: [Object],
  })
  @IsArray()
  @IsOptional()
  blocks?: any[];
}

/** DTO cho việc cập nhật tiến độ học */
export class UpdateProgressDto {
  @ApiPropertyOptional({
    description: 'Student learning status for the grammar lesson',
    enum: ['LOCKED', 'IN_PROGRESS', 'MASTERED'],
    example: 'IN_PROGRESS',
  })
  @IsEnum(['LOCKED', 'IN_PROGRESS', 'MASTERED'])
  @IsOptional()
  status?: 'LOCKED' | 'IN_PROGRESS' | 'MASTERED';

  @ApiPropertyOptional({
    description: 'Proficiency scale/score (0 to 100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  proficiency?: number;

  @ApiPropertyOptional({
    description: 'Student-authored quick study notes for this lesson',
    example: 'Remember to use "has" for singular third person!',
  })
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


