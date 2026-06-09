export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly picture: string | null,
    public readonly role: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name ?? null,
      data.picture ?? null,
      data.role ?? 'user',
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }
}
