export class GetMyArticlesQuery {
  constructor(
    public readonly userId: string,
    public readonly page = 1,
    public readonly limit = 10,
    public readonly sortBy = 'createdAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc'
  ) {}
}
