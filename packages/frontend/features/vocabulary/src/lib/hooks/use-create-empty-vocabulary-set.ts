/**
 * Hook for creating an empty vocabulary set with redirect and toast notification.
 *
 * Features:
 * - Creates an empty vocabulary set with minimal required fields
 * - Automatically redirects to update page with created set ID
 * - Shows comprehensive toast notifications (success, error, loading)
 * - Handles loading states properly
 *
 * Usage:
 * ```tsx
 * const createEmptySet = useCreateEmptyVocabularySet();
 * 
 * const handleCreate = async () => {
 *   await createEmptySet.mutateAsync({
 *     title: 'My New Vocabulary Set',
 *     language: 'en',
 *     type: 'flashcard',
 *   });
 * };
 * ```
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import type { CreateVocabularySetDto, VocabularySet } from '../types';
import { useCreateVocabularySet } from './use-vocabulary-sets';

interface UseCreateEmptyVocabularySetOptions {
  /**
   * Optional callback after successful creation
   */
  onSuccess?: (set: VocabularySet) => void;
  /**
   * Optional callback on error
   */
  onError?: (error: Error) => void;
  /**
   * Whether to show toast notifications (default: true)
   */
  showToast?: boolean;
  /**
   * Whether to auto-redirect to update page (default: true)
   */
  autoRedirect?: boolean;
}
export type UseCreateEmptyVocabularySetReturn = {
    mutate: (payload: CreateVocabularySetDto) => void;
    mutateAsync: (payload: CreateVocabularySetDto) => Promise<VocabularySet>;   
    isLoading: boolean;
    error: Error | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    reset: () => void;
};
export function useCreateEmptyVocabularySet(
  options: UseCreateEmptyVocabularySetOptions = {}
) : UseCreateEmptyVocabularySetReturn {
  const {
    onSuccess,
    onError,
    showToast = true,
    autoRedirect = true,
  } = options;

  const navigate = useNavigate();
  const { toast } = useToast();
  const createSet = useCreateVocabularySet();

  const handleCreateEmptySet = useCallback(
    async (payload: CreateVocabularySetDto) => {
      if (showToast) {
        toast({
          title: 'Creating vocabulary set...',
          description: 'Please wait while we create your new vocabulary set.',
        });
      }

      try {
        const createdSet = await createSet.mutateAsync(payload);

        if (showToast) {
          toast({
            title: 'Success! 🎉',
            description: `Vocabulary set "${createdSet.title}" created successfully. Redirecting to editor...`,
            variant: 'default',
          });
        }

        // Execute user callback if provided
        onSuccess?.(createdSet);

        // Auto-redirect to update page
        if (autoRedirect) {
          setTimeout(() => {
            navigate(ROUTES.VOCABULARIES.UPDATE.replace(':id', createdSet.id));
          }, 500);
        }

        return createdSet;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create vocabulary set';

        if (showToast) {
          toast({
            title: 'Error creating vocabulary set',
            description: errorMessage,
            variant: 'destructive',
          });
        }

        // Execute user error callback if provided
        onError?.(error instanceof Error ? error : new Error(errorMessage));

        throw error;
      }
    },
    [createSet, navigate, toast, showToast, autoRedirect, onSuccess, onError]
  );

  const normalizedStatus: UseCreateEmptyVocabularySetReturn['status'] =
    createSet.status === 'pending' ? 'loading' : createSet.status;

  return {
    /**
     * Mutate function to create empty vocabulary set
     */
    mutate: createSet.mutate,
    /**
     * Async mutate function to create empty vocabulary set
     */
    mutateAsync: handleCreateEmptySet,
    /**
     * Loading state
     */
    isLoading: createSet.isPending,
    /**
     * Error state
     */
    error: createSet.error,
    /**
     * Status of mutation
     */
    status: normalizedStatus,
    /**
     * Reset mutation state
     */
    reset: createSet.reset,
  };
}
