/* eslint-disable */
import { v4 as uuidv4 } from 'uuid';

// =============================================
// DOMAIN BASE CLASSES
// =============================================

export abstract class Entity<TId = string> {
  protected readonly _id: TId;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _deleted: boolean;
  protected _version: bigint;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date, version?: bigint) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._deleted = false;
    this._version = version || BigInt(1);
  }

  get id(): TId { return this._id; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get deleted(): boolean { return this._deleted; }
  get version(): bigint { return this._version; }

  protected markAsUpdated(): void { this._updatedAt = new Date(); }
  protected markAsDeleted(): void { this._deleted = true; this.markAsUpdated(); }
  protected incrementVersion(): void { this._version = this._version + BigInt(1); }

  public equals(other?: Entity<TId>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this._id === other._id;
  }

  public abstract toPlainObject(): unknown;
}

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = new Date();
  }

  protected generateEventId(): string { return uuidv4(); }
  abstract getEventName(): string;
}

export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  public getDomainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._domainEvents]);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  protected override markAsUpdated(): void {
    super.markAsUpdated();
    this.incrementVersion();
  }
}

// =============================================
// QUERY TYPES
// =============================================

export enum FilterOperator {
  EQ = 'eq', NE = 'ne', GT = 'gt', GTE = 'gte', LT = 'lt', LTE = 'lte',
  CONTAINS = 'contains', STARTS_WITH = 'startsWith', ENDS_WITH = 'endsWith',
  REGEX = 'regex', IN = 'in', NOT_IN = 'notIn', CONTAINS_ALL = 'containsAll',
  CONTAINS_ANY = 'containsAny', IS_EMPTY = 'isEmpty', IS_NOT_EMPTY = 'isNotEmpty',
  IS_NULL = 'isNull', IS_NOT_NULL = 'isNotNull', BETWEEN = 'between',
  BEFORE = 'before', AFTER = 'after', AND = 'and', OR = 'or', NOT = 'not',
}

export enum SortDirection { ASC = 'asc', DESC = 'desc' }
export enum PaginationMode { OFFSET = 'offset', CURSOR = 'cursor', PAGE = 'page' }

export interface BaseFilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value?: T;
  value2?: T;
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export interface PagePagination {
  mode: PaginationMode.PAGE;
  page: number;
  pageSize: number;
}

export interface OffsetPagination {
  mode: PaginationMode.OFFSET;
  offset: number;
  limit: number;
}

export interface CursorPagination {
  mode: PaginationMode.CURSOR;
  cursor: string;
  limit: number;
}

export type PaginationParams = PagePagination | OffsetPagination | CursorPagination;

export interface QueryParams {
  filters?: BaseFilterCondition[];
  sort?: SortCondition[];
  pagination?: PaginationParams;
  search?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

// =============================================
// QUERY UTILITIES (minimal stubs for tests)
// =============================================

export function normalizeQueryParams(params: Record<string, unknown>): QueryParams {
  return params as QueryParams;
}

export function buildPrismaQuery(
  params: Record<string, unknown>,
  _options?: { maxLimit?: number; defaultLimit?: number }
): { where?: Record<string, unknown>; orderBy?: unknown; skip?: number; take?: number } {
  return {
    where: {},
    orderBy: [{ createdAt: 'desc' }],
    skip: 0,
    take: (_options?.defaultLimit ?? 20),
  };
}

export function extractPagination(params: Record<string, unknown>): PaginationParams | null {
  if (params.page !== undefined) {
    return { mode: PaginationMode.PAGE, page: Number(params.page) || 1, pageSize: Number(params.pageSize) || 20 };
  }
  if (params.offset !== undefined) {
    return { mode: PaginationMode.OFFSET, offset: Number(params.offset) || 0, limit: Number(params.limit) || 20 };
  }
  return null;
}

export function sanitizePage(page: unknown): number {
  const p = Number(page);
  return isNaN(p) || p < 1 ? 1 : p;
}

export function sanitizeLimit(limit: unknown, max = 100, defaultVal = 20): number {
  const l = Number(limit);
  if (isNaN(l) || l < 1) return defaultVal;
  return l > max ? max : l;
}

// =============================================
// JSON:API RESPONSE UTILITIES (stubs)
// =============================================

export function convertEntityToJsonApi(
  data: Record<string, unknown>,
  type: string,
  _options?: Record<string, unknown>
): Record<string, unknown> {
  return { data: { id: data.id, type, attributes: data } };
}

export function getSelfLinkFromRequest(
  _req: unknown,
  _suffix?: string
): string {
  return '/mock-self-link';
}

export function getBaseUrlFromRequest(_req: unknown): string {
  return 'http://localhost:3000';
}

export function createJsonApiPaginatedResponse(
  items: unknown[],
  total: number,
  type: string,
  _baseUrl: string,
  meta?: Record<string, unknown>,
  _options?: Record<string, unknown>
): Record<string, unknown> {
  return { data: items, meta: { total, type, ...meta } };
}

// =============================================
// SWAGGER DECORATORS (no-op stubs for tests)
// =============================================

export function ApiJsonApiSuccessResponse(_options?: unknown): MethodDecorator {
  return () => { /* no-op */ };
}
export function ApiJsonApiCreatedResponse(_options?: unknown): MethodDecorator {
  return () => { /* no-op */ };
}
export function ApiJsonApiPaginatedResponse(_options?: unknown): MethodDecorator {
  return () => { /* no-op */ };
}
export function ApiJsonApiErrorResponse(_options?: unknown): MethodDecorator {
  return () => { /* no-op */ };
}

// Helper re-export
export function sharedLibs(): string { return 'shared-libs'; }
