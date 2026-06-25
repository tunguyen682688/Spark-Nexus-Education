import { IsString, IsOptional, IsArray, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityPostDto {
  @ApiProperty({
    description: 'The title of the community post',
    example: 'Common mistakes when using the Present Perfect tense',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiProperty({
    description: 'The body content of the community post',
    example: 'Many students confuse Present Perfect with Past Simple. Here are the key differences...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content!: string;

  @ApiProperty({
    description: 'Tags for categorizing the post',
    type: [String],
    example: ['grammar', 'tenses', 'present-perfect'],
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiPropertyOptional({
    description: 'Whether the post includes an interactive quiz',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  hasQuiz?: boolean;

  @ApiPropertyOptional({
    description: 'Type of the interactive quiz',
    example: 'multiple-choice',
  })
  @IsString()
  @IsOptional()
  quizType?: string;

  @ApiPropertyOptional({
    description: 'JSON object containing quiz data (questions, options, correct answer, etc.)',
    example: {
      question: 'Which sentence is correct?',
      options: ['I have gone to Paris last year.', 'I went to Paris last year.'],
      answer: 'I went to Paris last year.',
    },
  })
  @IsObject()
  @IsOptional()
  quizData?: unknown;
}

export class AddCommunityCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This explanation is very helpful, thank you!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  content!: string;
}

export class SubmitCrowdsourcedQuizDto {
  @ApiProperty({
    description: 'The type of the crowdsourced quiz question',
    example: 'MULTIPLE_CHOICE',
    enum: ['MULTIPLE_CHOICE', 'SENTENCE_BUILDER', 'ERROR_SPOTLIGHT'],
  })
  @IsString()
  @IsNotEmpty()
  questionType!: string;

  @ApiProperty({
    description: 'JSON object containing question details like choices, correct option, etc.',
    example: {
      question: 'She _____ to the cinema yesterday.',
      options: ['go', 'went', 'has gone', 'goes'],
      answer: 'went',
    },
  })
  @IsObject()
  @IsNotEmpty()
  questionData!: unknown;

  @ApiProperty({
    description: 'Detailed explanation for why the answer is correct',
    example: "We use 'yesterday' to talk about a completed action in the past, so Past Simple ('went') is required.",
  })
  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

