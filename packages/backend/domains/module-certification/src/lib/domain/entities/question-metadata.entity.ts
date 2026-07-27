import { Entity } from '@spark-nest-ed/shared-libs';

export class QuestionMetadataEntity extends Entity<string> {
  private constructor(
    id: string,
    private questionId: string,
    private explanation: string | null,
    private points: number,
    private estimatedTime: string | null,
    private shuffleOptions: boolean,
    private referenceType: string | null,
    private passageSource: string | null,
    private highlight: string | null,
    private cognitiveLevel: string | null,
    private tags: string[],
    private skills: string[],
    private qualityScore: number | null,
    private qualityRating: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    questionId: string;
    explanation?: string | null;
    points?: number;
    estimatedTime?: string | null;
    shuffleOptions?: boolean;
    referenceType?: string | null;
    passageSource?: string | null;
    highlight?: string | null;
    cognitiveLevel?: string | null;
    tags?: string[];
    skills?: string[];
    qualityScore?: number | null;
    qualityRating?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): QuestionMetadataEntity {
    const now = new Date();
    return new QuestionMetadataEntity(
      params.id,
      params.questionId,
      params.explanation ?? null,
      params.points ?? 1,
      params.estimatedTime ?? null,
      params.shuffleOptions ?? false,
      params.referenceType ?? null,
      params.passageSource ?? null,
      params.highlight ?? null,
      params.cognitiveLevel ?? null,
      params.tags ?? [],
      params.skills ?? [],
      params.qualityScore ?? null,
      params.qualityRating ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  static fromPersistence(data: {
    id: string;
    questionId: string;
    explanation: string | null;
    points: number;
    estimatedTime: string | null;
    shuffleOptions: boolean;
    referenceType: string | null;
    passageSource: string | null;
    highlight: string | null;
    cognitiveLevel: string | null;
    tags: string[];
    skills: string[];
    qualityScore: number | null;
    qualityRating: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): QuestionMetadataEntity {
    return new QuestionMetadataEntity(
      data.id,
      data.questionId,
      data.explanation,
      data.points,
      data.estimatedTime,
      data.shuffleOptions,
      data.referenceType,
      data.passageSource,
      data.highlight,
      data.cognitiveLevel,
      data.tags,
      data.skills,
      data.qualityScore,
      data.qualityRating,
      data.createdAt,
      data.updatedAt
    );
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getExplanation(): string | null {
    return this.explanation;
  }

  getPoints(): number {
    return this.points;
  }

  getEstimatedTime(): string | null {
    return this.estimatedTime;
  }

  getShuffleOptions(): boolean {
    return this.shuffleOptions;
  }

  getReferenceType(): string | null {
    return this.referenceType;
  }

  getPassageSource(): string | null {
    return this.passageSource;
  }

  getHighlight(): string | null {
    return this.highlight;
  }

  getCognitiveLevel(): string | null {
    return this.cognitiveLevel;
  }

  getTags(): string[] {
    return [...this.tags];
  }

  getSkills(): string[] {
    return [...this.skills];
  }

  getQualityScore(): number | null {
    return this.qualityScore;
  }

  getQualityRating(): string | null {
    return this.qualityRating;
  }

  update(params: {
    explanation?: string | null;
    points?: number;
    estimatedTime?: string | null;
    shuffleOptions?: boolean;
    referenceType?: string | null;
    passageSource?: string | null;
    highlight?: string | null;
    cognitiveLevel?: string | null;
    tags?: string[];
    skills?: string[];
    qualityScore?: number | null;
    qualityRating?: string | null;
  }): void {
    if (params.explanation !== undefined) this.explanation = params.explanation;
    if (params.points !== undefined) this.points = params.points;
    if (params.estimatedTime !== undefined) this.estimatedTime = params.estimatedTime;
    if (params.shuffleOptions !== undefined) this.shuffleOptions = params.shuffleOptions;
    if (params.referenceType !== undefined) this.referenceType = params.referenceType;
    if (params.passageSource !== undefined) this.passageSource = params.passageSource;
    if (params.highlight !== undefined) this.highlight = params.highlight;
    if (params.cognitiveLevel !== undefined) this.cognitiveLevel = params.cognitiveLevel;
    if (params.tags !== undefined) this.tags = params.tags;
    if (params.skills !== undefined) this.skills = params.skills;
    if (params.qualityScore !== undefined) this.qualityScore = params.qualityScore;
    if (params.qualityRating !== undefined) this.qualityRating = params.qualityRating;
    this.markAsUpdated();
  }

  calculateQualityScore(): { score: number; rating: string; checks: string[] } {
    let score = 0;
    const checks: string[] = [];

    // Clear question text (content exists and > 10 chars)
    if (this.explanation && this.explanation.length > 10) {
      score += 25;
      checks.push('Clear question text');
    }

    // Has explanation
    if (this.explanation && this.explanation.length > 0) {
      score += 25;
      checks.push('Has explanation');
    }

    // Has tags
    if (this.tags.length > 0) {
      score += 15;
      checks.push('Has tags');
    }

    // Has skills
    if (this.skills.length > 0) {
      score += 15;
      checks.push('Has skills defined');
    }

    // Appropriate difficulty
    if (this.cognitiveLevel) {
      score += 10;
      checks.push('Appropriate difficulty');
    }

    // Has reference
    if (this.referenceType) {
      score += 10;
      checks.push('Has reference material');
    }

    let rating = 'Needs Improvement';
    if (score >= 80) rating = 'Excellent';
    else if (score >= 60) rating = 'Good';
    else if (score >= 40) rating = 'Fair';

    this.qualityScore = score;
    this.qualityRating = rating;

    return { score, rating, checks };
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      questionId: this.questionId,
      explanation: this.explanation,
      points: this.points,
      estimatedTime: this.estimatedTime,
      shuffleOptions: this.shuffleOptions,
      referenceType: this.referenceType,
      passageSource: this.passageSource,
      highlight: this.highlight,
      cognitiveLevel: this.cognitiveLevel,
      tags: this.tags,
      skills: this.skills,
      qualityScore: this.qualityScore,
      qualityRating: this.qualityRating,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
