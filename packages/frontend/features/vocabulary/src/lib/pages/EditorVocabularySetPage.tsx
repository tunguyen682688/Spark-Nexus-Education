import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import EditorVocabularySetContainer from "../container/EditorVocabularySetContainer";
import { VocabularySetFormValues } from '../constants/editor';
import { useVocabularySet } from '../hooks/use-vocabulary-sets';
import { DifficultyLevel } from '../types';
import { 
  Skeleton, 
  Alert, 
  AlertTitle, 
  AlertDescription, 
  Button 
} from "@spark-nest-ed/frontend-shared-components";
import { AlertCircle } from "lucide-react";

const EditorVocabularySetPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // 1. Fetch Set Details
  const { 
    data: set, 
    isLoading: isLoadingSet, 
    isError: isErrorSet 
  } = useVocabularySet(id);

  // 3. Construct Form Data
  const initialData = useMemo<VocabularySetFormValues | undefined>(() => {
    if (!set) return undefined;

    return {
        title: set.title,
        description: set.description || "",
        visibility: set.isPublic ? "PUBLIC" : "PRIVATE",
        type: set.type,
        difficulty: set.difficulty || DifficultyLevel.BEGINNER,
        tags: set.tags,
        words: []
    };
  }, [set]);

  const isLoading = id ? isLoadingSet : false;
  const isError = id ? isErrorSet : false;

  if (isLoading) {
      return (
        <div className="p-4 space-y-8 max-w-full">
            <div className="flex flex-col border-b pb-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="flex space-x-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <div className="space-y-8">
                {/* Set Info Skeleton */}
                <div className="space-y-4 border rounded-lg p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Word List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  if (isError) {
      return (
        <div className="flex flex-col justify-center items-center h-[60vh] p-4 space-y-4">
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load vocabulary set. It might have been deleted or you don't have permission to view it.
                </AlertDescription>
            </Alert>
            <div className="flex space-x-4">
                <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        </div>
      );
  }

  return <EditorVocabularySetContainer setId={id} initialData={initialData} />;
}

export default EditorVocabularySetPage;