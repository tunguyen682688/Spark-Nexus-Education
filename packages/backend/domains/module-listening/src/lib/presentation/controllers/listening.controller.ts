import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as auth from '@spark-nest-ed/infrastructure-auth';
import express from 'express';
import {
  convertEntityToJsonApi,
  getSelfLinkFromRequest,
  createJsonApiPaginatedResponse,
  getBaseUrlFromRequest,
  ApiJsonApiSuccessResponse,
  ApiJsonApiCreatedResponse,
  ApiJsonApiErrorResponse,
} from '@spark-nest-ed/shared-libs';

import { GetListeningMaterialsQueryDto } from '../../application/dtos/get-materials-query.dto';
import { UpdateListeningProgressDto } from '../../application/dtos/update-progress.dto';
import { VoteListeningMaterialDto } from '../../application/dtos/vote-material.dto';
import { CreateListeningMaterialDto } from '../../application/dtos/create-material.dto';

import { GetListeningMaterialsQuery } from '../../application/querys/get-materials/get-materials.query';
import { GetListeningMaterialDetailQuery } from '../../application/querys/get-material-detail/get-material-detail.query';
import { UpdateListeningProgressCommand } from '../../application/commands/update-progress/update-progress.command';
import { VoteListeningMaterialCommand } from '../../application/commands/vote-material/vote-material.command';
import { CreateListeningMaterialCommand } from '../../application/commands/create-material/create-material.command';

@ApiTags('Listening')
@Controller('listening')
export class ListeningController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('materials')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all listening materials (Podcasts, Audios, Videos, Exams)',
    description: 'Retrieves all active listening materials with filters and pagination.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Listening materials retrieved successfully',
    resourceType: 'listening-material',
  })
  async getMaterials(
    @Query() queryDto: GetListeningMaterialsQueryDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetListeningMaterialsQuery(queryDto, user.id)
    );

    return createJsonApiPaginatedResponse(
      result.data,
      result.meta.total,
      'listening-material',
      getBaseUrlFromRequest(req),
      result.meta,
      {
        message: 'Listening materials retrieved successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('materials/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get details of a specific listening material',
    description: 'Retrieves metadata, subtitles, and questions for a listening material.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Listening material details retrieved successfully',
    resourceType: 'listening-material-detail',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Material not found' })
  async getMaterialDetail(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetListeningMaterialDetailQuery(id, user.id)
    );

    return convertEntityToJsonApi(result, 'listening-material-detail', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Listening material details retrieved successfully',
      version: '1.0.0',
    });
  }

  @Post('materials/:id/progress')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update listening progress for a material',
    description: 'Updates completion percentage, pause timestamp, and spent time.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Listening progress updated successfully',
    resourceType: 'listening-progress',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Material not found' })
  async updateProgress(
    @Param('id') id: string,
    @Body() progressDto: UpdateListeningProgressDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new UpdateListeningProgressCommand(id, user.id, progressDto)
    );

    return convertEntityToJsonApi(result, 'listening-progress', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Listening progress updated successfully',
      version: '1.0.0',
    });
  }

  @Post('materials/:id/vote')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Upvote or downvote a listening material',
    description: 'Casts an upvote or downvote, or toggles it off.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Listening vote registered successfully',
    resourceType: 'listening-vote-result',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Material not found' })
  async voteMaterial(
    @Param('id') id: string,
    @Body() voteDto: VoteListeningMaterialDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new VoteListeningMaterialCommand(id, user.id, voteDto)
    );

    return convertEntityToJsonApi(result, 'listening-vote-result', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Listening vote registered successfully',
      version: '1.0.0',
    });
  }

  @Post('materials')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Contribute a new listening material',
    description: 'Creates a listening material (podcast, video, audio, exam) with subtitles/questions.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Listening material created successfully',
    resourceType: 'listening-material-detail',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async createMaterial(
    @Body() createDto: CreateListeningMaterialDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new CreateListeningMaterialCommand(createDto, user.id)
    );

    return convertEntityToJsonApi(result, 'listening-material-detail', {
      selfLink: getSelfLinkFromRequest(req, result.id),
      message: 'Listening material created successfully',
      version: '1.0.0',
    });
  }
}
