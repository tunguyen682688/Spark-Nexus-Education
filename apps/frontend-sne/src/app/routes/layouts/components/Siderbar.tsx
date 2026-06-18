import { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Sparkles,
  BookOpen,
  BookTemplate,
  BookAIcon,
  GraduationCap,
  Headphones,
  Mic,
  PenTool,
  Calendar,
  ChevronRight,
  ChevronDown,
  Brain,
  Users,
  PlayCircle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

interface SubMenuItem {
  label: string;
  path: string;
  badge?: string;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  badge?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: 'Trang chủ',
    path: ROUTES.DASHBOARD,
    badge: 'Mới',
  },
  // --- Kỹ năng chính (4 Skills) ---
  {
    icon: BookOpen,
    label: 'Đọc',
    path: ROUTES.READING.HUB,
    children: [
      { label: 'Thư viện của tôi', path: ROUTES.READING.MY_LIBRARY },
      { label: 'Khám phá', path: ROUTES.READING.EXPLORE, badge: 'Hot' },
      { label: 'Bài đọc', path: '/reading/articles' },
      { label: 'Sách & Truyện', path: ROUTES.READING.BOOKS },
      { label: 'Báo chí', path: ROUTES.READING.NEWS },
      { label: 'Lịch sử đọc', path: '/reading/history' },
      { label: 'Content Studio', path: ROUTES.READING.STUDIO, badge: 'Mới' },
    ],
  },
  {
    icon: Headphones,
    label: 'Nghe',
    path: '/listening',
    children: [
      { label: 'Podcast', path: '/listening/podcasts' },
      { label: 'Video học tập', path: '/listening/videos' },
      { label: 'Audio books', path: '/listening/audiobooks' },
      { label: 'Luyện nghe', path: '/listening/practice' },
      { label: 'Tin tức', path: '/listening/news' },
    ],
  },
  {
    icon: Mic,
    label: 'Nói',
    path: '/speaking',
    children: [
      { label: 'Luyện phát âm', path: '/speaking/pronunciation' },
      { label: 'Hội thoại', path: '/speaking/conversations' },
      { label: 'Ghi âm', path: '/speaking/recording' },
      { label: 'Đánh giá phát âm', path: '/speaking/assessment' },
    ],
  },
  {
    icon: PenTool,
    label: 'Viết',
    path: '/writing',
    children: [
      { label: 'Luyện viết', path: '/writing/practice' },
      { label: 'Chấm điểm tự động', path: '/writing/grading' },
      { label: 'Mẫu bài viết', path: '/writing/samples' },
      { label: 'Bài viết của tôi', path: '/writing/my-writings' },
    ],
  },
  // --- Bổ trợ kiến thức (Knowledge Base) ---
  {
    icon: BookAIcon,
    label: 'Từ vựng',
    children: [
      { label: 'Từ vựng cộng đồng', path: ROUTES.VOCABULARIES.COMMUNITY },
      { label: 'Từ vựng của tôi', path: ROUTES.VOCABULARIES.MY_VOCABULARY_SET },
    ],
  },
  {
    icon: GraduationCap,
    label: 'Ngữ pháp',
    path: '/grammar',
    children: [
      { label: 'Lộ trình ngữ pháp', path: '/grammar' },
      { label: 'Luyện tập ngữ pháp', path: '/grammar/practice' },
      { label: 'Phòng luyện đề', path: '/grammar/exams' },
      { label: 'Cộng đồng ngữ pháp', path: '/grammar/community' },
      { label: 'Sổ tay bẫy lỗi sai', path: '/grammar/trap-diary' },
      { label: 'Phân tích học tập', path: '/grammar/analytics' },
    ],
  },
  // --- Tài nguyên & Học tập (Resources) ---
  {
    icon: BookTemplate,
    label: 'Thư viện',
    path: ROUTES.LIBRARY,
    children: [
      { label: 'Tài liệu', path: '/library/documents' },
      { label: 'Sách', path: '/library/books' },
      { label: 'Video', path: '/library/videos' },
      { label: 'Yêu thích', path: '/library/favorites' },
    ],
  },
  {
    icon: Calendar,
    label: 'Kế hoạch học tập',
    path: '/study-plan',
    children: [
      { label: 'Kế hoạch của tôi', path: '/study-plan/my-plans' },
      { label: 'Lịch học', path: '/study-plan/schedule' },
      { label: 'Mục tiêu', path: '/study-plan/goals' },
    ],
  },
  {
    icon: Brain,
    label: 'Kiểm tra & Đánh giá',
    path: '/assessments',
    children: [
      { label: 'Bài kiểm tra', path: '/assessments/tests' },
      { label: 'Đánh giá trình độ', path: '/assessments/level-test' },
      { label: 'Lịch sử kiểm tra', path: '/assessments/history' },
      { label: 'Báo cáo kết quả', path: '/assessments/reports' },
    ],
  },
  // --- Cộng đồng & Giải trí (Community & Play) ---
  {
    icon: Users,
    label: 'Cộng đồng',
    path: '/community',
    children: [
      { label: 'Diễn đàn', path: '/community/forum' },
      { label: 'Nhóm học tập', path: '/community/study-groups' },
      { label: 'Chia sẻ', path: '/community/share' },
      { label: 'Thảo luận', path: '/community/discussions' },
    ],
  },
  {
    icon: PlayCircle,
    label: 'Trò chơi',
    path: '/games',
    children: [
      { label: 'Trò chơi từ vựng', path: '/games/vocabulary' },
      { label: 'Trò chơi ngữ pháp', path: '/games/grammar' },
      { label: 'Thử thách', path: '/games/challenges' },
      { label: 'Bảng xếp hạng', path: '/games/leaderboard' },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('sidebar_width');
      return savedWidth ? parseInt(savedWidth, 10) : 256;
    }
    return 256;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sync collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // Sync width state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_width', String(width));
  }, [width]);

  // Auto collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = width;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
      if (newWidth < 120) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        setWidth(Math.min(450, Math.max(200, newWidth)));
      }
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  }, [width]);

  const isActive = useCallback((path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  const isChildActive = (children?: SubMenuItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  // Auto-expand menu if any child is active
  useEffect(() => {
    const newExpanded = new Set<string>();
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => isActive(child.path));
        if (hasActiveChild) {
          newExpanded.add(item.label);
        }
      }
    });
    if (newExpanded.size > 0) {
      setExpandedMenus((prev) => new Set([...prev, ...newExpanded]));
    }
  }, [isActive, location.pathname]);

  const toggleMenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const active = isActive(item.path);
    const childActive = isChildActive(item.children);
    const isExpanded = expandedMenus.has(item.label);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    if (collapsed) {
      return (
        <div
          key={index}
          className="relative w-full flex justify-center animate-in fade-in duration-350"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <button
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              } else if (hasChildren && item.children && item.children.length > 0) {
                navigate(item.children[0].path);
              }
            }}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative',
              active || childActive
                ? 'bg-sidebar-accent text-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
            title={item.label}
          >
            <Icon className={cn('h-5 w-5', (active || childActive) && 'text-primary')} />
          </button>

          {(active || childActive) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
          )}

          {/* Floating Submenu Popover */}
          {hoveredIndex === index && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 transition-all duration-200 animate-in fade-in slide-in-from-left-2">
              <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">{item.label}</span>
              </div>
              {hasChildren && item.children ? (
                <div className="space-y-0.5 px-1.5">
                  {item.children.map((child, childIdx) => {
                    const childActive = isActive(child.path);
                    return (
                      <button
                        key={childIdx}
                        onClick={() => navigate(child.path)}
                        className={cn(
                          'w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 text-left',
                          childActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <span>{child.label}</span>
                        {child.badge && (
                          <Badge variant="secondary" className="ml-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] px-1 py-0">
                            {child.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                item.path && (
                  <div className="px-1.5">
                    <button
                      onClick={() => navigate(item.path!)}
                      className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground"
                    >
                      Mở trang
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      );
    }

    if (hasChildren) {
      return (
        <Collapsible
          key={index}
          open={isExpanded}
          onOpenChange={() => toggleMenu(item.label)}
        >
          <CollapsibleTrigger asChild>
            <button
              onClick={() => {
                if (!isExpanded && item.path) {
                  navigate(item.path);
                }
                toggleMenu(item.label);
              }}
              className={cn(
                'w-full flex items-center rounded-lg transition-all duration-200 group relative py-2.5 space-x-3',
                active || childActive || isExpanded
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                (active || childActive)
                  ? 'border-l-4 border-l-primary pl-2'
                  : 'px-3'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  (active || childActive) && 'text-primary'
                )}
              />
              <span className="font-medium text-sm flex-1 text-left truncate">
                {item.label}
              </span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5"
                >
                  {item.badge}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-4">
              {item.children?.map((child, childIndex) => {
                const childActive = isActive(child.path);
                return (
                  <button
                    key={childIndex}
                    onClick={() => navigate(child.path)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200',
                      childActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <span className="truncate">{child.label}</span>
                    {child.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0"
                      >
                        {child.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <button
        key={index}
        onClick={() => item.path && navigate(item.path)}
        className={cn(
          'w-full flex items-center rounded-lg transition-all duration-200 group relative py-2.5 space-x-3',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border-l-4 border-l-primary pl-2'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground px-3'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0',
            active && 'text-primary'
          )}
        />
        <span className="font-medium text-sm flex-1 text-left truncate">
          {item.label}
        </span>
        {item.badge && (
          <Badge
            variant="secondary"
            className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5"
          >
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col relative no-scrollbar',
        !isResizing && 'transition-all duration-300'
      )}
      style={{ width: collapsed ? '64px' : `${width}px` }}
    >
      <div className={cn("flex flex-col h-full space-y-4 overflow-hidden no-scrollbar", collapsed ? "py-4 px-2" : "p-4")}>
        {/* Create New Button */}
        {/* <div className={cn('transition-all', collapsed && 'px-2')}>
          <Button
            onClick={() => navigate('/create')}
            className={cn(
              'w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200',
              collapsed ? 'px-2' : 'px-4'
            )}
            size={collapsed ? 'icon' : 'default'}
          >
            <PlusSquare className={cn('h-5 w-5', !collapsed && 'mr-2')} />
            {!collapsed && <span>Tạo mới</span>}
          </Button>
        </div> */}

        {/* Navigation Menu Wrapper with Gradient Fade Masks */}
        <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden no-scrollbar">
          {/* Top Fade Mask */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-sidebar to-transparent pointer-events-none z-10" />

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-2">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </nav>

          {/* Bottom Fade Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10" />
        </div>

        {/* Pro Upgrade Card */}
        {!collapsed && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Nâng cấp Pro
                </h3>
                <p className="text-xs text-muted-foreground">
                  Mở khóa tất cả tính năng cao cấp
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(ROUTES.PLANS)}
              variant="outline"
              size="sm"
              className="w-full border-primary/20 hover:bg-primary/5"
            >
              Xem gói Pro
            </Button>
          </div>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("mt-auto flex-shrink-0", collapsed ? "mx-auto" : "self-start")}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <div className="h-5 w-5 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-current border-r-0 border-b-0 rotate-[-45deg]" />
            </div>
          ) : (
            <div className="h-5 w-5 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-current border-l-0 border-t-0 rotate-[-45deg]" />
            </div>
          )}
        </Button>
      </div>
      {/* Drag Resize Handle */}
      <div
        onMouseDown={startResizing}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 transition-colors z-50",
          isResizing && "bg-blue-500"
        )}
      />
    </aside>
  );
};

export default Sidebar;
