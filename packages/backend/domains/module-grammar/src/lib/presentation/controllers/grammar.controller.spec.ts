import { Test, TestingModule } from '@nestjs/testing';
import { GrammarController } from './grammar.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SaveGrammarLessonDto, CefrLevel } from '../../application/dtos/grammar-lesson.dtos';
import { GetRoadmapQuery } from '../../application/queries/get-roadmap';
import { CreateLessonCommand } from '../../application/commands/create-lesson';

describe('GrammarController', () => {
  let controller: GrammarController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

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
    it('should return roadmap data for a user via QueryBus', async () => {
      const mockUserId = 'test-user-id';
      const mockResult = { percentComplete: 50, completedLessons: 10, totalLessons: 20, streakDays: 5, currentXP: 100, levels: [] };
      
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockResult as any);

      const result = await controller.getRoadmap(mockUserId);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetRoadmapQuery));
      expect(result).toEqual(mockResult);
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson via CommandBus', async () => {
      const dto: SaveGrammarLessonDto = {
        title: 'Test Lesson',
        level: CefrLevel.A1,
        tags: ['test'],
      };
      
      const mockResult = { success: true, data: { id: 'new-id' } };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockResult as any);

      const result = await controller.createLesson(dto);

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateLessonCommand));
      expect(result).toEqual(mockResult);
    });
  });
});
