import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  Folder,
  BookMarked,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@spark-nest-ed/frontend-shared-components";
import { ROUTES } from "@spark-nest-ed/frontend-core-constants";
import { useDebounceValue } from "usehooks-ts";
import type { ApiQueryParams, SortSpec } from "@spark-nest-ed/frontend-core-api";
import {
  useMyCreatedSets,
  useMyFavoriteSets,
} from "../hooks/use-vocabulary-sets";
import { useCreateEmptyVocabularySet } from "../hooks/use-create-empty-vocabulary-set";
import { Language, VocabularySetType } from "../types";
import MyLibraryVocabularySetHeader from "../components/manager/MyLibraryVocabularySetHeader";
import MyLibraryLearningStatsCard, { type LearningStat } from "../components/manager/MyLibraryLearningStatsCard";
import MyLibraryVocabularySetFilters from "../components/manager/MyLibraryVocabularySetFilters";
import MyLibraryVocabularySetList from "../components/manager/MyLibraryVocabularySetList";
import MyLibraryVocabularySetPagination from "../components/manager/MyLibraryVocabularySetPagination";

const MyLibaryVocabularySetContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("sets");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term to avoid excessive API calls
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);

  // Create query parameters for created sets
  const createdSetsQueryParams = useMemo<ApiQueryParams>(() => {
    const resolvedSort: SortSpec[] = [
      { field: sortBy, direction: sortDirection },
    ];

    const filters: Exclude<
      ApiQueryParams["filters"],
      undefined | Array<unknown>
    > = {};

    if (selectedCategory) {
      filters.tags = [selectedCategory];
    }

    return {
      page: currentPage,
      pageSize: 10,
      sort: resolvedSort,
      search: debouncedSearchTerm || undefined,
      searchFields: debouncedSearchTerm ? ["title", "description"] : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    sortDirection,
  ]);

  // Create query parameters for favorites
  const favoritesQueryParams = useMemo<ApiQueryParams>(() => {
    const resolvedSort: SortSpec[] = [
      { field: "createdAt", direction: "desc" },
    ];

    const filters: Exclude<
      ApiQueryParams["filters"],
      undefined | Array<unknown>
    > = {};

    if (selectedCategory) {
      filters.tags = [selectedCategory];
    }

    return {
      page: currentPage,
      pageSize: 10,
      sort: resolvedSort,
      search: debouncedSearchTerm || undefined,
      searchFields: debouncedSearchTerm ? ["title", "description"] : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [currentPage, debouncedSearchTerm, selectedCategory]);

  // Fetch data based on active tab
  const {
    data: createdSetsData,
    isLoading: isLoadingCreated,
    error: createdSetsError,
  } = useMyCreatedSets(activeTab === "sets" ? createdSetsQueryParams : undefined);

  const {
    data: favoritesData,
    isLoading: isLoadingFavorites,
    error: favoritesError,
  } = useMyFavoriteSets(
    activeTab === "favorites" ? favoritesQueryParams : undefined
  );

  // Handle errors
  useEffect(() => {
    if (createdSetsError) {
      toast({
        title: "Error Loading Your Sets",
        description:
          "There was a problem loading your vocabulary sets. Please try again later.",
        variant: "destructive",
      });
    }
  }, [createdSetsError, toast]);

  useEffect(() => {
    if (favoritesError) {
      toast({
        title: "Error Loading Favorites",
        description:
          "There was a problem loading your favorite sets. Please try again later.",
        variant: "destructive",
      });
    }
  }, [favoritesError, toast]);

  // Extract data based on active tab
  const currentSets = useMemo(() => {
    if (activeTab === "sets") {
      return createdSetsData?.data ?? [];
    } else if (activeTab === "favorites") {
      return favoritesData?.data ?? [];
    }
    return [];
  }, [activeTab, createdSetsData, favoritesData]);

  const isLoading =
    (activeTab === "sets" && isLoadingCreated) ||
    (activeTab === "favorites" && isLoadingFavorites);

  const paginationMeta =
    activeTab === "sets"
      ? createdSetsData?.meta
      : activeTab === "favorites"
      ? favoritesData?.meta
      : undefined;

  // Get unique categories from current sets
  const categories = useMemo(() => {
    const allTags = currentSets.flatMap((set) => set.tags || []);
    return ["All", ...new Set(allTags)];
  }, [currentSets]);

  // Calculate learning stats from actual data
  const learningStats = useMemo<LearningStat[]>(() => {
    const allSets = createdSetsData?.data ?? [];
    const totalWords = allSets.reduce((sum, set) => sum + (set.entryCount || 0), 0);
    const totalSets = allSets.length;
    const totalFavorites = favoritesData?.data.length ?? 0;

    return [
      {
        title: "Words Mastered",
        value: totalWords,
        icon: <Check className="h-5 w-5" />,
        color:
          "text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "Currently Learning",
        value: 0, // TODO: Calculate from user progress when available
        icon: <Clock className="h-5 w-5" />,
        color:
          "text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
      },
      {
        title: "Vocabulary Sets",
        value: totalSets,
        icon: <Folder className="h-5 w-5" />,
        color:
          "text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
      },
      {
        title: "Saved Words",
        value: totalFavorites,
        icon: <BookMarked className="h-5 w-5" />,
        color:
          "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
      },
    ];
  }, [createdSetsData, favoritesData]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "All" ? null : category);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (sortField: string) => {
    if (sortField === "recent") {
      setSortBy("createdAt");
      setSortDirection("desc");
    } else if (sortField === "words") {
      setSortBy("entryCount");
      setSortDirection("desc");
    } else if (sortField === "progress") {
      setSortBy("entryCount");
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    if (sortBy === "createdAt") return "Recently Used";
    if (sortBy === "entryCount") return "Word Count";
    return "Progress";
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Create empty set and redirect to editor
  const createEmptySet = useCreateEmptyVocabularySet();

  // Handle create new set
  const handleCreateNewSet = async () => {
    try {
      await createEmptySet.mutateAsync({
        title: 'Untitled Vocabulary Set',
        language: Language.ENGLISH,
        type: VocabularySetType.FLASHCARD,
      });
    } catch (error) {
      // Error is already handled by the hook with toast notification
      console.error('Failed to create vocabulary set:', error);
    }
  };

  return (
    <div className="w-full">
      <MyLibraryVocabularySetHeader onCreateNewSet={handleCreateNewSet} />

      {/* Main Content */}
      <div className=" w-full mx-auto px-4 sm:px-6 lg:px-8">
        <MyLibraryLearningStatsCard stats={learningStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sets">Vocabulary Sets</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          {/* Vocabulary Sets Tab */}
          <TabsContent value="sets">
            <MyLibraryVocabularySetFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              categories={categories}
              onCategorySelect={handleCategorySelect}
              sortLabel={getSortLabel()}
              onSortChange={handleSortChange}
            />

            <MyLibraryVocabularySetList
              sets={currentSets}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onEmptyAction={handleCreateNewSet}
              emptyActionLabel="Create New Set"
              emptyTitle="No vocabulary sets found"
              emptyDescription="Create your first vocabulary set to get started"
            />

            {paginationMeta && paginationMeta.totalPages > 1 && (
              <MyLibraryVocabularySetPagination
                currentPage={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <MyLibraryVocabularySetFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              categories={categories}
              onCategorySelect={handleCategorySelect}
              sortLabel="Recently Added"
              onSortChange={handleSortChange}
            />

            <MyLibraryVocabularySetList
              sets={currentSets}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onEmptyAction={() => navigate(ROUTES.VOCABULARIES.COMMUNITY)}
              emptyActionLabel="Browse Community Lists"
              emptyTitle="No favorite sets found"
              emptyDescription="Explore community sets and save your favorites"
            />

            {paginationMeta && paginationMeta.totalPages > 1 && (
              <MyLibraryVocabularySetPagination
                currentPage={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLibaryVocabularySetContainer;
