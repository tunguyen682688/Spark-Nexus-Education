import { useNavigation } from 'react-router';
import { useEffect, useState } from 'react';

export const GlobalLoader = () => {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setProgress(30);
      const timer = setTimeout(() => setProgress(70), 300);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 transition-all duration-300 z-50"
      style={{ width: `${progress}%` }}
    />
  );
};
