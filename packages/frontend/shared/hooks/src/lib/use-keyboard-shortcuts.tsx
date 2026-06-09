import { useEffect } from 'react';

interface KeyboardShortcutProps {
  targetKey: string;
  onKeyDown: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({
  targetKey,
  onKeyDown,
  enabled = true,
}: KeyboardShortcutProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        onKeyDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, onKeyDown, enabled]);
}
