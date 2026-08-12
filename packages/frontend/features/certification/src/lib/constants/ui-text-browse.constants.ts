export const CERTIFICATION_UI_TEXT = {
  trending: {
    title: 'Trending Collections 🔥',
    subtitle:
      "Most popular collections this week based on learners' activity and engagement.",
    leaderboardTitle: 'Live Trending Leaderboard',
    whyTrendingTitle: 'Why These Collections Are Trending?',
    noMatchFilter: 'No trending collections match your filter.',
    tableHeaders: {
      rank: 'Rank',
      collection: 'Collection',
      exam: 'Exam',
      trend: 'Trend',
      action: 'Action',
    },
    reasons: {
      highCompletion: 'High Completion Rate',
      highCompletionDesc:
        'These collections have high mock completion rates this week.',
      popularLearners: 'Popular Among Learners',
      popularLearnersDesc:
        'Many active learners are starting and enjoying these collections.',
      topRated: 'Top Rated by Community',
      topRatedDesc: 'High ratings and positive reviews from our learners.',
      examAligned: 'Aligned with Exam Trends',
      examAlignedDesc: 'Based on the latest exam patterns and updates.',
    },
  },
  community: {
    title: 'Bộ sưu tập cộng đồng',
    subtitle:
      'Các bộ đề thi được tạo và chia sẻ bởi người học từ khắp nơi trên thế giới.',
    stats: {
      collections: 'Bộ sưu tập cộng đồng',
      collectionsDesc: 'Chia sẻ toàn cầu',
      rating: 'Đánh giá trung bình',
      ratingDesc: 'Từ nhận xét người học',
      downloads: 'Lượt tải về',
      downloadsDesc: 'Tổng số lượt sao chép',
      feedback: 'Phản hồi tích cực',
      feedbackDesc: 'Từ người luyện thi',
    },
    topContributors: 'Bảng xếp hạng đóng góp cộng đồng',
    noMatchFilter: 'Không có bộ sưu tập cộng đồng nào phù hợp với bộ lọc.',
  },
  editorialPicks: {
    title: "Editor's Picks 🎯",
    subtitle:
      'Hand-picked collections by language experts for maximum score improvement and efficiency.',
    badgeTag: 'HAND-PICKED BY EXPERTS',
    badges: {
      expertCurated: 'Expert Curated',
      expertCuratedDesc: 'Selected by exam specialists with proven results',
      qualityAssured: 'Quality Assured',
      qualityAssuredDesc: 'Strict quality standards and regular updates',
      provenEffective: 'Proven Effective',
      provenEffectiveDesc: 'High completion & success rate by learners',
      bestValue: 'Best Value',
      bestValueDesc: 'Most comprehensive content at the best value',
    },
    noMatchFilter: 'No editorial picks match your current filters.',
  },
} as const;
