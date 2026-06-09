import { CefrLevelVO } from '../value-objects/cefr-level.vo';
import { LessonStatusVO } from '../value-objects/lesson-status.vo';
import { v4 as uuidv4 } from 'uuid';

export interface GrammarLessonProps {
  id?: string;
  title: string;
  vietnameseTitle?: string | null;
  level: CefrLevelVO;
  status: LessonStatusVO;
  tags?: string[];
  outline?: any[];
  blocks?: any[];
  icon?: string;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GrammarLessonEntity {
  public readonly id: string;
  public title: string;
  public vietnameseTitle: string | null;
  public level: CefrLevelVO;
  public status: LessonStatusVO;
  public tags: string[];
  public outline: any[];
  public blocks: any[];
  public icon: string;
  public deleted: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: GrammarLessonProps) {
    this.id = props.id || uuidv4();
    this.title = props.title;
    this.vietnameseTitle = props.vietnameseTitle || null;
    this.level = props.level;
    this.status = props.status;
    this.tags = props.tags || [];
    this.outline = props.outline || [];
    this.blocks = props.blocks || [];
    this.icon = props.icon || '📖';
    this.deleted = props.deleted || false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // --- BUSINESS LOGIC CORE ---

  public publish(): void {
    if (this.blocks.length === 0) {
      throw new Error('Cannot publish lesson without content blocks');
    }
    this.status = new LessonStatusVO('PUBLISHED');
    this.touchUpdate();
  }

  public archive(): void {
    this.status = new LessonStatusVO('ARCHIVED');
    this.touchUpdate();
  }

  public canUserAccess(userLevel: CefrLevelVO): boolean {
    return userLevel.isHigherOrEqual(this.level);
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}