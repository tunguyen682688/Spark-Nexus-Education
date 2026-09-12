import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCommunityPostsQuery } from './get-community-posts.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

const DICEBEAR_ADVENTURER = 'https://api.dicebear.com/7.x/adventurer/svg';
const DICEBEAR_IDENTICON = 'https://api.dicebear.com/7.x/identicon/svg';

const MOCK_AUTHORS: Record<string, { name: string; avatar: string; role: string }> = {
  'mock-user-123': { name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150', role: 'Premium Scholar' },
  'user-2': { name: 'Emily Stone', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', role: 'Grammar Enthusiast' },
  'user-3': { name: 'Prof. David Miller', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150', role: 'Staff Tutor' },
};

const DEFAULT_AUTHOR = { name: 'Spark Learner', avatar: '', role: 'Community Member' };
const DEFAULT_COMMENTER = { name: 'Anonymous Learner', avatar: '', role: 'Learner' };

@QueryHandler(GetCommunityPostsQuery)
export class GetCommunityPostsHandler implements IQueryHandler<GetCommunityPostsQuery, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(query: GetCommunityPostsQuery): Promise<any> {
    const { tag, search } = query;
    const posts = await this.communityRepository.findPosts(tag, search);

    // Collect all unique userIds from posts and comments
    const userIds = new Set<string>();
    posts.forEach(post => {
      if (post.userId) userIds.add(post.userId);
      (post.comments || []).forEach((c: any) => {
        if (c.userId) userIds.add(c.userId);
      });
    });

    // Query User profiles from the database
    const dbUsers = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, picture: true, role: true }
    });

    const dbUserMap = new Map<string, { name: string; avatar: string; role: string }>();
    dbUsers.forEach(u => {
      dbUserMap.set(u.id, {
        name: u.name || DEFAULT_AUTHOR.name,
        avatar: u.picture || `${DICEBEAR_ADVENTURER}?seed=${u.id}`,
        role: u.role || DEFAULT_AUTHOR.role,
      });
    });

    return posts.map(post => {
      const author = MOCK_AUTHORS[post.userId] || dbUserMap.get(post.userId) || {
        ...DEFAULT_AUTHOR,
        avatar: `${DICEBEAR_ADVENTURER}?seed=${post.userId}`,
      };

      return {
        ...post,
        author,
        comments: (post.comments || []).map((c: any) => ({
          ...c,
          author: MOCK_AUTHORS[c.userId] || dbUserMap.get(c.userId) || {
            ...DEFAULT_COMMENTER,
            avatar: `${DICEBEAR_IDENTICON}?seed=${c.userId}`,
          }
        }))
      };
    });
  }
}

