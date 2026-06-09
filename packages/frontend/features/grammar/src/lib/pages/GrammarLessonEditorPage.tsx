import { useParams, useNavigate } from 'react-router-dom';
import {
  useGrammarLesson,
  useCreateGrammarLesson,
  useUpdateGrammarLesson,
} from '../hooks';
import GrammarLessonEditorContainer from '../container/GrammarLessonEditorContainer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button, useToast } from '@spark-nest-ed/frontend-shared-components';
import { SaveGrammarLessonDto } from '../types';

export const GrammarLessonEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const createLesson = useCreateGrammarLesson();
  const updateLesson = useUpdateGrammarLesson();
  
  const {
    data: lessonDetail,
    isLoading: isLoadingDetail,
    isError,
    refetch,
  } = useGrammarLesson(id);

  const handlePublish = async (payload: SaveGrammarLessonDto, isDraft: boolean) => {
    try {
      if (id) {
        await updateLesson.mutateAsync({ id, payload });
      } else {
        await createLesson.mutateAsync(payload);
      }

      toast({
        title: isDraft ? 'Đã lưu bản nháp! 📝' : 'Đã xuất bản thành công! 🌐',
        description: isDraft
          ? 'Đã lưu bản nháp bài học ngữ pháp thành công!'
          : 'Đã xuất bản bài học ngữ pháp mới lên lộ trình thành công!',
      });
      navigate('/grammar');
    } catch (err) {
      toast({
        title: 'Lỗi lưu bài học',
        description: 'Đã có lỗi xảy ra khi lưu bài học: ' + (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    navigate('/grammar');
  };

  if (id && isLoadingDetail) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          ĐANG TẢI CHI TIẾT BÀI HỌC...
        </p>
      </div>
    );
  }

  if (id && (isError || !lessonDetail)) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Không thể tải chi tiết bài học</h2>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Không tìm thấy bài học ngữ pháp được yêu cầu hoặc đã xảy ra lỗi kết nối.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/grammar')}
            variant="outline"
            className="border-slate-850 text-slate-405 hover:text-slate-205"
          >
            Quay lại lộ trình
          </Button>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold border-none"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GrammarLessonEditorContainer
      id={id}
      lessonDetail={lessonDetail}
      isSaving={createLesson.isPending || updateLesson.isPending}
      onPublish={handlePublish}
      onCancel={handleCancel}
    />
  );
};

export default GrammarLessonEditorPage;

