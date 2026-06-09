/**
 * Query Transformers
 *
 * Utilities for transforming query parameters to various formats
 * (e.g., Prisma, TypeORM, raw SQL, etc.)
 *
 * @module QueryTransformers
 */

import {
  FilterCondition,
  BaseFilterCondition,
  NestedFilterCondition,
  SortSpec,
  PaginationConfig,
  PaginationMode,
  FilterOperator,
  SortDirection,
} from '../core/types.js';

/**
 * Prisma-style where clause
 */
export type PrismaWhere = Record<string, unknown>;

/**
 * Transform filter conditions to Prisma where clause
 */
export function toPrismaWhere(conditions: FilterCondition[]): PrismaWhere {
  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return transformConditionToPrisma(conditions[0]);
  }

  return {
    AND: conditions.map((condition) => transformConditionToPrisma(condition)),
  };
}

/**
 * Transform a single filter condition to Prisma format
 */
function transformConditionToPrisma(condition: FilterCondition): PrismaWhere {
  if ('conditions' in condition) {
    // Nested condition
    const nested = condition as NestedFilterCondition;
    const transformedConditions = nested.conditions.map((c) =>
      transformConditionToPrisma(c)
    );

    switch (nested.operator) {
      case FilterOperator.AND:
        return { AND: transformedConditions };
      case FilterOperator.OR:
        return { OR: transformedConditions };
      case FilterOperator.NOT:
        return { NOT: transformedConditions };
      default:
        return {};
    }
  }

  const base = condition as BaseFilterCondition;
  const field = base.field;
  const operator = base.operator;
  const value = base.value;

  switch (operator) {
    case FilterOperator.EQ:
      return { [field]: value };
    case FilterOperator.NE:
      return { [field]: { not: value } };
    case FilterOperator.GT:
      return { [field]: { gt: value } };
    case FilterOperator.GTE:
      return { [field]: { gte: value } };
    case FilterOperator.LT:
      return { [field]: { lt: value } };
    case FilterOperator.LTE:
      return { [field]: { lte: value } };
    case FilterOperator.CONTAINS:
      return { [field]: { contains: value, mode: 'insensitive' } };
    case FilterOperator.STARTS_WITH:
      return { [field]: { startsWith: value, mode: 'insensitive' } };
    case FilterOperator.ENDS_WITH:
      return { [field]: { endsWith: value, mode: 'insensitive' } };
    case FilterOperator.IN:
      return { [field]: { in: Array.isArray(value) ? value : [value] } };
    case FilterOperator.NOT_IN:
      return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
    case FilterOperator.CONTAINS_ALL:
      // Prisma: array field contains all elements in value array
      // Using every() check - requires custom logic in application layer
      // For Prisma, we use hasEvery if available, otherwise fallback
      return {
        [field]: {
          hasEvery: Array.isArray(value) ? value : [value],
        },
      };
    case FilterOperator.CONTAINS_ANY:
      // Prisma: array field contains any element in value array
      // Using hasSome if available
      return {
        [field]: {
          hasSome: Array.isArray(value) ? value : [value],
        },
      };
    case FilterOperator.BETWEEN:
      return {
        [field]: {
          gte: base.value,
          lte: base.value2,
        },
      };
    case FilterOperator.BEFORE:
      return { [field]: { lt: value } };
    case FilterOperator.AFTER:
      return { [field]: { gt: value } };
    case FilterOperator.IS_NULL:
      return { [field]: null };
    case FilterOperator.IS_NOT_NULL:
      return { [field]: { not: null } };
    case FilterOperator.REGEX:
      return { [field]: { contains: value, mode: 'insensitive' } };
    default:
      return {};
  }
}

/**
 * Transform sort specifications to Prisma orderBy
 */
export function toPrismaOrderBy(
  sorts: SortSpec[]
): Record<string, SortDirection> | Record<string, SortDirection>[] {
  if (sorts.length === 0) {
    return {};
  }

  if (sorts.length === 1) {
    return {
      [sorts[0].field]: sorts[0].direction,
    };
  }

  return sorts.map((sort) => ({
    [sort.field]: sort.direction,
  }));
}

/**
 * Extract pagination parameters for Prisma
 */
export function toPrismaPagination(pagination?: PaginationConfig): {
  take?: number;
  skip?: number;
  cursor?: Record<string, unknown>;
} {
  if (!pagination) {
    return {};
  }

  switch (pagination.mode) {
    case PaginationMode.OFFSET:
      return {
        take: pagination.config.limit,
        skip: pagination.config.offset,
      };
    case PaginationMode.PAGE: {
      const pageSize = pagination.config.pageSize;
      const page = pagination.config.page;
      return {
        take: pageSize,
        skip: (page - 1) * pageSize,
      };
    }
    case PaginationMode.CURSOR:
      return {
        take: pagination.config.limit,
        cursor: pagination.config.cursor
          ? { id: pagination.config.cursor }
          : undefined,
      };
    default:
      return {};
  }
}

/**
 * TypeORM FindOptions style
 */
export interface TypeORMFindOptions {
  where?: unknown;
  order?: Record<string, 'ASC' | 'DESC'>;
  take?: number;
  skip?: number;
}

/**
 * Transform to TypeORM FindOptions
 */
