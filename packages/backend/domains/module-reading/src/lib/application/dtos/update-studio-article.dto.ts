import { PartialType } from '@nestjs/swagger';
import { CreateStudioArticleDto } from './create-studio-article.dto';

export class UpdateStudioArticleDto extends PartialType(CreateStudioArticleDto) {}
