import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@Injectable()
export class GrammarAbilitiesGuard implements CanActivate {
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

    const trapId = request.params.id || request.params.trapId;
    const path = request.path;

    // Check ABAC for Trap Diary endpoints
    if (trapId && path.includes('/trap-diary/')) {
      const trap = await this.prisma.userGrammarTrap.findUnique({
        where: { id: trapId },
        select: { userId: true },
      });

      if (!trap) {
        return true; // Let Controller handle 404 Not Found
      }

      if (trap.userId !== user.id && user.role !== 'ADMIN') {
        throw new ForbiddenException({
          errors: [
            {
              status: '403',
              code: 'AUTH-ABAC-001',
              title: 'Access Denied',
              detail: 'Bạn không có quyền can thiệp vào bẫy ngữ pháp của người khác.',
            },
          ],
        });
      }
      return true;
    }

    // Check ABAC for Lesson Progress endpoints
    if (trapId && path.includes('/progress')) {
      // In this case, progress is not a distinct entity modified by path ID. 
      // The path ID is actually the lesson ID. Progress uses lessonId and userId.
      // updateProgress payload doesn't necessarily dictate ownership of a lesson, but creates/updates progress FOR that user.
      // So no IDOR on Lesson ID because the user is just creating progress for themselves.
      return true;
    }

    // Default allow if no specific ABAC rule is hit
    return true;
  }
}
