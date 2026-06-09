import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaUser: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      picture: prismaUser.picture,
      role: prismaUser.role,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });
    return prismaUser ? this.mapToDomain(prismaUser) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return prismaUsers.map((u) => this.mapToDomain(u));
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return prismaUser ? this.mapToDomain(prismaUser) : null;
  }

  async upsert(user: {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role?: string;
  }): Promise<User> {
    const prismaUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role ?? 'user',
      },
    });
    return this.mapToDomain(prismaUser);
  }
}
