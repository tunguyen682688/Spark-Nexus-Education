export * from './lib/certification.module';

// ===== DOMAIN REPOSITORIES & ENTITIES =====
export * from './lib/domain/repositories/certification.repository.interface';

export * from './lib/domain/entities/collection.entity';
export * from './lib/domain/entities/exam.entity';
export * from './lib/domain/entities/exam-section.entity';
export * from './lib/domain/entities/exam-question.entity';
export * from './lib/domain/entities/question.entity';
export * from './lib/domain/entities/question-choice.entity';
export * from './lib/domain/entities/question-metadata.entity';
export * from './lib/domain/entities/exam-session.entity';
export * from './lib/domain/entities/session-answer.entity';
export * from './lib/domain/entities/session-violation.entity';
export * from './lib/domain/entities/exam-result.entity';
export * from './lib/domain/entities/skill-result.entity';
export * from './lib/domain/entities/question-result.entity';
export * from './lib/domain/entities/ai-evaluation.entity';
export * from './lib/domain/entities/creator-profile.entity';

// ===== DOMAIN SERVICES =====
export * from './lib/domain/services/exam-session-domain.service';

// ===== INFRASTRUCTURE CACHE =====
export * from './lib/infrastructure/cache/certification-cache.service';

// ===== APPLICATION DTOS, QUERIES & COMMANDS =====
export * from './lib/application/dtos/start-exam-session.dto';
export * from './lib/application/dtos/save-session-answer.dto';
export * from './lib/application/dtos/record-session-violation.dto';

export * from './lib/application/queries';

export * from './lib/application/commands';
