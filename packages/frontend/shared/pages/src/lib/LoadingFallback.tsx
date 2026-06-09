import { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Globe, Volume2 } from 'lucide-react';

const LoadingFallback = () => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  const loadingTips = [
    'Building your personalized learning path...',
    'Preparing interactive lessons...',
    'Loading vocabulary exercises...',
    'Setting up your progress tracker...',
    'Optimizing your learning experience...',
  ];

  const features = [
    { icon: BookOpen, label: 'Vocabulary', delay: '0ms' },
    { icon: Volume2, label: 'Listening', delay: '200ms' },
    { icon: Globe, label: 'Grammar', delay: '400ms' },
    { icon: Sparkles, label: 'Practice', delay: '600ms' },
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [ ]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse-soft" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
            <span className="text-3xl font-bold text-white animate-scale-in">E</span>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in">
          EnglishSelf
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Your journey to English mastery
        </p>

        {/* Feature icons */}
        <div className="flex gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center opacity-0 animate-fade-in"
              style={{ animationDelay: feature.delay }}
            >
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg mb-2 hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Loading...
            </span>
          </div>
        </div>

        {/* Loading tips */}
        <div className="h-12 flex items-center justify-center">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 animate-fade-in">
            {loadingTips[currentTip]}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>

        {/* Fun fact or motivational text */}
        <div className="mt-12 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 opacity-0 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Did you know?
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Learning just 15 minutes a day can significantly improve your English skills over time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
