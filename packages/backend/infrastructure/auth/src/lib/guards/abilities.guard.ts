import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Retrieved from JwtAuthGuard

    if (!user) {
      throw new ForbiddenException({
        errors: [
          {
            status: '403',
            code: 'AUTH-002',
            title: 'Authentication Required',
            detail: 'Yêu cầu xác thực danh tính để thực hiện hành động này.',
          },
        ],
      });
    }

    // Dynamically support various param names for the vocabulary set ID
    const vocabularySetId =
      request.params.id || request.params.setId || request.params.vocabularySetId;

    if (!vocabularySetId) {
      // If there's no resource ID on the URL, it's not a specific resource action (e.g., Create Set)
      // We skip ABAC here and let RBAC/Controller logic handle it
      return true;
    }

    // 1. Fetch resource from DB for ABAC validation
    const vocabularySet = await this.prisma.vocabularySet.findUnique({
      where: { id: vocabularySetId },
      select: { userId: true, isPublic: true },
    });

    if (!vocabularySet) {
      // We let the Controller throw NotFoundException if the resource doesn't exist
      return true;
    }

    // 2. ABAC Rules execution:
    const isAdmin = user.role === 'ADMIN';
    const isOwner = vocabularySet.userId === user.id;
    const isPublic = vocabularySet.isPublic === true;

    const method = request.method;

    // GET requests (Read access)
    if (method === 'GET' && (isOwner || isPublic || isAdmin)) {
      return true;
    }

    // PUT/PATCH/DELETE/POST requests for the Set or its items (Modify/Delete/Append access)
    if ((method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'POST') && (isOwner || isAdmin)) {
      return true;
    }

    // ABAC Violation -> Throw Security Exception
    throw new ForbiddenException({
      errors: [
        {
          status: '403',
          code: 'AUTH-003',
          title: 'Access Denied',
          detail: 'Bạn không sở hữu tài nguyên này để thực hiện thay đổi dữ liệu.',
        },
      ],
    });
  }
}
