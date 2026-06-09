/**
 * Filter Builder
 *
 * Type-safe builder for constructing complex filter conditions
 *
 * @module FilterBuilder
 */

import { FilterOperator, FilterCondition } from './types.js';

/**
 * Type-safe filter builder class
 */
export class FilterBuilder {
  private conditions: FilterCondition[] = [];

  /**
   * Create a new filter builder instance
   */
  static create(): FilterBuilder {
    return new FilterBuilder();
  }

  /**
   * Add an equals condition
   */
  eq<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.EQ,
      value,
    });
  }

  /**
   * Add a not equals condition
   */
  ne<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.NE,
      value,
    });
  }

  /**
   * Add a greater than condition
   */
  gt<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.GT,
      value,
    });
  }

  /**
   * Add a greater than or equal condition
   */
  gte<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.GTE,
      value,
    });
  }

  /**
   * Add a less than condition
   */
  lt<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.LT,
      value,
    });
  }

  /**
   * Add a less than or equal condition
   */
  lte<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.LTE,
      value,
    });
  }

  /**
   * Add a contains condition (for strings/arrays)
   */
  contains<T>(field: string, value: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.CONTAINS,
      value,
    });
  }

  /**
   * Add a starts with condition
   */
  startsWith(field: string, value: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.STARTS_WITH,
      value,
    });
  }

  /**
   * Add an ends with condition
   */
  endsWith(field: string, value: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.ENDS_WITH,
      value,
    });
  }

  /**
   * Add an in array condition
   */
  in<T>(field: string, values: T[]): this {
    return this.addCondition({
      field,
      operator: FilterOperator.IN,
      value: values,
    });
  }

  /**
   * Add a not in array condition
   */
  notIn<T>(field: string, values: T[]): this {
    return this.addCondition({
      field,
      operator: FilterOperator.NOT_IN,
      value: values,
    });
  }

  /**
   * Add a contains all condition (array field contains all elements in value array)
   */
  containsAll<T>(field: string, values: T[]): this {
    return this.addCondition({
      field,
      operator: FilterOperator.CONTAINS_ALL,
      value: values,
    });
  }

  /**
   * Add a contains any condition (array field contains any element in value array)
   */
  containsAny<T>(field: string, values: T[]): this {
    return this.addCondition({
      field,
      operator: FilterOperator.CONTAINS_ANY,
      value: values,
    });
  }

  /**
   * Add a between condition
   */
  between<T>(field: string, value1: T, value2: T): this {
    return this.addCondition({
      field,
      operator: FilterOperator.BETWEEN,
      value: value1,
      value2,
    });
  }

  /**
   * Add a before date condition
   */
  before(field: string, date: Date | string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.BEFORE,
      value: date instanceof Date ? date.toISOString() : date,
    });
  }

  /**
   * Add an after date condition
   */
  after(field: string, date: Date | string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.AFTER,
      value: date instanceof Date ? date.toISOString() : date,
    });
  }

  /**
   * Add an is null condition
   */
  isNull(field: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.IS_NULL,
    });
  }

  /**
   * Add an is not null condition
   */
  isNotNull(field: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.IS_NOT_NULL,
    });
  }

  /**
   * Add an is empty condition
   */
  isEmpty(field: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.IS_EMPTY,
    });
  }

  /**
   * Add an is not empty condition
   */
  isNotEmpty(field: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.IS_NOT_EMPTY,
    });
  }

  /**
   * Add a regex condition
   */
  regex(field: string, pattern: string): this {
    return this.addCondition({
      field,
      operator: FilterOperator.REGEX,
      value: pattern,
    });
  }

  /**
   * Add a logical AND condition
   */
  and(conditions: FilterCondition[]): this {
    return this.addCondition({
      operator: FilterOperator.AND,
      conditions,
    });
  }

  /**
   * Add a logical OR condition
   */
  or(conditions: FilterCondition[]): this {
    return this.addCondition({
      operator: FilterOperator.OR,
      conditions,
    });
  }

  /**
   * Add a logical NOT condition
   */
  not(conditions: FilterCondition[]): this {
    return this.addCondition({
      operator: FilterOperator.NOT,
      conditions,
    });
  }

  /**
   * Add a custom condition
   */
  addCondition(condition: FilterCondition): this {
    this.conditions.push(condition);
    return this;
  }

  /**
   * Build and return the filter conditions
   */
  build(): FilterCondition[] {
    return this.conditions;
  }

  /**
   * Build a single condition (if only one condition exists)
   */
  buildSingle(): FilterCondition | null {
    return this.conditions.length === 1 ? this.conditions[0] : null;
  }

  /**
   * Clear all conditions
   */
  clear(): this {
    this.conditions = [];
    return this;
  }
}

/**
 * Helper function to create a filter builder
 */
export function createFilterBuilder(): FilterBuilder {
  return FilterBuilder.create();
}
