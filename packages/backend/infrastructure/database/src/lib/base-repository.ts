import { PrismaService } from './prisma.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class BaseRepository<
  T,
  CreateInput = any,
  UpdateInput = any,
  WhereInput = any,
  WhereUniqueInput = any
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName.toLowerCase()];
  }

  async findById(id: string | number, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  async findAll(args?: {
    where?: WhereInput;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
  }): Promise<T[]> {
    return this.model.findMany(args);
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }

  async softDelete(where: WhereUniqueInput): Promise<T> {
    return this.model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async count(where?: WhereInput): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.model.count({ where, take: 1 });
    return count > 0;
  }

  async paginate(args: {
    where?: WhereInput;
    orderBy?: any;
    page: number;
    limit: number;
    include?: any;
  }) {
    const { page, limit, ...queryArgs } = args;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        ...queryArgs,
        skip,
        take: limit,
      }),
      this.model.count({ where: args.where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
