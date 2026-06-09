import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CreateVocabularySetDto } from '../../application/dtos/create-vocabulary-set.dto';
import { UpdateVocabularySetDto } from '../../application/dtos/update-vocabulary-set.dto';
import { AddWordToSetDto } from '../../application/dtos/add-word-to-set.dto';
import * as auth from '@spark-nest-ed/infrastructure-auth';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import {
  ApiJsonApiCreatedResponse,
  ApiJsonApiErrorResponse,
  ApiJsonApiSuccessResponse,
  createJsonApiPaginatedResponse,
  getBaseUrlFromRequest,
} from '@spark-nest-ed/shared-libs';
import * as vocabularySetRepositoryInterface from '../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../domain/repositories/vocabulary-set-item.repository.interface';
import * as entryRepositoryInterface from '../../domain/repositories/entry.repository.interface';
import { CreateVocabularySetCommand } from '../../application/commands/create-vocabulary-set';
import { UpdateVocabularySetCommand } from '../../application/commands/update-vocabulary-set';
import { AddWordToSetCommand } from '../../application/commands/add-word-to-set/add-word-to-set.command';
import { DeleteWordFromSetCommand, DeleteWordResult } from '../../application/commands/delete-word-from-set';
import { DeleteVocabularySetCommand, DeleteVocabularySetResult } from '../../application/commands/delete-vocabulary-set';
import { SyncVocabularySetItemsCommand } from '../../application/commands/sync-vocabulary-set-items/sync-vocabulary-set-items.command';
import { SyncVocabularySetItemsDto } from '../../application/dtos/sync-vocabulary-set-items.dto';
import {
  convertEntityToJsonApi,
  getSelfLinkFromRequest,
  createQueryParamsFromObject,
} from '@spark-nest-ed/shared-libs';
import express from 'express';
import { GetVocabularySetQuery } from '../../application/querys/get-vocabulary-set';
import { GetWordsVocabularySetQuery } from '../../application/querys/get-word-vocabulary-set';
import { GetCommunityVocabularySetQuery } from '../../application/querys/get-community-vocabulary-set';
import { GetUserVocabularySetsQuery } from '../../application/querys/get-user-vocabulary-sets';
import { GetUserFavoritesQuery } from '../../application/querys/get-user-favorites';
import { GetEntryDetailQuery } from '../../application/querys/get-entry-detail';
import { NotFoundException } from '@nestjs/common';
import { VocabularySetItemDto, WordMinimumDto } from '../../application/dtos/reponse-word.dto';
import { GetFlashcardSessionQuery } from '../../application/querys/get-flashcard-session';
import { ReviewFlashcardCommand } from '../../application/commands/review-flashcard';
import { ReviewFlashcardDto } from '../../application/dtos/flashcard.dto';

