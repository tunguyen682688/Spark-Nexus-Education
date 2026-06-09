import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as auth from '@spark-nest-ed/infrastructure-auth';
import {
  convertEntityToJsonApi,
  getSelfLinkFromRequest,
  ApiJsonApiSuccessResponse,
  ApiJsonApiErrorResponse
} from '@spark-nest-ed/shared-libs';
import express from 'express';
import { GetUserProfileQuery } from '../../application/queries/get-user-profile/get-user-profile.query';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('me')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user from the local database.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'User profile retrieved successfully from local database',
    resourceType: 'user',
  })
  @ApiJsonApiErrorResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Not Found - User not synced in local database',
  })
  async getProfile(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(new GetUserProfileQuery(user.id));
    const selfLink = getSelfLinkFromRequest(req, 'me');
    return convertEntityToJsonApi(result, 'user', {
      selfLink,
      message: 'User profile retrieved successfully',
      version: '1.0.0',
    });
  }
}
