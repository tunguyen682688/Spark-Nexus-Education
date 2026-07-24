import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificationDashboardResponseDto {
  @ApiPropertyOptional({ example: '8.0' })
  scorePrediction?: string;

  @ApiPropertyOptional({ example: 'Target: 8.5' })
  scoreRange?: string;

  @ApiPropertyOptional({ example: '88%' })
  accuracy?: string;

  @ApiPropertyOptional({ example: '12.5h' })
  timeSpent?: string;

  @ApiProperty({ example: '15' })
  completedMocks!: string;

  @ApiPropertyOptional({ example: 'IELTS' })
  targetExam?: string;

  @ApiPropertyOptional({ example: '850' })
  targetScore?: string;

  @ApiPropertyOptional({ example: 14 })
  daysRemaining?: number;

  @ApiProperty({ example: 750 })
  learningTime!: number;

  @ApiProperty({ example: 15 })
  examsCompleted!: number;

  @ApiProperty({ example: 8.0 })
  averageScore!: number;

  @ApiProperty({ example: 45 })
  globalRank!: number;

  @ApiProperty({ example: 12 })
  streakDays!: number;

  @ApiProperty({ example: 870 })
  xpEarned!: number;

  @ApiProperty({ example: 120 })
  totalExamsInSystem!: number;

  @ApiProperty({ example: 45 })
  totalCollectionsInSystem!: number;
}

export class CertificationCollectionItemDto {
  @ApiProperty({ example: 'c1-1' })
  id!: string;

  @ApiProperty({ example: 'IELTS Writing Task 2 - Mock 1' })
  title!: string;

  @ApiProperty({ example: 'Full Mock Test' })
  type!: string;

  @ApiProperty({ example: '60 mins' })
  duration!: string;

  @ApiProperty({ example: '40 Questions' })
  items!: string;
}

export class CertificationCollectionResponseDto {
  @ApiProperty({ example: 'c1' })
  id!: string;

  @ApiProperty({ example: 'IELTS Academic Writing Task 2' })
  title!: string;

  @ApiPropertyOptional({ example: 'Complete guide for Band 7.0+' })
  subtitle?: string;

  @ApiPropertyOptional({ example: 'Comprehensive essay samples and vocabulary.' })
  description?: string;

  @ApiProperty({ example: 'IELTS' })
  exam!: string;

  @ApiProperty({ example: 'Advanced' })
  level!: string;

  @ApiPropertyOptional({ example: 'bg-emerald-50 text-emerald-700' })
  levelColor?: string;

  @ApiPropertyOptional({ example: '4.9' })
  rating?: string;

  @ApiPropertyOptional({ example: '2.4K' })
  reviews?: string;

  @ApiPropertyOptional({ example: '58.3K' })
  learners?: string;

  @ApiPropertyOptional({ example: '58.3K' })
  downloads?: string;

  @ApiPropertyOptional({ example: '12.7K' })
  followers?: string;

  @ApiPropertyOptional({ example: '8.6K' })
  clones?: string;

  @ApiProperty({ example: 12 })
  examCount!: number;

  @ApiProperty({ example: 143 })
  itemsCount!: number;

  @ApiPropertyOptional({ example: 'StudyWithLisa' })
  author?: string;

  @ApiPropertyOptional({ example: 'IELTS Expert' })
  authorRole?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'May 20, 2025' })
  updated?: string;

  @ApiPropertyOptional({ example: '45.2 MB' })
  totalSize?: string;

  @ApiProperty({ example: ['IELTS', 'Writing'] })
  tags!: string[];

  @ApiProperty({ type: [CertificationCollectionItemDto] })
  itemsList!: CertificationCollectionItemDto[];
}

export class CertificationStudyPlanTaskDto {
  @ApiProperty({ example: 'Mon' })
  day!: string;

  @ApiProperty({ example: 'IELTS Listening Practice' })
  title!: string;

  @ApiProperty({ example: 'Part 3 Multiple Choice' })
  topic!: string;

  @ApiProperty({ example: '45m' })
  duration!: string;

  @ApiProperty({ example: true })
  completed!: boolean;
}

export class CertificationContributorDto {
  @ApiProperty({ example: 'creator-1' })
  id!: string;

  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiProperty({ example: 'Lisa Nguyen' })
  name!: string;

  @ApiProperty({ example: 'IELTS Specialist' })
  details!: string;

  @ApiProperty({ example: '1,250 pts' })
  points!: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' })
  avatar!: string;

  @ApiPropertyOptional({ example: 'Senior IELTS teacher with 8 years experience' })
  bio?: string;
}

export class CertificationReviewDto {
  @ApiProperty({ example: 'rev-1' })
  id!: string;

  @ApiProperty({ example: 'Minh Anh' })
  author!: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' })
  avatar?: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiProperty({ example: '2 days ago' })
  date!: string;

  @ApiProperty({ example: 'Excellent collection!' })
  text!: string;
}

export class CertificationDiscussionDto {
  @ApiProperty({ example: 'disc-1' })
  id!: string;

  @ApiProperty({ example: 'Tips for Essay #01 Environment topic?' })
  title!: string;

  @ApiProperty({ example: 'Alex Johnson' })
  author!: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' })
  avatar?: string;

  @ApiProperty({ example: '3 hours ago' })
  date!: string;

  @ApiProperty({ example: 4 })
  repliesCount!: number;

  @ApiProperty({ example: 'How do you structure body paragraphs?' })
  content!: string;
}

export class CertificationActivityDto {
  @ApiProperty({ example: 'Hoang Nam' })
  user!: string;

  @ApiProperty({ example: 'completed Mock #01 with score 7.5' })
  action!: string;

  @ApiProperty({ example: '10 mins ago' })
  time!: string;
}

export class CertificationReportDto {
  @ApiProperty({ example: 'col-1' })
  id!: string;

  @ApiProperty({ example: true })
  reported!: boolean;

  @ApiPropertyOptional({ example: 'Inappropriate content' })
  reason?: string;
}

export class CertificationSaveDto {
  @ApiProperty({ example: 'col-1' })
  id!: string;

  @ApiProperty({ example: true })
  saved!: boolean;
}

export class CertificationCloneDto {
  @ApiProperty({ example: 'new-col-uuid' })
  id!: string;

  @ApiProperty({ example: 'col-1' })
  originalCollectionId!: string;

  @ApiProperty({ example: true })
  cloned!: boolean;
}
