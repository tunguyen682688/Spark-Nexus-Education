import { Logger } from '@nestjs/common';
import type { ExamStrategy, ExamStructureDef } from './exam-strategy.interface';

export class ExamStrategyRegistry {
  private readonly logger = new Logger(ExamStrategyRegistry.name);
  private readonly strategies = new Map<string, ExamStrategy>();

  register(strategy: ExamStrategy): void {
    const key = strategy.certificationType.toUpperCase();
    this.strategies.set(key, strategy);
    this.logger.log(`Registered exam strategy: ${key}`);
  }

  get(type: string): ExamStrategy | undefined {
    return this.strategies.get(type.toUpperCase());
  }

  getStructure(type: string): ExamStructureDef | undefined {
    return this.get(type)?.getStructure();
  }

  getAllTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  has(type: string): boolean {
    return this.strategies.has(type.toUpperCase());
  }
}
