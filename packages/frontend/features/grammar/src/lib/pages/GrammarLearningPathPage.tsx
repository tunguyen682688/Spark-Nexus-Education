import { useNavigate } from "react-router-dom";
import { useGrammarRoadmap } from "../hooks";
import GrammarLearningPathContainer from "../container/GrammarLearningPathContainer";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@spark-nest-ed/frontend-shared-components";

export const GrammarLearningPathPage = () => {
  const navigate = useNavigate();
  const { data: roadmap, isLoading, isError, refetch } = useGrammarRoadmap();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          ĐANG TẢI LỘ TRÌNH NGỮ PHÁP...
        </p>
      </div>
    );
  }

  if (isError || !roadmap) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Không thể tải dữ liệu lộ trình</h2>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn.
        </p>
        <Button 
          onClick={() => refetch()} 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl border-none"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <GrammarLearningPathContainer
      roadmap={roadmap}
      onNavigateToCreate={() => navigate("/grammar/lessons/create")}
      onNavigateToLesson={(id, isDraft) => {
        if (isDraft) {
          navigate(`/grammar/lessons/${id}/edit`);
        } else {
          navigate(`/grammar/lessons/${id}`);
        }
      }}
    />
  );
};

export default GrammarLearningPathPage;
