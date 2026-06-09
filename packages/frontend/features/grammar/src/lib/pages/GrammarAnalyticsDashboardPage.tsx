import { useNavigate } from "react-router-dom";
import { GrammarAnalyticsDashboardContainer } from "../container/GrammarAnalyticsDashboardContainer";

export const GrammarAnalyticsDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <GrammarAnalyticsDashboardContainer
        onBack={() => navigate("/grammar")}
      />
    </div>
  );
};

export default GrammarAnalyticsDashboardPage;
