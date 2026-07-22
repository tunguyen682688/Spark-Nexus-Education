import { Entity } from '@spark-nest-ed/shared-libs';

export class SessionViolationEntity extends Entity<string> {
  private constructor(
    id: string,
    private sessionId: string,
    private violationType: string,
    private description: string | null,
    private occurredAt: Date,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    sessionId: string;
    violationType: string;
    description?: string | null;
    occurredAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): SessionViolationEntity {
    const now = new Date();
    return new SessionViolationEntity(
      params.id,
      params.sessionId,
      params.violationType,
      params.description ?? null,
      params.occurredAt ?? now,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getViolationType(): string {
    return this.violationType;
  }

  getDescription(): string | null {
    return this.description;
  }

  getOccurredAt(): Date {
    return this.occurredAt;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      sessionId: this.sessionId,
      violationType: this.violationType,
      description: this.description,
      occurredAt: this.occurredAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
