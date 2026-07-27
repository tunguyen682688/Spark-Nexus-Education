import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollectionEditorData } from './use-certification';

export interface EditorExam {
  id: string;
  number: number;
  title: string;
  subTitle: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Published' | 'Draft';
  iconType: string;
}

export interface EditorChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  examCount: number;
  exams: EditorExam[];
}

export interface CollectionDetailsForm {
  title: string;
  subtitle: string;
  description: string;
  level: string;
  tags: string[];
  visibility: 'Public' | 'Private';
  allowDownloads: boolean;
  coverImage: string;
  createdDate: string;
  lastUpdatedDate: string;
}

export function useCollectionEditorContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const collectionId = id || 'toeic-mastery-collection';

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useCollectionEditorData(collectionId);

  const [activeTab, setActiveTab] = useState<'Structure' | 'Settings' | 'Collaborators'>('Structure');
  const [activeChapterId, setActiveChapterId] = useState<string>('chap-1');
  const [newTagInput, setNewTagInput] = useState('');
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  // Form State
  const [details, setDetails] = useState<CollectionDetailsForm>({
    title: 'TOEIC Mastery Collection',
    subtitle: 'Comprehensive practice to master all TOEIC skills',
    description:
      'A complete collection of TOEIC practice tests covering all parts and skill levels. Perfect for learners who want to improve step by step and achieve a high score.',
    level: 'Beginner to Advanced',
    tags: ['TOEIC', 'Practice', 'Listening', 'Reading'],
    visibility: 'Public',
    allowDownloads: true,
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
    createdDate: 'May 10, 2024 10:15 AM',
    lastUpdatedDate: 'May 16, 2024 02:45 PM',
  });

  // Chapters State
  const [chapters, setChapters] = useState<EditorChapter[]>([
    {
      id: 'chap-1',
      number: 1,
      title: 'Part 1: Getting Started',
      description: 'Build a strong foundation with essential topics and easy-to-medium level exams.',
      examCount: 3,
      exams: [
        {
          id: 'exam-1',
          number: 1,
          title: 'TOEIC Practice Test 1',
          subTitle: 'Basic Concepts',
          questionsCount: 60,
          durationMinutes: 60,
          difficulty: 'Easy',
          status: 'Published',
          iconType: 'toeic',
        },
        {
          id: 'exam-2',
          number: 2,
          title: 'TOEIC Practice Test 2',
          subTitle: 'Daily Training',
          questionsCount: 60,
          durationMinutes: 60,
          difficulty: 'Easy',
          status: 'Published',
          iconType: 'toeic',
        },
        {
          id: 'exam-3',
          number: 3,
          title: 'TOEIC Practice Test 3',
          subTitle: 'Vocabulary Focus',
          questionsCount: 60,
          durationMinutes: 60,
          difficulty: 'Medium',
          status: 'Draft',
          iconType: 'toeic',
        },
      ],
    },
    {
      id: 'chap-2',
      number: 2,
      title: 'Part 2: Building Skills',
      description: 'Enhance your test-taking strategies with targeted skill-building tests.',
      examCount: 4,
      exams: [],
    },
    {
      id: 'chap-3',
      number: 3,
      title: 'Part 3: Improving Accuracy',
      description: 'Master tough question patterns and avoid common traps.',
      examCount: 4,
      exams: [],
    },
    {
      id: 'chap-4',
      number: 4,
      title: 'Part 4: Advanced Practice',
      description: 'Simulate high-pressure exam environments.',
      examCount: 5,
      exams: [],
    },
    {
      id: 'chap-5',
      number: 5,
      title: 'Full Length Tests',
      description: 'Full 2-hour 200 question mock examinations.',
      examCount: 6,
      exams: [],
    },
  ]);

  useEffect(() => {
    if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
      const record = apiData as Record<string, unknown>;
      if (record['details'] && typeof record['details'] === 'object') {
        setDetails((prev) => ({ ...prev, ...(record['details'] as Partial<CollectionDetailsForm>) }));
      }
      if (record['chapters'] && Array.isArray(record['chapters'])) {
        setChapters(record['chapters'] as EditorChapter[]);
      }
    }
  }, [apiData]);

  // Selected Active Chapter
  const activeChapter = useMemo(() => {
    return chapters.find((ch) => ch.id === activeChapterId) || chapters[0];
  }, [chapters, activeChapterId]);

  // Summary Metrics Computation
  const summary = useMemo(() => {
    const totalChapters = chapters.length;
    let totalExams = 0;
    let totalQuestions = 0;
    let totalMinutes = 0;

    chapters.forEach((ch) => {
      totalExams += ch.exams.length > 0 ? ch.exams.length : ch.examCount;
      ch.exams.forEach((ex) => {
        totalQuestions += ex.questionsCount;
        totalMinutes += ex.durationMinutes;
      });
    });

    if (totalQuestions === 0) totalQuestions = 1320;
    if (totalMinutes === 0) totalMinutes = 1320; // 22 hours

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      totalChapters,
      totalExams: totalExams || 22,
      totalQuestions,
      estimatedDurationText: `${hours}h ${mins}m`,
      difficultyMix: {
        easy: 45,
        medium: 40,
        hard: 15,
      },
    };
  }, [chapters]);

  // Handlers
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newChap: EditorChapter = {
      id: `chap-${Date.now()}`,
      number: nextNum,
      title: `Part ${nextNum}: New Chapter`,
      description: 'Add essential exams and topic guides for learners.',
      examCount: 0,
      exams: [],
    };
    setChapters((prev) => [...prev, newChap]);
    setActiveChapterId(newChap.id);
  };

  const handleUpdateActiveChapterTitle = (newTitle: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === activeChapterId ? { ...ch, title: newTitle } : ch))
    );
  };

  const handleUpdateActiveChapterDescription = (newDesc: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === activeChapterId ? { ...ch, description: newDesc } : ch))
    );
  };

  const handleAddExamToChapter = () => {
    if (!activeChapter) return;
    const nextExamNum = activeChapter.exams.length + 1;
    const newExam: EditorExam = {
      id: `exam-${Date.now()}`,
      number: nextExamNum,
      title: `TOEIC Practice Test ${nextExamNum}`,
      subTitle: 'Custom Practice Set',
      questionsCount: 60,
      durationMinutes: 60,
      difficulty: 'Easy',
      status: 'Draft',
      iconType: 'toeic',
    };
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === activeChapterId
          ? {
              ...ch,
              exams: [...ch.exams, newExam],
              examCount: ch.exams.length + 1,
            }
          : ch
      )
    );
  };

  const handleRemoveExamFromChapter = (examId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === activeChapterId
          ? {
              ...ch,
              exams: ch.exams.filter((ex) => ex.id !== examId),
              examCount: Math.max(0, ch.exams.length - 1),
            }
          : ch
      )
    );
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDetails((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!details.tags.includes(newTagInput.trim())) {
        setDetails((prev) => ({
          ...prev,
          tags: [...prev.tags, newTagInput.trim()],
        }));
      }
      setNewTagInput('');
    }
  };

  const handleSaveDraft = () => {
    window.alert('Collection draft saved successfully!');
  };

  const handlePublishCollection = () => {
    window.alert('Collection published successfully to the marketplace!');
  };

  const handlePreviewCollection = () => {
    navigate(`/certification/collections/${collectionId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/certification/creator-dashboard');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    activeChapterId,
    setActiveChapterId,
    activeChapter,
    chapters,
    details,
    setDetails,
    summary,
    newTagInput,
    setNewTagInput,
    isDetailsCollapsed,
    setIsDetailsCollapsed,
    handleAddChapter,
    handleUpdateActiveChapterTitle,
    handleUpdateActiveChapterDescription,
    handleAddExamToChapter,
    handleRemoveExamFromChapter,
    handleRemoveTag,
    handleAddTag,
    handleSaveDraft,
    handlePublishCollection,
    handlePreviewCollection,
    handleBackToDashboard,
  };
}
