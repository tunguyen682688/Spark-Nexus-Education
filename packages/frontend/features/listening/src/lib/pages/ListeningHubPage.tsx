import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useListeningMaterials, useListeningMaterialDetail } from '../hooks';
import ListeningCard from '../components/ListeningCard';
import BilingualAudioPlayer from '../components/BilingualAudioPlayer';
import { Search, Headset, Video, Award, PlayCircle, Library, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';

export default function ListeningHubPage() {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Map subroutes to tabs
  const getTabFromPath = (path: string): 'all' | 'podcast' | 'audio' | 'exam' | 'video' => {
    if (path.includes('/podcasts')) return 'podcast';
    if (path.includes('/videos')) return 'video';
    if (path.includes('/audiobooks')) return 'audio';
    if (path.includes('/practice')) return 'exam';
    return 'all';
  };

  const getPathFromTab = (tab: 'all' | 'podcast' | 'audio' | 'exam' | 'video'): string => {
    switch (tab) {
      case 'podcast': return '/listening/podcasts';
      case 'video': return '/listening/videos';
      case 'audio': return '/listening/audiobooks';
      case 'exam': return '/listening/practice';
      default: return '/listening';
    }
  };

  // Filters state
  const [activeTab, setActiveTab] = useState<'all' | 'podcast' | 'audio' | 'exam' | 'video'>(() => {
    return getTabFromPath(location.pathname);
  });

  // Keep tab in sync if the path changes (e.g. user clicks another sidebar item)
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: 'all' | 'podcast' | 'audio' | 'exam' | 'video') => {
    navigate(getPathFromTab(tab));
  };
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommunity, setIsCommunity] = useState<boolean | undefined>(undefined);

  // Fetch materials list
  const { data: materialsData, isLoading: isLoadingList, error: listError } = useListeningMaterials({
    category: activeTab === 'all' ? undefined : activeTab,
    difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
    isCommunity,
    q: searchQuery || undefined,
  });

  // Fetch active material details
  const { data: detailData, isLoading: isLoadingDetail } = useListeningMaterialDetail(
    selectedMaterialId || ''
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1': return 'border-green-500/35 text-green-400 bg-green-500/5';
      case 'A2': return 'border-green-500/35 text-green-400 bg-green-500/5';
      case 'B1': return 'border-blue-500/35 text-blue-400 bg-blue-500/5';
      case 'B2': return 'border-blue-500/35 text-blue-400 bg-blue-500/5';
      case 'C1': return 'border-purple-500/35 text-purple-400 bg-purple-500/5';
      case 'C2': return 'border-purple-500/35 text-purple-400 bg-purple-500/5';
      default: return 'border-slate-800 text-slate-400 bg-slate-900/35';
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: <Library className="w-4 h-4" /> },
    { id: 'podcast', label: 'Podcasts', icon: <Headset className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio bài học', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'exam', label: 'Luyện thi chứng chỉ', icon: <Award className="w-4 h-4" /> },
    { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  ] as const;

  const difficulties = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

  // Render detail view if a material is active
  if (selectedMaterialId) {
    return (
      <div className="h-[calc(100vh-2rem)] p-4 bg-slate-950 flex flex-col justify-center">
        {isLoadingDetail || !detailData ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm font-medium">Đang tải tài liệu nghe...</p>
          </div>
        ) : (
          <BilingualAudioPlayer
            material={detailData}
            onBack={() => setSelectedMaterialId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-purple-900/10 via-slate-900 to-slate-900 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Khám Phá Luyện Nghe
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 leading-tight">
              Khám phá Podcast, Audio, Bài thi, Video Luyện Nghe chuẩn chỉ
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Phát triển kỹ năng nghe tiếng Anh toàn diện với kho tệp âm thanh đa dạng cấp độ, tích hợp phụ đề chạy đồng bộ thời gian thực giúp bạn dễ dàng nghe, đọc và học từ vựng trực quan.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-md">
          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Dropdown Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search inputs */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, diễn giả, bài thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                Cấp độ:
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all uppercase ${
                      selectedDifficulty === diff
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : getDifficultyColor(diff)
                    }`}
                  >
                    {diff === 'all' ? 'Tất cả' : diff}
                  </button>
                ))}
              </div>

              {/* Source selection */}
              <select
                value={isCommunity === undefined ? 'all' : isCommunity ? 'community' : 'system'}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (val === 'all') setIsCommunity(undefined);
                  else if (val === 'community') setIsCommunity(true);
                  else setIsCommunity(false);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Mọi nguồn đóng góp</option>
                <option value="system">Spark Nexus</option>
                <option value="community">Cộng đồng đóng góp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content list Grid */}
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm font-medium">Đang tải danh sách bài nghe...</p>
          </div>
        ) : listError ? (
          <div className="text-center py-20 text-red-400 border border-red-500/10 bg-red-500/5 rounded-2xl">
            Có lỗi xảy ra khi tải danh sách. Vui lòng tải lại trang.
          </div>
        ) : !materialsData || materialsData.items.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/10 border border-slate-800 rounded-3xl text-slate-500">
            Không tìm thấy tài liệu luyện nghe nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materialsData.items.map((material) => (
              <ListeningCard
                key={material.id}
                material={material}
                onClick={setSelectedMaterialId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
