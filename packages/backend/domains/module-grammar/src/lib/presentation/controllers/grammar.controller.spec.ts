import { Test, TestingModule } from '@nestjs/testing';
import { GrammarController } from './grammar.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SaveGrammarLessonDto, CefrLevel } from '../../application/dtos/grammar-lesson.dtos';
import { GetRoadmapQuery } from '../../application/queries/get-roadmap';
import { CreateLessonCommand } from '../../application/commands/create-lesson';
import { GrammarAbilitiesGuard } from '../guards/grammar-abilities.guard';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import express from 'express';

describe('GrammarController', () => {
  let controller: GrammarController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockRequest = {
    protocol: 'http',
    get: jest.fn().mockReturnValue('localhost:3000'),
    originalUrl: '/api/v1/grammar',
  } as unknown as express.Request;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrammarController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: GrammarAbilitiesGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<GrammarController>(GrammarController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoadmap', () => {
    it('should return roadmap data for a user in JSON:API format', async () => {
      const mockUserId = 'test-user-id';
      const mockResult = { percentComplete: 50, completedLessons: 10, totalLessons: 20, streakDays: 5, currentXP: 100, levels: [] };
      
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockResult as unknown as never);

      const result = await controller.getRoadmap(mockUserId, mockRequest);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetRoadmapQuery));
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('attributes');
      expect(result.data.attributes).toEqual(mockResult);
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson and return in JSON:API format', async () => {
      const dto: SaveGrammarLessonDto = {
        title: 'Test Lesson',
        level: CefrLevel.A1,
        tags: ['test'],
      };
      
      const mockResult = { id: 'new-id', title: 'Test Lesson' };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockResult as unknown as never);

      const result = await controller.createLesson(dto, mockRequest);

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateLessonCommand));
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id', 'new-id');
      expect(result.data.attributes).toEqual(mockResult);
    });
  });
});



