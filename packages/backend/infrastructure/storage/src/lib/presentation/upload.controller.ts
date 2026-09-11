import { Controller, Post, Get, Put, Param, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as auth from '@spark-nest-ed/infrastructure-auth';
import { UploadService } from '../application/upload.service';
import { MEDIA_FILE_REPOSITORY } from '../domain/media-file.repository.interface';
import type { IMediaFileRepository } from '../domain/media-file.repository.interface';
import type { IObjectStorage } from '../domain/object-storage.interface';
import { LocalObjectStorage } from '../infrastructure/object-storage/local-object-storage';
import { Inject } from '@nestjs/common';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    @Inject(MEDIA_FILE_REPOSITORY) private readonly repo: IMediaFileRepository,
    @Inject('IObjectStorage') private readonly objectStorage: IObjectStorage,
  ) {}

  @Post('presigned')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Request a presigned upload URL' })
  async requestUpload(
    @Body() body: { fileName: string; contentType: string; contentLength: number; visibility?: 'public' | 'private' },
    @auth.CurrentUser() user: auth.AuthUser,
  ) {
    if (!body.fileName || !body.contentType || !body.contentLength) {
      throw new BadRequestException('fileName, contentType, contentLength are required');
    }

    return this.uploadService.requestUpload({
      fileName: body.fileName,
      contentType: body.contentType,
      contentLength: body.contentLength,
      visibility: body.visibility ?? 'public',
      ownerId: user.id,
    });
  }

  @Post('confirm/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Confirm upload completed' })
  async confirmUpload(@Param('id') id: string) {
    const mediaFile = await this.uploadService.confirmUpload(id);
    const plain = mediaFile.toPlainObject();
    return {
      ...plain,
      cdnUrl: this.uploadService.getFileUrl(mediaFile),
    };
  }

  @Put('local/*key')
  @ApiOperation({ summary: 'Upload file to local storage (dev mode)' })
  async uploadLocal(@Param('key') key: string, @Req() req: any) {
    if (!(this.objectStorage instanceof LocalObjectStorage)) {
      throw new BadRequestException('Local upload not supported in this storage mode');
    }

    const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10)) * 1024 * 1024;

    // Resolve the full file path and ensure directory exists
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Stream directly to disk with size limit — no in-memory buffering
    let totalSize = 0;
    const sizeGuard = new Transform({
      transform(chunk, _encoding, callback) {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          callback(new BadRequestException(`File exceeds maximum size of ${process.env.UPLOAD_MAX_SIZE_MB || '10'}MB`));
          return;
        }
        callback(null, chunk);
      },
    });

    const fileStream = fs.createWriteStream(filePath);
    try {
      await pipeline(req, sizeGuard, fileStream);
    } catch (err: any) {
      // Clean up partial file on error
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Upload failed: ${err?.message || err}`);
    }

    if (totalSize === 0) {
      fs.unlinkSync(filePath);
      throw new BadRequestException('Empty request body');
    }

    return { success: true, storageKey: key, size: totalSize };
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get file URL (public: CDN, private: signed URL)' })
  async getFileUrl(@Param('id') id: string) {
    const mediaFile = await this.repo.findById(id);
    if (!mediaFile) {
      throw new BadRequestException(`MediaFile ${id} not found`);
    }

    if (mediaFile.getVisibility() === 'private') {
      const url = await this.uploadService.getPrivateFileUrl(mediaFile);
      return { url, visibility: 'private' };
    }

    return { url: this.uploadService.getFileUrl(mediaFile), visibility: 'public' };
  }
}
