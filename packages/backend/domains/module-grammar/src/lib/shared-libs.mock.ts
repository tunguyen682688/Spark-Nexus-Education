import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = new Date();
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  abstract getEventName(): string;
}

export function sharedLibs(): string {
  return 'shared-libs';
}

// JSON:API helper mocks for testing
export function convertEntityToJsonApi(
  result: Record<string, unknown> | null | undefined,
  resourceType: string,
  options?: { selfLink?: string; version?: string; message?: string }
) {
  return {
    data: {
      id: (result as { id?: string } | null | undefined)?.id || 'mock-id',
      type: resourceType,
      attributes: result,
    },
    links: {
      self: options?.selfLink || `/api/v1/${resourceType}`,
    },
    meta: {
      version: options?.version || '1.0.0',
      message: options?.message,
    }
  };
}

export function createJsonApiPaginatedResponse(
  data: Record<string, unknown>[],
  total: number,
  resourceType: string,
  baseUrl: string,
  pagination: { page: number; limit: number },
  meta?: { version?: string; message?: string }
) {
  return {
    data: (data || []).map(item => ({
      id: (item as { id?: string })?.id || 'mock-id',
      type: resourceType,
      attributes: item,
    })),
    links: {
      self: `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}`,
    },
    meta: {
      pagination,
      version: meta?.version || '1.0.0',
      message: meta?.message,
      total,
    }
  };
}

export interface MockExpressRequest {
  protocol?: string;
  get?: (key: string) => string;
  originalUrl?: string;
}

export function getSelfLinkFromRequest(req: MockExpressRequest, id?: string) {
  const host = req?.get ? req.get('host') : 'localhost';
  const url = req?.originalUrl || '/api';
  return `${req?.protocol || 'http'}://${host}${url}${id ? `/${id}` : ''}`;
}

export function getBaseUrlFromRequest(req: MockExpressRequest) {
  const host = req?.get ? req.get('host') : 'localhost';
  const url = req?.originalUrl || '/api';
  return `${req?.protocol || 'http'}://${host}${url}`;
}

export function createQueryParamsFromObject(queryParams: Record<string, unknown>) {
  const page = queryParams?.page ? parseInt(queryParams.page as string, 10) : 1;
  const limit = queryParams?.limit 
    ? parseInt(queryParams.limit as string, 10) 
    : (queryParams?.pageSize ? parseInt(queryParams.pageSize as string, 10) : 20);
  return {
    page,
    limit,
    filters: queryParams?.filters || {},
    sort: queryParams?.sort || [],
    search: queryParams?.search || queryParams?.q || '',
  };
}

// Swagger Decorator Mocks
export function ApiJsonApiSuccessResponse(options?: unknown) {
  void options;
  return (target: unknown, key?: string, descriptor?: unknown) => {
    void target;
    void key;
    void descriptor;
  };
}

export function ApiJsonApiCreatedResponse(options?: unknown) {
  void options;
  return (target: unknown, key?: string, descriptor?: unknown) => {
    void target;
    void key;
    void descriptor;
  };
}

export function ApiJsonApiPaginatedResponse(options?: unknown) {
  void options;
  return (target: unknown, key?: string, descriptor?: unknown) => {
    void target;
    void key;
    void descriptor;
  };
}

export function ApiJsonApiErrorResponse(options?: unknown) {
  void options;
  return (target: unknown, key?: string, descriptor?: unknown) => {
    void target;
    void key;
    void descriptor;
  };
}