export function toTypeORMFindOptions(
  filters?: FilterCondition[],
  sorts?: SortSpec[],
  pagination?: PaginationConfig
): TypeORMFindOptions {
  const options: TypeORMFindOptions = {};

  if (filters && filters.length > 0) {
    options.where = toTypeORMWhere(filters);
  }

  if (sorts && sorts.length > 0) {
    options.order = toTypeORMOrder(sorts);
  }

  const paginationParams = toPrismaPagination(pagination);
  if (paginationParams.take) {
    options.take = paginationParams.take;
  }
  if (paginationParams.skip !== undefined) {
    options.skip = paginationParams.skip;
  }

  return options;
}

/**
 * Transform filter conditions to TypeORM where format
 */
function toTypeORMWhere(conditions: FilterCondition[]): unknown {
  // TypeORM uses similar structure to Prisma for most cases
  // This is a simplified version - you may need to adjust based on your TypeORM version
  return toPrismaWhere(conditions);
}

/**
 * Transform sort specifications to TypeORM order format
 */
function toTypeORMOrder(sorts: SortSpec[]): Record<string, 'ASC' | 'DESC'> {
  const order: Record<string, 'ASC' | 'DESC'> = {};
  for (const sort of sorts) {
    order[sort.field] = sort.direction.toUpperCase() as 'ASC' | 'DESC';
  }
  return order;
}

/**
 * SQL WHERE clause builder (simplified)
 */
export function toSQLWhere(
  conditions: FilterCondition[],
  tableAlias = ''
): { sql: string; params: unknown[] } {
  const params: unknown[] = [];
  let paramIndex = 1;

  const buildCondition = (condition: FilterCondition): string => {
    if ('conditions' in condition) {
      const nested = condition as NestedFilterCondition;
      const sqlConditions = nested.conditions.map((c) => buildCondition(c));
      const operator = nested.operator.toUpperCase();
      return `(${sqlConditions.join(` ${operator} `)})`;
    }

    const base = condition as BaseFilterCondition;
    const field = tableAlias ? `${tableAlias}.${base.field}` : base.field;
    const value = base.value;
    const paramPlaceholder = `$${paramIndex++}`;

    switch (base.operator) {
      case FilterOperator.EQ:
        params.push(value);
        return `${field} = ${paramPlaceholder}`;
      case FilterOperator.NE:
        params.push(value);
        return `${field} != ${paramPlaceholder}`;
      case FilterOperator.GT:
        params.push(value);
        return `${field} > ${paramPlaceholder}`;
      case FilterOperator.GTE:
        params.push(value);
        return `${field} >= ${paramPlaceholder}`;
      case FilterOperator.LT:
        params.push(value);
        return `${field} < ${paramPlaceholder}`;
      case FilterOperator.LTE:
        params.push(value);
        return `${field} <= ${paramPlaceholder}`;
      case FilterOperator.CONTAINS:
        params.push(`%${value}%`);
        return `${field} LIKE ${paramPlaceholder}`;
      case FilterOperator.STARTS_WITH:
        params.push(`${value}%`);
        return `${field} LIKE ${paramPlaceholder}`;
      case FilterOperator.ENDS_WITH:
        params.push(`%${value}`);
        return `${field} LIKE ${paramPlaceholder}`;
      case FilterOperator.IN: {
        const inValues = Array.isArray(value) ? value : [value];
        const inPlaceholders: string[] = [];
        for (const val of inValues) {
          params.push(val);
          inPlaceholders.push(`$${paramIndex++}`);
        }
        return `${field} IN (${inPlaceholders.join(', ')})`;
      }
      case FilterOperator.CONTAINS_ALL: {
        // SQL: array field contains all elements in value array
        // Using array contains operator (PostgreSQL syntax: @>)
        const allValues = Array.isArray(value) ? value : [value];
        const allPlaceholders: string[] = [];
        for (const val of allValues) {
          params.push(val);
          allPlaceholders.push(`$${paramIndex++}`);
        }
        // PostgreSQL: field @> ARRAY[value1, value2, ...]
        return `${field} @> ARRAY[${allPlaceholders.join(', ')}]`;
      }
      case FilterOperator.CONTAINS_ANY: {
        // SQL: array field contains any element in value array
        // Using array overlap operator (PostgreSQL syntax: &&)
        const anyValues = Array.isArray(value) ? value : [value];
        const anyPlaceholders: string[] = [];
        for (const val of anyValues) {
          params.push(val);
          anyPlaceholders.push(`$${paramIndex++}`);
        }
        // PostgreSQL: field && ARRAY[value1, value2, ...]
        return `${field} && ARRAY[${anyPlaceholders.join(', ')}]`;
      }
      case FilterOperator.BETWEEN:
        params.push(base.value);
        params.push(base.value2);
        return `${field} BETWEEN $${paramIndex - 1} AND $${paramIndex}`;
      case FilterOperator.IS_NULL:
        return `${field} IS NULL`;
      case FilterOperator.IS_NOT_NULL:
        return `${field} IS NOT NULL`;
      default:
        return '1=1'; // Always true fallback
    }
  };

  const sql = conditions.map((c) => buildCondition(c)).join(' AND ');
  return { sql, params };
}
