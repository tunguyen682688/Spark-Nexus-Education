export interface JsonApiSingleResponse<T> {
  data?: {
    id: string;
    type?: string;
    attributes: T;
  };
}

export interface JsonApiCollectionResponse<T> {
  data?: Array<{
    id: string;
    type?: string;
    attributes: T;
  }>;
}
