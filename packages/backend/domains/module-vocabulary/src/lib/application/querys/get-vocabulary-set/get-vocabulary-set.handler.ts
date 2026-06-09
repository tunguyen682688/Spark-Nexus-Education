import { IQueryHandler, QueryHandler, QueryBus } from "@nestjs/cqrs";
import { GetVocabularySetQuery } from "./get-vocabulary-set.query";
import { VocabularySetResponseDto } from "../../dtos/reponse-vocabulary-set.dto";
import { Inject, NotFoundException } from "@nestjs/common";
import * as vocabularySetRepositoryInterface from "../../../domain/repositories/vocabulary-set.repository.interface";
import { GetUserProfileQuery } from "@spark-nest-ed/module-user";


@QueryHandler(GetVocabularySetQuery)
export class GetVocabularySetQueryHandler implements IQueryHandler<GetVocabularySetQuery, VocabularySetResponseDto> {
    
    constructor(
        @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
        private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
        private readonly queryBus: QueryBus
    ) {}

    async execute(query: GetVocabularySetQuery): Promise<VocabularySetResponseDto> {
        const vocabularySet = await this.vocabularySetRepository.findById(query.id);
        
        if (!vocabularySet) {
            throw new NotFoundException('Vocabulary set not found');
        }

        const creatorId = vocabularySet.getUserId();
        let creatorProfile: { name: string | null; avatar: string | null } | null = null;

        try {
            const creator = await this.queryBus.execute<GetUserProfileQuery, any>(
                new GetUserProfileQuery(creatorId)
            );
            if (creator) {
                creatorProfile = { name: creator.name, avatar: creator.picture };
            }
        } catch (error) {
            // Gracefully fail and fallback
            console.error(`Failed to fetch user profile for ID ${creatorId}:`, error);
        }

        return {
            id: vocabularySet.getId(),
            title: vocabularySet.getTitle(),
            description: vocabularySet.getDescription(),
            language: vocabularySet.getLanguage().getValue(),
            type: vocabularySet.getType().getValue(),
            difficulty: vocabularySet.getDifficulty()?.getValue() || null,
            tags: vocabularySet.getTags(),
            coverImage: vocabularySet.getCoverImage(),
            isPublic: vocabularySet.getIsPublic(),
            isActive: vocabularySet.getIsActive(),
            entryCount: vocabularySet.getEntryCount(),
            favoriteCount: vocabularySet.getFavoriteCount(),
            studyCount: vocabularySet.getStudyCount(),
            importStatus: vocabularySet.getImportStatus(),
            importProgress: vocabularySet.getImportProgress(),
            createdAt: vocabularySet.getCreatedAt(),
            updatedAt: vocabularySet.getUpdatedAt(),
            userId: creatorId,
            creator: {
                id: creatorId,
                name: creatorProfile?.name || this.extractUserDisplayName(creatorId),
                avatar: creatorProfile?.avatar || null,
            },
        };
    }

    private extractUserDisplayName(userId: string): string {
        const parts = userId.split('|');
        return parts.length > 1 ? parts[1] : userId;
    }
}