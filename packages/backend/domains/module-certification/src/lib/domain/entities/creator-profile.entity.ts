import { Entity } from '@spark-nest-ed/shared-libs';

export class CreatorProfileEntity extends Entity<string> {
  private constructor(
    id: string,
    private userId: string,
    private displayName: string,
    private bio: string | null,
    private status: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    userId: string;
    displayName: string;
    bio?: string | null;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): CreatorProfileEntity {
    const now = new Date();
    return new CreatorProfileEntity(
      params.id,
      params.userId,
      params.displayName,
      params.bio ?? null,
      params.status ?? 'active',
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getUserId(): string {
    return this.userId;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getBio(): string | null {
    return this.bio;
  }

  getStatus(): string {
    return this.status;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      displayName: this.displayName,
      bio: this.bio,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
