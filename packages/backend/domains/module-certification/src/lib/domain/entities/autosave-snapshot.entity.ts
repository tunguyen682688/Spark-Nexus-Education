import { Entity } from '@spark-nest-ed/shared-libs';

export class AutosaveSnapshotEntity extends Entity<string> {
  private constructor(
    id: string,
    private sessionId: string,
    private snapshotData: unknown,
    private savedAt: Date,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    sessionId: string;
    snapshotData: unknown;
    savedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): AutosaveSnapshotEntity {
    const now = new Date();
    return new AutosaveSnapshotEntity(
      params.id,
      params.sessionId,
      params.snapshotData,
      params.savedAt ?? now,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSnapshotData(): unknown {
    return this.snapshotData;
  }

  getSavedAt(): Date {
    return this.savedAt;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      sessionId: this.sessionId,
      snapshotData: this.snapshotData,
      savedAt: this.savedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