@Controller('vocabulary')
@ApiTags('Vocabulary Sets')
export class VocabularySetController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository
  ) {}
  // Create a new vocabulary set
  @Post('packages')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new vocabulary set',
    description: `
Creates a new vocabulary set for the authenticated user.

**Business Rules:**
- Empty set: Creates a vocabulary set with no words (can add words later)
- Small batch (≤50 words): Processes synchronously, returns immediately
- Large batch (>50 words): Creates set with "pending" status, processes in background

**Word Processing:**
- Existing words (published): Attached directly to the vocabulary set
- New words: Created as draft entries, need approval before being published to community

**Response:**
- Returns JSON:API format with the created vocabulary set
- Includes import status and progress for large batches
    `,
  })
  @ApiBody({
    type: CreateVocabularySetDto,
    description: 'Vocabulary set creation data',
    examples: {
      emptySet: {
        summary: 'Empty vocabulary set',
        description: 'Create an empty vocabulary set without initial words',
        value: {
          title: 'My Vocabulary Set',
          description: 'A collection of vocabulary words',
          language: 'en',
          type: 'custom',
          difficulty: 'intermediate',
          tags: ['vocabulary', 'learning'],
        },
      },
      smallBatch: {
        summary: 'Small batch (synchronous)',
        description:
          'Create vocabulary set with up to 50 words (processed immediately)',
        value: {
          title: 'IELTS Writing Vocabulary',
          description: 'Essential words for IELTS writing task 2',
          language: 'en',
          type: 'custom',
          difficulty: 'intermediate',
          tags: ['ielts', 'writing'],
          initialWords: [
            {
              word: 'analyze',
              definition: 'To examine in detail',
              example: 'We need to analyze the data carefully',
              notes: 'Common in academic writing',
            },
            {
              word: 'conclude',
              definition: 'To reach a decision',
              example: 'In conclusion, we can see that...',
            },
          ],
        },
      },
      largeBatch: {
        summary: 'Large batch (asynchronous)',
        description:
          'Create vocabulary set with more than 50 words (processed in background)',
        value: {
          title: 'TOEFL Vocabulary Master',
          description: 'Complete TOEFL vocabulary collection',
          language: 'en',
          type: 'custom',
          difficulty: 'advanced',
          tags: ['toefl', 'advanced'],
          initialWords: Array.from({ length: 100 }, (_, i) => ({
            word: `word${i + 1}`,
            definition: `Definition for word ${i + 1}`,
            example: `Example sentence for word ${i + 1}`,
          })),
        },
      },
      withExistingEntries: {
        summary: 'Using existing entries',
        description: 'Create vocabulary set by referencing existing entry IDs',
        value: {
          title: 'Common Words Collection',
          language: 'en',
          type: 'custom',
          initialEntryIds: ['entry-id-1', 'entry-id-2', 'entry-id-3'],
        },
      },
    },
  })
  @ApiJsonApiCreatedResponse({
    description: 'Vocabulary set created successfully',
    resourceType: 'vocabulary-set',
    exampleId: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiJsonApiErrorResponse({
    status: 400,
    description: 'Bad Request - Validation errors or invalid input',
  })
  @ApiJsonApiErrorResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiJsonApiErrorResponse({
    status: 422,
    description: 'Unprocessable Entity - Business rule violations',
  })
  async createVocabularySet(
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: CreateVocabularySetDto,
    @Req() req: express.Request
  ) {
    const command = new CreateVocabularySetCommand(
      user.id,
      dto.title,
      dto.language,
      dto.type,
      dto.coverImageUrl,
      dto.description,
      dto.difficulty,
      dto.tags,
      dto.initialWords
    );

    const result = await this.commandBus.execute(command);
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'vocabulary-set', {
      selfLink,
      message: 'Vocabulary set created successfully',
      version: '1.0.0',
    });
  }

  // Update vocabulary set metadata
  @Put('packages/:id')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update vocabulary set metadata',
    description:
      'Update title, description, difficulty, tags or visibility of a vocabulary set owned by the current user.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set updated successfully',
    resourceType: 'vocabulary-set',
  })
  async updateVocabularySet(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateVocabularySetDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new UpdateVocabularySetCommand(user.id, id, dto)
    );

    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'vocabulary-set', {
      selfLink,
      version: '1.0.0',
      message: 'Vocabulary set updated successfully',
    });
  }

  // Delete vocabulary set
  @Delete('packages/:id')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete a vocabulary set',
    description:
      'Soft delete a vocabulary set owned by the current user. This will deactivate the set and all its words.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set deleted successfully',
    resourceType: 'vocabulary-set',
  })
  async deleteVocabularySet(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const result: DeleteVocabularySetResult = await this.commandBus.execute(
      new DeleteVocabularySetCommand(user.id, id)
    );

    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(
      { id: result.id, deleted: result.deleted },
      'vocabulary-set',
      {
        selfLink,
        version: '1.0.0',
        message: 'Vocabulary set deleted successfully',
      }
    );
  }

  // ========================= WORD MUTATIONS =========================

  // Sync vocabulary set items (Bulk Add/Update/Delete)
  @Put('packages/:id/items')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Sync vocabulary set items',
    description: 'Bulk add, update, or delete words in a vocabulary set.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set items synced successfully',
    resourceType: 'vocabulary-set',
  })
  async syncVocabularySetItems(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: SyncVocabularySetItemsDto,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new SyncVocabularySetItemsCommand(user.id, id, dto)
    );

    const selfLink = getSelfLinkFromRequest(req, id);
    return convertEntityToJsonApi({ id }, 'vocabulary-set', {
      selfLink,
      version: '1.0.0',
      message: 'Vocabulary set items synced successfully',
    });
  }

  @Post('packages/:id/words')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add a word to a vocabulary set',
    description:
      'Attach an existing word (by entryId) or create a new draft entry and add it to the vocabulary set.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Word added to vocabulary set successfully',
    resourceType: 'word-vocabulary-set',
  })
  async addWordToVocabularySet(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: AddWordToSetDto,
    @Req() req: express.Request
  ) {
    const itemDto = await this.commandBus.execute(
      new AddWordToSetCommand(user.id, id, dto)
    );

    const selfLink = `${getSelfLinkFromRequest(req, id)}/words/${itemDto.id}`;
    return convertEntityToJsonApi(itemDto, 'word-vocabulary-set', {
      selfLink,
      version: '1.0.0',
      message: 'Word added to vocabulary set successfully',
    });
  }

  // Get community vocabulary sets
  @Get('packages/community')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'List community vocabulary sets',
    description: `
Retrieve paginated community-shared vocabulary sets with full query support.

**Supported Query Parameters:**

**Pagination:**
- \`page\` - Page number (default: 1)
- \`pageSize\` - Items per page (default: 20, max: 100)
- \`limit\` - Alternative to pageSize
- \`offset\` - Alternative to page

**Sorting:**
- Simple: \`sortBy=createdAt&sortDirection=desc\`
- Advanced: \`sort[0][field]=createdAt&sort[0][direction]=desc\`

**Filtering:**
- Simple filters (key-value): \`language=en&type=custom&difficulty=beginner\`
- Array filters: \`tags[0]=TOEIC&tags[1]=IELTS\` (automatically uses CONTAINS_ANY)
- Advanced filters: \`filters[0][field]=language&filters[0][operator]=eq&filters[0][value]=en\`

**Search:**
- \`search=keyword\` or \`q=keyword\` - Full-text search in title and description
- \`searchFields[0]=title&searchFields[1]=description\` - Specify fields to search
- **Note:** Array fields like \`tags\` cannot be used in searchFields (use tag filters instead)

**Filterable Fields:**
- \`language\` - Language code (en, vi, ja, ko, zh, es, fr, de)
- \`type\` - Set type (custom, flashcard, quiz)
- \`difficulty\` - Difficulty level (beginner, intermediate, advanced)
- \`tags\` - Array of tags (use \`tags[0]=TOEIC\` format for filtering)

**Note:** 
- \`isPublic\`, \`isActive\`, \`deleted\` are automatically enforced and cannot be overridden
- Array fields like \`tags\` use CONTAINS_ANY operator (matches if array contains any of the values)
- To search by tag, use the tags filter, not search/searchFields
    `,
  })
  @ApiJsonApiSuccessResponse({
    description: 'Community vocabulary sets retrieved successfully',
    resourceType: 'community-vocabulary-set',
  })

  async getCommunityVocabularySets(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(
      new GetCommunityVocabularySetQuery(parsedParams)
    );

    const pagination =
      result.meta.pagination ?? {
        page: 1,
        limit: result.data.length || 20,
        total: result.data.length,
        totalPages: 1,
      };

    return createJsonApiPaginatedResponse(
      result.data,
      pagination.total,
      'community-vocabulary-set',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: result.meta.version ?? '1.0.0',
        message:
          result.meta.message ??
          'Community vocabulary sets retrieved successfully',
      }
    );
  }
  // Get a vocabulary set by ID
  @Get('packages/:id')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get a vocabulary set by ID',
    description: 'Get a vocabulary set by ID',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set retrieved successfully',
    resourceType: 'vocabulary-set',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Vocabulary set not found',
  })
  async getVocabularySet(@Param('id') id: string, @Req() req: express.Request) {
    const result = await this.queryBus.execute(new GetVocabularySetQuery(id));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'vocabulary-set', {
      selfLink,
      message: 'Vocabulary set retrieved successfully',
      version: '1.0.0',
    });
  }

  // Get words in a vocabulary set
  @Get('packages/:id/words')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get words in a vocabulary set',
    description: `
Get paginated list of words in a vocabulary set with advanced query capabilities.

**Pagination Parameters:**
- \`page\`: Page number (default: 1)
- \`pageSize\` or \`limit\`: Items per page (default: 20, max: 100)
- \`offset\`: Offset for offset-based pagination
- \`cursor\`: Cursor for cursor-based pagination

**Sorting Parameters:**
- \`sortBy\`: Field to sort by (e.g., 'word', 'position', 'addedAt')
- \`sortDirection\`: Sort direction ('asc' or 'desc')
- \`sort\`: Advanced multi-field sorting (array format)

**Filtering Parameters:**
- \`filters\`: Advanced filter conditions (array format)
- Simple filters: Any field name with value (e.g., \`word=hello\`)

**Search Parameters:**
- \`search\` or \`q\`: Search query string
- \`searchFields\`: Fields to search in (array)

**Vocabulary-Specific Parameters:**
- \`includeDetails\`: Level of word details to include
  - \`none\`: Only set item data (word, definition, example from set)
  - \`minimum\`: Basic word info (word, definition, example, pronunciation, partOfSpeech)
  - \`full\`: Complete word details with all relationships (senses, examples, expressions, lexical variants)

**Response:**
- Returns JSON:API paginated format
- Includes pagination metadata and links
    `,
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set words retrieved successfully',
    resourceType: 'word-vocabulary-set',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Vocabulary set not found',
  })
  async getVocabularySetWords(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    // Extract includeDetails separately as it's vocabulary-specific
    const includeDetails =
      (queryParams.includeDetails as 'none' | 'minimum' | 'full') || 'minimum';

    // Parse query params using query system (handles pagination, sorting, filtering)
    const parsedParams = createQueryParamsFromObject(queryParams);

    // Combine with vocabulary-specific params
    const params = {
      ...parsedParams,
      includeDetails,
    };

    const result = await this.queryBus.execute(
      new GetWordsVocabularySetQuery(id, params, user.id)
    );
    return createJsonApiPaginatedResponse(
      result.data,
      result.meta.total,
      'word-vocabulary-set',
      getBaseUrlFromRequest(req),
      result.meta,
      {
        message: 'Vocabulary set words retrieved successfully',
        version: '1.0.0',
      }
    );
  }

  // Update a word in a vocabulary set
  @Put('packages/:setId/words/:itemId')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update a word in a vocabulary set',
    description:
      'Update definition, example or notes of a word item in the vocabulary set.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set word updated successfully',
    resourceType: 'word-vocabulary-set',
  })
  async updateVocabularySetWord(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('setId') setId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AddWordToSetDto,
    @Req() req: express.Request
  ) {
    const set = await this.vocabularySetRepository.findById(setId);
    if (!set) {
      throw new NotFoundException('Vocabulary set not found');
    }
    const item = await this.vocabularySetItemRepository.findById(itemId);
    if (!item || item.getVocabularySetId() !== setId) {
      throw new NotFoundException('Vocabulary set item not found');
    }

    const wordText = dto.word?.word?.trim();
    const definition = dto.word?.definition?.trim();
    const example = dto.word?.example?.trim();
    const notes = dto.word?.notes?.trim();
    const partOfSpeech = dto.word?.partOfSpeech?.trim();

    // Update VocabularySetItem with all word data
    item.updateWordData({
      word: wordText,
      definition: definition !== undefined ? (definition || null) : undefined,
      example: example !== undefined ? (example || null) : undefined,
      notes: notes !== undefined ? (notes || null) : undefined,
    });

    // Update Entry with full data (word, definition, example, partOfSpeech)
    const updatedEntry = await this.entryRepository.updateEntry(
      item.getEntryId(),
      {
        word: wordText,
        definition: definition !== undefined ? (definition || null) : undefined,
        example: example !== undefined ? (example || null) : undefined,
        partOfSpeech: partOfSpeech !== undefined ? (partOfSpeech || null) : undefined,
      }
    );

    const updated = await this.vocabularySetItemRepository.update(item);

    // Build wordMinimum from updated entry
    const wordMinimum: WordMinimumDto = {
      id: updatedEntry.id,
      word: updatedEntry.word,
      definition: updatedEntry.definition,
      example: updatedEntry.example,
      pronunciation: null, // Not updated here
      partOfSpeech: updatedEntry.partOfSpeech,
    };

    const itemDto: VocabularySetItemDto = {
      id: updated.getId(),
      entryId: updated.getEntryId(),
      vocabularySetId: updated.getVocabularySetId(),
      customWord: updated.getWord(),
      customDefinition: updated.getDefinition(),
      customExample: updated.getExample(),
      notes: updated.getNotes(),
      position: updated.getPosition(),
      addedAt: updated.getAddedAt(),
      wordMinimum,
    };

    const selfLink = `${getSelfLinkFromRequest(req, setId)}/words/${updated.getId()}`;
    return convertEntityToJsonApi(itemDto, 'word-vocabulary-set', {
      selfLink,
      version: '1.0.0',
      message: 'Vocabulary set word updated successfully',
    });
  }

  // Delete a word from a vocabulary set
  @Delete('packages/:setId/words/:itemId')
  @UseGuards(auth.JwtAuthGuard, auth.AbilitiesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remove a word from a vocabulary set',
    description: 'Soft delete a vocabulary set item and update entry count.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set word deleted successfully',
    resourceType: 'word-vocabulary-set',
  })
  async deleteVocabularySetWord(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('setId') setId: string,
    @Param('itemId') itemId: string,
    @Req() req: express.Request
  ) {
    const result: DeleteWordResult = await this.commandBus.execute(
      new DeleteWordFromSetCommand(user.id, setId, itemId)
    );

    const selfLink = `${getSelfLinkFromRequest(req, setId)}/words/${itemId}`;
    return convertEntityToJsonApi(
      { id: result.id, deleted: result.deleted },
      'word-vocabulary-set',
      {
        selfLink,
        version: '1.0.0',
        message: 'Vocabulary set word deleted successfully',
      }
    );
  }

  // ==================== USER'S PERSONAL VOCABULARY SETS ====================

  // Get user's own vocabulary sets (created by user)
  @Get('packages/my/created')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: "Get user's created vocabulary sets",
    description: `
Retrieve paginated list of vocabulary sets created by the authenticated user.

**Supported Query Parameters:**

**Pagination:**
- \`page\` - Page number (default: 1)
- \`pageSize\` - Items per page (default: 20, max: 100)

**Sorting:**
- \`sortBy=createdAt&sortDirection=desc\` - Sort by field
- \`sort[0][field]=createdAt&sort[0][direction]=desc\` - Advanced sorting

**Filtering:**
- \`language=en\` - Filter by language
- \`type=custom\` - Filter by type
- \`difficulty=intermediate\` - Filter by difficulty
- \`isPublic=true\` - Filter by public/private status
- \`isActive=true\` - Filter by active status
- \`tags[0]=TOEIC\` - Filter by tags

**Search:**
- \`search=keyword\` - Search in title and description
    `,
  })
  @ApiJsonApiSuccessResponse({
    description: 'User vocabulary sets retrieved successfully',
    resourceType: 'vocabulary-set',
  })
  async getUserCreatedSets(
    @auth.CurrentUser() user: auth.AuthUser,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(
      new GetUserVocabularySetsQuery(user.id, parsedParams)
    );

    const pagination =
      result.meta.pagination ?? {
        page: 1,
        limit: result.data.length || 20,
        total: result.data.length,
        totalPages: 1,
      };

    return createJsonApiPaginatedResponse(
      result.data,
      pagination.total,
      'vocabulary-set',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: result.meta.version ?? '1.0.0',
        message: result.meta.message ?? 'User vocabulary sets retrieved successfully',
      }
    );
  }

  // Get user's favorite vocabulary sets (saved from community)
  @Get('packages/my/favorites')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: "Get user's favorite vocabulary sets",
    description: `
Retrieve paginated list of vocabulary sets that the user has saved/favorited from the community.

**Supported Query Parameters:**

**Pagination:**
- \`page\` - Page number (default: 1)
- \`pageSize\` - Items per page (default: 20, max: 100)

**Sorting:**
- Default: Sorted by favorited date (most recent first)

**Filtering:**
- \`language=en\` - Filter by language
- \`type=custom\` - Filter by type
- \`difficulty=intermediate\` - Filter by difficulty

**Search:**
- \`search=keyword\` - Search in title and description
    `,
  })
  @ApiJsonApiSuccessResponse({
    description: 'User favorite vocabulary sets retrieved successfully',
    resourceType: 'vocabulary-set',
  })
  async getUserFavorites(
    @auth.CurrentUser() user: auth.AuthUser,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(
      new GetUserFavoritesQuery(user.id, parsedParams)
    );

    const pagination =
      result.meta.pagination ?? {
        page: 1,
        limit: result.data.length || 20,
        total: result.data.length,
        totalPages: 1,
      };

    return createJsonApiPaginatedResponse(
      result.data,
      pagination.total,
      'vocabulary-set',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: result.meta.version ?? '1.0.0',
        message: result.meta.message ?? 'User favorite vocabulary sets retrieved successfully',
      }
    );
  }

  // Add vocabulary set to favorites
  @Post('packages/community/:id/favorite')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add vocabulary set to favorites',
    description: 'Add a community vocabulary set to the user\'s favorites list.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set added to favorites successfully',
    resourceType: 'favorite',
  })
  async addToFavorites(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') vocabularySetId: string,
    @Req() req: express.Request
  ) {
    await this.vocabularySetRepository.addFavorite(user.id, vocabularySetId);
    
    return convertEntityToJsonApi(
      { id: vocabularySetId, favorited: true, userId: user.id },
      'favorite',
      {
        message: 'Vocabulary set added to favorites successfully',
        version: '1.0.0',
        selfLink: getSelfLinkFromRequest(req, vocabularySetId),
      }
    );
  }

  // Remove vocabulary set from favorites
  @Delete('packages/community/:id/favorite')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remove vocabulary set from favorites',
    description: 'Remove a vocabulary set from the user\'s favorites list.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set removed from favorites successfully',
    resourceType: 'favorite',
  })
  async removeFromFavorites(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') vocabularySetId: string,
    @Req() req: express.Request
  ) {
    await this.vocabularySetRepository.removeFavorite(user.id, vocabularySetId);
    
    return convertEntityToJsonApi(
      { id: vocabularySetId, favorited: false, userId: user.id },
      'favorite',
      {
        message: 'Vocabulary set removed from favorites successfully',
        version: '1.0.0',
        selfLink: getSelfLinkFromRequest(req, vocabularySetId),
      }
    );
  }

  // Get entry/word details by ID
  @Get('entries/:entryId')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get word/entry details by ID',
    description: `
Get complete details of a vocabulary word/entry including all relationships.

**Returns:**
- Complete word information (word, pronunciation, part of speech, etc.)
- All senses (meanings) with definitions, synonyms, antonyms
- Example sentences with translations
- Related expressions/idioms
- Lexical variants (word forms)
- Tags, audio URL, source URL, notes
    `,
  })
  @ApiJsonApiSuccessResponse({
    description: 'Entry details retrieved successfully',
    resourceType: 'word',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Entry not found',
  })
  async getEntryDetail(
    @Param('entryId') entryId: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(new GetEntryDetailQuery(entryId));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'word', {
      selfLink,
      message: 'Entry details retrieved successfully',
      version: '1.0.0',
    });
  }

  // ==================== FLASHCARD/SRS LEARNING ENDPOINTS ====================

  // Get flashcard session (study session)
  @Get('packages/:id/flashcards/session')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get a flashcard study/review session',
    description: 'Retrieve all words in the vocabulary set with current user study progress and learning streak.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Flashcard session retrieved successfully',
    resourceType: 'flashcard-session',
  })
  async getFlashcardSession(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Query('reviewAll') reviewAll: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetFlashcardSessionQuery(user.id, id, reviewAll === 'true')
    );
    const selfLink = `${getSelfLinkFromRequest(req, id)}/flashcards/session`;
    return convertEntityToJsonApi(result, 'flashcard-session', {
      selfLink,
      message: 'Flashcard study session initialized successfully',
      version: '1.0.0',
    });
  }

  // Review a flashcard (Spaced Repetition SM-2 rating)
  @Post('packages/:id/flashcards/review')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Record a flashcard review rating (SRS update)',
    description: 'Update spaced repetition learning progress for a specific vocabulary item inside a set using SM-2 algorithm.',
  })
  @ApiBody({ type: ReviewFlashcardDto })
  @ApiJsonApiSuccessResponse({
    description: 'Flashcard review recorded and SRS parameters updated successfully',
    resourceType: 'flashcard-progress',
  })
  async reviewFlashcard(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: ReviewFlashcardDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new ReviewFlashcardCommand(user.id, id, dto.itemId, dto.quality)
    );
    const selfLink = `${getSelfLinkFromRequest(req, id)}/flashcards/review/${dto.itemId}`;
    return convertEntityToJsonApi(result, 'flashcard-progress', {
      selfLink,
      message: 'Flashcard review recorded successfully',
      version: '1.0.0',
    });
  }
}
